import Cart from "../../models/cart.model.js";
import Order from "../../models/product/order.model.js";
import User from "../../models/user.model.js";


import { getCartIdentifier } from "../cartIdentifier.js";


export const createOrderService = async (req) => {
  const id = getCartIdentifier(req);
  if (!id) throw new Error('Cart identifier required');

  let { shippingAddress, billingAddress, paymentMethod, notes } = req.body;

  // If user is logged in, fetch saved addresses
  if (id.type === 'user') {
    const user = await User.findById(id.id).lean();
    if (!shippingAddress) shippingAddress = user.shippingAddress;
    if (!billingAddress) billingAddress = user.billingAddress;
  }

  if (!shippingAddress || !billingAddress) {
    throw new Error('shipping and billing addresses required');
  }

  const cart = await Cart.findOne(
    id.type === 'user' ? { user: id.id } : { sessionId: id.id }
  ).populate('items.product');

  if (!cart || !cart.items.length) {
    throw new Error('Cart is empty or not found');
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
    items,
    shippingAddress,
    billingAddress,
    totalAmount,
    currency: 'usd',
    payment: {
      method: paymentMethod,
      status: 'Pending'
    },
    notes,
    linesForStock
  });

  await order.save();
  await Cart.deleteOne({ _id: cart._id });

  return order;
};



////////////////////////////////////////


export const getOrderItemsByIdService = async (orderId, user) => {
  if (!orderId) {
    return { statusCode: 400, success: false, message: 'Order ID is required' };
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return { statusCode: 404, success: false, message: 'Order not found' };
  }

  const items = order.items.map(item => {
    const unitPrice = item.variation.discountPrice > 0 ? item.variation.discountPrice : item.variation.price;
    return {
      image: item.product.image || '',
      quantity: item.quantity,
      price: unitPrice,
      total: unitPrice * item.quantity,
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
      phone: user?.shippingAddress?.phone || '',
      email: user?.email || ''
    };
  });

  return {
    statusCode: 200,
    success: true,
    message: 'Order items fetched successfully',
    items
  };
};




////////////////////////////////



export const createUserFeedbackService = async ({ orderId, rating, comment, user }) => {
  if (!orderId || !rating) {
    return { statusCode: 400, success: false, message: 'Order ID and rating are required' };
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return { statusCode: 404, success: false, message: 'Order not found' };
  }

  if (order.user.toString() !== user._id.toString()) {
    return { statusCode: 403, success: false, message: 'You can only provide feedback for your own orders' };
  }

  order.orderFeedback = order.orderFeedback || [];

  const feedback = {
    user: user._id,
    rating,
    comment: comment || '',
    createdAt: new Date()
  };

  order.orderFeedback.push(feedback);

  // Compute average rating
  const avgRating = order.orderFeedback.reduce((sum, f) => sum + f.rating, 0) / order.orderFeedback.length;

  order.feedback = {
    rating: avgRating,
    comment: order.orderFeedback.map(f => f.comment).join(' | ')
  };

  await order.save();

  return {
    statusCode: 201,
    success: true,
    message: 'Feedback created successfully',
    feedback: order.feedback
  };
};


