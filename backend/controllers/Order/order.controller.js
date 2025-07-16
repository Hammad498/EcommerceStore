
import { createStripeCheckoutSession,verifyStripeWebHook,retrieveStripeSession,retrievePaymentIntent } from "../../services/stripe/stripe.js"
import Order from '../../models/product/order.model.js';
import Cart from '../../models/cart.model.js';
import { getCartIdentifier } from "../../services/cartIdentifier.js";
import dotenv from 'dotenv';
import User from '../../models/user.model.js';

import mongoose from 'mongoose';
import { mutateStock } from "../../services/stripe/mutateStock.js";




dotenv.config();

export async function createCheckoutSession(req, res) {
  try {
    const id = getCartIdentifier(req);
    if (!id) return res.status(400).json({ message: 'Cart identifier required' });

    const cart = await Cart.findOne(
      id.type === 'user' ? { user: id.id } : { sessionId: id.id }
    ).populate('items.product');

    if (!cart || !cart.items.length) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const cartItems = cart.items.map(item => {
      const p = item.product;
      const v = p.variations.find(v => v.variantSKU.toLowerCase() === item.variation.toLowerCase());
      if (!v) throw new Error(`Variation ${item.variation} not found on ${p.title}`);

      return {
        product: { _id: p._id, name: p.title, description: p.description, image: p.images[0]?.url },
        variantSKU: v.variantSKU,
        quantity: item.quantity,
        price: v.discountPrice > 0 ? v.discountPrice : v.price,
        discountPrice: v.discountPrice
      };
    });

    const session = await createStripeCheckoutSession({
      user: id.type === 'user' ? { _id: id.id, email: req.user?.email } : null,
      cartItems,
      successUrl: `${process.env.CLIENT_URL}/order/success`,
      cancelUrl: `${process.env.CLIENT_URL}/cart`
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
}

/////////////////////////////////




export const handleStripeWebhook = async (req, res) => {
  try {
    const event = verifyStripeWebHook(req, res);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      const order = await Order.findById(session.metadata.orderId);
      if (order) {
        order.payment.paymentIntentId = session.payment_intent;
        order.payment.status = 'Paid';
        await order.save();
        console.log('payemntIntentId for the order is : ',order.payment.paymentIntentId);
      }
    }

    res.status(200).json({ received: true,paymentIntentId: event.data.object.payment_intent });
    console.log('Webhook received and processed successfully');
  } catch (err) {
    console.error('Webhook Error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

/////////////////////


export async function createOrder(req, res) {
  try {
    const id = getCartIdentifier(req);
    if (!id) return res.status(400).json({ message: 'Cart identifier required' });

    let { sessionId, shippingAddress, billingAddress, paymentMethod, notes } = req.body;

    if (!sessionId) return res.status(400).json({ message: 'sessionId required' });

    // Fetch user addresses if user is logged in
    if (id.type === 'user') {
      const user = await User.findById(id.id).lean();
      if (!shippingAddress) shippingAddress = user.shippingAddress;
      if (!billingAddress) billingAddress = user.billingAddress;
    }

  

    // Final check for addresses (mandatory)
    if (!shippingAddress || !billingAddress) {
      return res.status(400).json({ message: 'shipping and billing addresses required' });
    }

    // Stripe payment validation
    // const session = await retrieveStripeSession(sessionId);
    // const paymentIntentId = session?.payment_intent;
    // if (!paymentIntentId) {
    //   return res.status(400).json({ message: 'Payment intent ID missing from Stripe session' });
    // }

    // const paymentIntent = await retrievePaymentIntent(paymentIntentId);
    // if (!paymentIntent || paymentIntent.status !== 'succeeded') {
    //   return res.status(400).json({ message: 'Payment was not successful' });
    // }

    // Cart and items
    const cart = await Cart.findOne(
      id.type === 'user' ? { user: id.id } : { sessionId: id.id }
    ).populate('items.product');

    if (!cart || !cart.items.length) {
      return res.status(400).json({ message: 'Cart is empty or not found' });
    }

    const linesForStock = [];
    const items = cart.items.map(item => {
      const p = item.product;
      const v = p.variations.find(
        v => v.variantSKU.toLowerCase() === item.variation.toLowerCase()
      );
      if (!v) throw new Error(`Variation ${item.variation} missing`);

      linesForStock.push({ productId: p._id, sku: v.variantSKU, qty: item.quantity });
      const unit = v.discountPrice > 0 ? v.discountPrice : v.price;

      return {
        product: {
          _id: p._id,
          title: p.title,
          description: p.description,
          image: p.images[0]?.url
        },
        variation: {
          sku: v.variantSKU,
          material: v.attributes.material,
          color: v.attributes.color,
          price: unit,
          discountPrice: v.discountPrice
        },
        quantity: item.quantity,
        total: unit * item.quantity
      };
    });

    const totalAmount = items.reduce((sum, x) => sum + x.total, 0);

    const order = new Order({
      user: id.type === 'user' ? id.id : null,
      sessionId,
      items,
      shippingAddress,
      billingAddress,
      totalAmount,
      currency: 'usd',
      payment: {
        method: paymentMethod,
        status: 'Paid',
        sessionId,
        paymentIntentId
      },
      notes,
      linesForStock
    });

    await order.save();
    await Cart.deleteOne({ _id: cart._id });

    // Fetch user's default addresses if available
    const userData = id.type === 'user'
      ? await User.findById(id.id).select('shippingAddress billingAddress').lean()
      : null;

    res.status(201).json({
      message: 'Order created',
      orderId: order._id,
      order,
      defaultAddresses: userData
        ? {
            shippingAddress: userData.shippingAddress,
            billingAddress: userData.billingAddress
          }
        : null
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({
      message: 'Internal server error',
      error: err.message
    });
  }
}

////////////////////////////////////////


export async function getOrderById(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const order = await Order.findById(req.params.id).populate('user').lean();
    if (!order) return res.status(404).json({ message: 'Order not found' });

    let savedShipping = null;
    let savedBilling = null;

    if (order.user && order.user.shippingAddress && order.user.billingAddress) {
      savedShipping = order.user.shippingAddress;
      savedBilling = order.user.billingAddress;
    }

     res.status(200).json({
  order: {
    ...order,
    shippingAddressUsed: order.shippingAddress,
    billingAddressUsed: order.billingAddress
  }
});



  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}



//////////////////////////////////////////////////////////////////////////





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

///////////////////////////////////////////////


export const getUserOrdersPaginated=async(req,res)=>{
  try {
    const userId=req.user._id;
    const page=parseInt(req.query.page) || 1;
    const limit=parseInt(req.query.limit) || 10;
    const skip=(page - 1) * limit;

    const totalOrders=await Order.countDocuments({user:userId});
    const totalPages=Math.ceil(totalOrders / limit);

    const orders=await Order.find({user:userId}).skip(skip).limit(limit).select('_id deliveryStatus createdAt totalAmount totalQuantity items').lean();
    if(!orders ||orders.length===0){
      return res.status(404).json({
        message:"No orders found for this user",
        success:false,
        orders:[],
        totalOrders:0,
      })
    }

    const mapStatus=(status)=>{
      switch(status){
        case 'Pending':
          return 'In Process';
        case 'Processing':
          return 'Processing';
        case 'Shipped':
          return 'Shipped';
        case 'Delivered':
          return 'Completed';
        case 'Cancelled':
          return 'Cancelled';
        default:
          return 'Unknown';
      }
    }

    const formatted = orders.map((order) => ({
      order: order._id,
      status: mapStatus(order.deliveryStatus),
      date: order.createdAt,
      total: `$${order.totalAmount.toFixed(2)} (${order.items.length} items)`
    }));

    res.status(200).json({
      message: "Orders fetched successfully",
      success: true,
      orders: formatted,
      totalOrders,
      totalPages,
      currentPage: page
    });

  } catch (error) {
    console.error("Error fetching paginated user orders:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      orders: [],
      totalOrders: 0
    });
  }
}

/////////////////////////////////////////////////////


export const updateTrackHistory=async(req,res)=>{
  try {
    const { status, message } = req.body;

    const validStatuses = ['Order Placed', 'Packaging', 'On the road', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    } 

    if (!status || !message) {
      return res.status(400).json({ message: 'Status and message are required' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.trackingHistory.push({
      status,
      message,
      timestamp: new Date()
    });
    // const lastStatus = order.trackingHistory[order.trackingHistory.length - 1];
    // if (lastStatus && lastStatus.status === status) {
    //   return res.status(200).json({ message: 'Tracking history already updated with this status', success: true, trackingHistory: order.trackingHistory });
    // }

    await order.save();

    res.status(200).json({ message: 'Tracking history updated successfully', success: true, trackingHistory: order.trackingHistory });
  } catch (error) {
    console.error('Error updating tracking history:', error);
    res.status(500).json({ message: 'Failed to update tracking history', success: false, error: error.message });
  }
}


////////////////////////////////


export const deleteTrackingHistory=async(req,res)=>{
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.trackingHistory.length === 0) {
      return res.status(400).json({ message: 'No tracking history to delete' });
    }

    order.trackingHistory = order.trackingHistory.filter((_, index) => index !== order.trackingHistory.length - 1);
    await order.save();

    res.status(200).json({ message: 'Last tracking history deleted successfully', success: true, trackingHistory: order.trackingHistory });
  } catch (error) {
    console.error('Error deleting tracking history:', error);
    res.status(500).json({ message: 'Failed to delete tracking history', success: false, error: error.message });
    
  }
}



//////////////////////////////////////


export const orderItemsForThatorder = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const items = order.items.map(item => ({
      image: item.product.image || '',
      quantity: item.quantity,
      price: item.variation.discountPrice > 0 ? item.variation.discountPrice : item.variation.price,
      total: (item.variation.discountPrice > 0 ? item.variation.discountPrice : item.variation.price) * item.quantity,
      product: {
        _id: item.product._id,
        title: item.product.title,
        description: item.product.description
      },
      variation: {
        sku: item.variation.sku,
        material: item.variation.material,
        color: item.variation.color
      },
      orderId: order._id,
      billingAddress: order.billingAddress,
      shippingAddress: order.shippingAddress,
      phone: req.user.shippingAddress.phone || '',
      email: req.user ? req.user.email : '',
    }));

    res.status(200).json({ message: 'Order items fetched successfully', items });
  } catch (error) {
    console.error("Error fetching order items!", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching order items",
      error: error.message
    });
  }
}

//////////////////////////////////



export const createUserFeedback = async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;

    if (!orderId || !rating) {
      return res.status(400).json({ message: 'Order ID and rating are required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only provide feedback for your own orders' });
    }

    // Ensure array exists
    order.orderFeedback = order.orderFeedback || [];

    const feedback = {
      user: req.user._id,
      rating,
      comment: comment || '',
      createdAt: new Date()
    };

    order.orderFeedback.push(feedback);

    // Calculate average rating
    const avgRating = order.orderFeedback.reduce((sum, f) => sum + f.rating, 0) / order.orderFeedback.length;

    order.feedback = {
      rating: avgRating,
      comment: order.orderFeedback.map(f => f.comment).join(' | ')
    };

    await order.save();

    res.status(201).json({ message: 'Feedback created successfully', feedback: order.feedback });

  } catch (error) {
    console.error("Error creating user feedback:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};







