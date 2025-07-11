
import { createStripeCheckoutSession,verifyStripeWebHook,retrieveStripeSession,retrievePaymentIntent } from "../../services/stripe/stripe.js"
import Order from '../../models/product/order.model.js';
import Cart from '../../models/cart.model.js';
import { getCartIdentifier } from "../../services/cartIdentifier.js";
import dotenv from 'dotenv';
import stripe from '../../services/stripe/stripe.js'
import mongoose from 'mongoose';
import { mutateStock } from "../../services/stripe/mutateStock.js";
import Product from "../../models/product/product.model.js";


dotenv.config();





export const createCheckoutSession = async (req, res) => {
    try {
        const identifier = getCartIdentifier(req);

        if (!identifier) {
            return res.status(400).json({ message: "Cart identifier is required" });
        }

        const cart = await Cart.findOne(
            identifier.type === 'user' ? { user: identifier.id } : { sessionId: identifier.id }
        ).populate('items.product');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty or not found" });
        };

        

        const cartItems = cart.items.map(item => {
         const product = item.product;

  if (!product || !product._id) {
    throw new Error("Product not properly populated in cart item");
  }

  // Match the selected variation
  const selectedVariation = product.variations.find(
    v => v.variantSKU.toLowerCase() === item.variation.toLowerCase()
  );

  if (!selectedVariation) {
    throw new Error(`Variation '${item.variation}' not found for product '${product.title}'`);
  }

  const price = selectedVariation.discountPrice > 0
    ? selectedVariation.discountPrice
    : selectedVariation.price;

    

  return {
    product: {
      _id: product._id.toString(),
      name: product.title,
      description: product.description || '',
      image: product.images?.[0]?.url || ''
    },
    variation: selectedVariation.variantSKU || null,
    quantity: item.quantity,
    price,
    discountPrice: selectedVariation.discountPrice || 0,
    
  };
});


        const session = await createStripeCheckoutSession({
            user: identifier.type === 'user' ? { _id: identifier.id, email: req.user?.email || '' } : null,
            cartItems,
            successUrl: `${process.env.CLIENT_URL}/order/success`,
            cancelUrl: `${process.env.CLIENT_URL}/cart`,
        });

        res.status(200).json({ sessionId: session.id ,
            url:session.url
        });

    } catch (error) {
        console.error("Error creating checkout session:", error.message);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


//////////////////////////////////////////////////////////////////////////

// export const createOrder = async (req, res) => {
//   try {
//     const identifier = getCartIdentifier(req);
//     if (!identifier) {
//       return res.status(400).json({ message: "User/session identifier not found" });
//     }


//      const sessionId = req.body.sessionId;
//     if (!sessionId) {
//       return res.status(400).json({ message: "Missing Stripe sessionId in request body" });
//     }

//     const cart = await Cart.findOne(
//       identifier.type === 'user' ? { user: identifier.id } : { sessionId: identifier.id }
//     ).populate({ path: 'items.product', select: 'title description images variations'});


//     if (!cart || cart.items.length === 0) {
//       return res.status(400).json({ message: "Cart is empty" });
//     }

//     const linesForStock = []

//     const items = cart.items.map(item => {
//     const product = item.product;

//      if (!product || !product._id) {
//       throw new Error("Product not properly populated in cart item");
//      }

//   // Match the selected variation
//   const selectedVariation = product.variations.find(
//     v => v.variantSKU.toLowerCase() === item.variation.toLowerCase()
//   );

//   if (!selectedVariation) {
//     throw new Error(`Variation '${item.variation}' not found for product '${product.title}'`);
//   }

//   const price = selectedVariation.discountPrice > 0
//     ? selectedVariation.discountPrice
//     : selectedVariation.price;

//     linesForStock.push({
//       productId: product._id.toString(),
//       sku: selectedVariation.variantSKU,
//       qty: item.quantity
//     });

   


//     const total = price * item.quantity;

//  return {
//     product: {
//       _id: product._id.toString(),
//       title: product.title,
//       description: product.description || '',
//       image: product.images?.[0]?.url || ''
//     },
//     variation: {
//       material: selectedVariation.attributes.material,
//       color: selectedVariation.attributes.color,
//       price,
//       discountPrice: selectedVariation.discountPrice || 0,
//       sku: selectedVariation.variantSKU,
//       images: selectedVariation.images || []
//     },
//     quantity: item.quantity,
//     total
//   };
// });
// //////
    
//     const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

//     const order = new Order({
//       user: identifier.type === 'user' ? identifier.id : null,
//       sessionId: identifier.type === 'guest' ? identifier.id : null,
//       items,
//       shippingAddress: req.body.shippingAddress || {},
//       billingAddress: req.body.billingAddress || {},
//       totalAmount,
//       isGuestOrder: identifier.type === 'guest',
//       payment: {
//         method: capitalize(req.body.paymentMethod || 'Stripe'),
//         status: 'Pending',
//         sessionId:req.body.sessionId ,
//       },
//       notes: req.body.notes || '',
//       linesForStock,
//     });

//     await order.save();
//     await Cart.deleteOne({ _id: cart._id });

//     res.status(201).json({ message: "Order created successfully", orderId: order._id.toString() ,data:order});
//   } catch (error) {
//     console.error("Error creating order:", error);
//     res.status(500).json({ message: "Internal server error", error: error.message });
//   }
// };


// function capitalize(str) {
//   return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
// }






///////////////////////////////////////////////////////////////////////


// Stripe Webhook Handler
// export const handleStripeWebhook = async (req, res) => {
//   try {
//     const event = await verifyStripeWebHook(req, res);

//     if (event.type === "checkout.session.completed") {
//       const session = event.data.object;
//       const metadata = session.metadata;

//       const cartItems = JSON.parse(metadata.cartItems || "[]");
//       const userId = metadata.userId;
//       const email = session.customer_email;

//       const linesForStock = cartItems.map(item => ({
//         productId: item.productId,
//         sku: item.variation,
//         qty: item.quantity,
//       }));

//       // You can also fetch full product details from DB if needed

//       const order = new Order({
//         user: userId !== "guest" ? userId : null,
//         sessionId: userId === "guest" ? session.id : null,
//         items: cartItems.map(item => ({
//           product: { _id: item.productId },
//           variation: { sku: item.variation },
//           quantity: item.quantity,
//           total: 0, // Add pricing logic if needed
//         })),
//         totalAmount: 0, // Add total calc here
//         isGuestOrder: userId === "guest",
//         payment: {
//           method: "Stripe",
//           status: "Paid",
//           sessionId: session.id,
//         },
//         linesForStock,
//       });

//       await order.save();
//       await mutateStock(linesForStock, "decrease");

//       // You can also remove cart here if user is known
//       if (userId !== "guest") {
//         await Cart.deleteOne({ user: userId });
//       }

//       console.log("✅ Order created from webhook:", order._id);
//     }

//     res.status(200).json({ received: true });
//   } catch (error) {
//     console.error("Webhook Error:", error);
//     res.status(400).send(`Webhook Error: ${error.message}`);
//   }
// };

//////////////////

// export const createOrder = async (req, res) => {
//   try {
//     const identifier = getCartIdentifier(req);
//     if (!identifier) {
//       return res
//         .status(400)
//         .json({ message: "User/session identifier not found" });
//     }

//     const sessionId = req.body.sessionId;
//     if (!sessionId) {
//       return res
//         .status(400)
//         .json({ message: "Missing Stripe sessionId in request body" });
//     }

//     const cart = await Cart.findOne(
//       identifier.type === "user"
//         ? { user: identifier.id }
//         : { sessionId: identifier.id }
//     ).populate({
//       path: "items.product",
//       select: "title description images variations",
//     });

//     if (!cart || cart.items.length === 0) {
//       return res.status(400).json({ message: "Cart is empty" });
//     }

//     const linesForStock = [];

//     const items = cart.items.map((item) => {
//       const product = item.product;

//       const selectedVariation = product.variations.find(
//         (v) =>
//           v.variantSKU.toLowerCase() === item.variation.toLowerCase()
//       );

//       const price =
//         selectedVariation.discountPrice > 0
//           ? selectedVariation.discountPrice
//           : selectedVariation.price;

//       linesForStock.push({
//         productId: product._id.toString(),
//         sku: selectedVariation.variantSKU,
//         qty: item.quantity,
//       });

//       const total = price * item.quantity;

//       return {
//         product: {
//           _id: product._id.toString(),
//           title: product.title,
//           description: product.description || "",
//           image: product.images?.[0]?.url || "",
//         },
//         variation: {
//           material: selectedVariation.attributes.material,
//           color: selectedVariation.attributes.color,
//           price,
//           discountPrice: selectedVariation.discountPrice || 0,
//           sku: selectedVariation.variantSKU,
//           images: selectedVariation.images || [],
//         },
//         quantity: item.quantity,
//         total,
//       };
//     });

//     const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

//     const order = new Order({
//       user: identifier.type === "user" ? identifier.id : null,
//       sessionId: identifier.type === "guest" ? identifier.id : null,
//       items,
//       shippingAddress: req.body.shippingAddress || {},
//       billingAddress: req.body.billingAddress || {},
//       totalAmount,
//       isGuestOrder: identifier.type === "guest",
//       payment: {
//         method: capitalize(req.body.paymentMethod || "Stripe"),
//         status: "Pending",
//         sessionId,
//       },
//       notes: req.body.notes || "",
//       linesForStock,
//     });

//     await order.save();
//     await mutateStock(linesForStock, "decrease");
//     await Cart.deleteOne({ _id: cart._id });

//     res.status(201).json({
//       message: "Order created successfully",
//       orderId: order._id.toString(),
//       data: order,
//     });
//   } catch (error) {
//     console.error("Error creating order:", error);
//     res.status(500).json({ message: "Internal server error", error: error.message });
//   }
// };

// function capitalize(str) {
//   return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
// }

///////////////////////////
// export const handleStripeWebhook = async (req, res) => {
//   try {
//     const event = await verifyStripeWebHook(req, res);

//     if (event.type === "checkout.session.completed") {
//       const session = event.data.object;
//       const metadata = session.metadata;

//       console.log("✅ Stripe payment completed:", session.id);

//       const cartItems = JSON.parse(metadata.cartItems || "[]");
//       const userId = metadata.userId;
//       const isGuest = userId === "guest";

//       const linesForStock = [];
//       const orderItems = [];

//       let totalAmount = 0;

//       for (const item of cartItems) {
//         const product = await Product.findById(item.productId);
//         if (!product) {
//           console.warn(`❌ Product not found: ${item.productId}`);
//           continue;
//         }

//         const variation = product.variations.find(
//           (v) => v.variantSKU.toLowerCase() === item.variation.toLowerCase()
//         );

//         if (!variation) {
//           console.warn(`❌ Variation not found: ${item.variation}`);
//           continue;
//         }

//         const price =
//           variation.discountPrice && variation.discountPrice > 0
//             ? variation.discountPrice
//             : variation.price;

//         const itemTotal = price * item.quantity;
//         totalAmount += itemTotal;

//         linesForStock.push({
//           productId: product._id.toString(),
//           sku: variation.variantSKU,
//           qty: item.quantity,
//         });

//         orderItems.push({
//           product: {
//             _id: product._id.toString(),
//             title: product.title,
//             description: product.description || "",
//             image: product.images?.[0]?.url || "",
//           },
//           variation: {
//             material: variation.attributes?.material || "",
//             color: variation.attributes?.color || "",
//             price,
//             discountPrice: variation.discountPrice || 0,
//             sku: variation.variantSKU,
//             images: variation.images || [],
//           },
//           quantity: item.quantity,
//           total: itemTotal,
//         });
//       }

//       const order = new Order({
//         user: isGuest ? null : userId,
//         sessionId: isGuest ? session.id : null,
//         items: orderItems,
//         totalAmount,
//         isGuestOrder: isGuest,
//         shippingAddress: {}, // Stripe doesn't give these unless you use shipping
//         billingAddress: {},  // You could store in metadata if needed
//         payment: {
//           method: "Stripe",
//           status: "Paid",
//           sessionId: session.id,
//         },
//         linesForStock,
//         notes: "", // You can pass via metadata if needed
//       });

//       await order.save();
//       await mutateStock(linesForStock, "decrease");

//       // Clean up cart
//       if (!isGuest) {
//         await Cart.deleteOne({ user: userId });
//       }

//       console.log("✅✅ ORDER CREATED SUCCESSFULLY ✅✅");
// console.log("🆔 Order ID:", order._id.toString());
// console.log("💳 Stripe Session ID:", session.id);

//     }

//     res.status(200).json({ received: true });
//   } catch (error) {
//     console.error("❌ Webhook error:", error);
//     res.status(400).send(`Webhook Error: ${error.message}`);
//   }
// };


export const handleStripeWebhook = async (req, res) => {
  try {
    const event = await verifyStripeWebHook(req, res);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const metadata = session.metadata;

      console.log(" Stripe payment completed:", session.id);

      const cartItems = JSON.parse(metadata.cartItems || "[]");
      const userId = metadata.userId;
      const isGuest = userId === "guest";

      console.log(" Parsed cartItems from metadata:", cartItems);

      const linesForStock = [];
      const orderItems = [];

      let totalAmount = 0;

      for (const item of cartItems) {
        const product = await Product.findById(item.productId);
        if (!product) {
          console.warn(`Product not found: ${item.productId}`);
          continue;
        }

        const variation = product.variations.find(
          (v) => v.variantSKU.toLowerCase() === item.variation.toLowerCase()
        );

        if (!variation) {
          console.warn(` Variation not found: ${item.variation}`);
          continue;
        }

        const price =
          variation.discountPrice && variation.discountPrice > 0
            ? variation.discountPrice
            : variation.price;

        const itemTotal = price * item.quantity;
        totalAmount += itemTotal;

        linesForStock.push({
          productId: product._id.toString(),
          sku: variation.variantSKU,
          qty: item.quantity,
        });

        orderItems.push({
          product: {
            _id: product._id.toString(),
            title: product.title,
            description: product.description || "",
            image: product.images?.[0]?.url || "",
          },
          variation: {
            material: variation.attributes?.material || "",
            color: variation.attributes?.color || "",
            price,
            discountPrice: variation.discountPrice || 0,
            sku: variation.variantSKU,
            images: variation.images || [],
          },
          quantity: item.quantity,
          total: itemTotal,
        });
      }

      const order = new Order({
        user: isGuest ? null : userId,
        sessionId: isGuest ? session.id : null,
        items: orderItems,
        totalAmount,
        isGuestOrder: isGuest,
        shippingAddress: session.shipping_details?.address || {},
        billingAddress: session.customer_details?.address || {},
        payment: {
          method: "Stripe",
          status: "Paid",
          sessionId: session.id,
        },
        linesForStock,
        notes: metadata.notes || "",
      });

      await order.save();
      await mutateStock(linesForStock, "decrease");

      if (!isGuest) {
        await Cart.deleteOne({ user: userId });
      }

      console.log(" ORDER CREATED SUCCESSFULLY ");
      console.log(" Order ID:", order._id.toString());
      console.log(" Stripe Session ID:", session.id);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error(" Webhook error:", error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};




//////////////////////////


export const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order ID format" });
    }

    const order = await Order.findById(orderId).populate('user').lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 🔒 Authorization check
    const isAdmin = req.user?.isAdmin;
    const isOwner = order.user && req.user && (order.user._id.toString() === req.user._id.toString());
    const isGuestSession = order.sessionId && req.session?.id === order.sessionId;

    if (!isAdmin && !isOwner && !isGuestSession) {
      return res.status(403).json({ message: "Access denied" });
    }

    // ✅ Return enriched order info
    res.status(200).json({
      _id: order._id,
      createdAt: order.createdAt,
      items: order.items, // already structured with product + variation info
      user: order.user ? {
        name: order.user.name,
        email: order.user.email,
        _id: order.user._id
      } : null,
      totalAmount: order.totalAmount,
      shippingAddress: order.shippingAddress || {},
      billingAddress: order.billingAddress || {},
      payment: order.payment || {},
      isGuestOrder: order.isGuestOrder || false,
      notes: order.notes || "",
      status: order.status || "Processing",
    });

  } catch (error) {
    console.error("❌ Error fetching order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

////////////////////////////////////////////////////////////


export const getOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .lean();

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders by user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


///////////////////////////////////////////////////////////
export const updateOrderStatus=async(req,res)=>{
    try {
      

        const {status} = req.body;
        if(!status){
            return res.status(400).json({message:"Status is required"});
        }
        const order=await Order.findByIdAndUpdate(req.params.id, {deliveryStatus:status}, {new: true}).lean();
        if(!order){
            return res.status(404).json({message:"Order not found"});
        }
        
        res.status(200).json({message:"Order status updated successfully", order});
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({message:"Internal server error"});
    }
}

///////////////////////////////////////////////////////////////




// export const handleStripeWebhook = async(req, res) => {
//   const sig = req.headers['stripe-signature'];

//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
//   } catch (err) {
//     console.error("Error handling Stripe webhook:", err);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   // Handle specific event types
//   if (event.type === 'checkout.session.completed') {
//     const session = event.data.object;
//     try {
//       const order=await Order.findOne({
//         'payment.sessionId': session.id,
//         'payment.status': 'Pending'
//       })
//       if(!order){
//         console.log('No matching order found for session id',session.id);
//         return res.status(404).json({ message: "Order not found for this session" });
//       }


//       const mongoseSession=await Order.startSession();
//       await mongoseSession.withTransaction(async()=>{
//         await mutateStock(order.linesForStock,'decrease',mongoseSession);
//         order.payment.status = 'Paid';
//         order.payment.stripePaymentIntentId = session.payment_intent;
//         order.deliveryStatus = 'Processing';
//         await order.save({ session: mongoseSession });
//       })
//       console.log('Order updated successfully for session id:', session.id);
//       res.status(200).json({ message: "Order updated successfully" });
//     } catch (error) {
//       console.error("Error updating order:", error);
//       res.status(500).json({ message: "Internal server error", error: error.message });
//     }
//     // Fulfill order
//     console.log(' Payment success. Session ID:', session.id);
//     // Your logic to create order, send email, etc.
//   }

//   res.status(200).json({ received: true });
// };

/////////////////////////////////////////////////////////////////

export const getAllOrders=async(req,res)=>{
    try {
        const orders=await Order.find().sort({createdAt: -1}).lean();
        if(!orders || orders.length === 0){
            return res.status(404).json({message:"No orders found"});
        }
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching all orders:", error);
        res.status(500).json({message:"Internal server error"});
    }
}


/////////////////////////////////////////////////





export const getOrdersByStatus = async (req, res) => {
  try {
    const orders = await Order.find({ deliveryStatus: req.params.status })
      .sort({ createdAt: -1 })
      .lean();

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found with this status" });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders by status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


//////////////////////////////////////////////////////////////////////


export const deleteOrder = async (req, res) => {
    try {
       

        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        

        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};






