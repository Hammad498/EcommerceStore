import Order from '../../models/product/order.model.js';


import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);



export async function createStripeCheckoutSession({ user, cartItems, successUrl, cancelUrl, orderId }) {
  const line_items = cartItems.map(item => {
    const unit_amount = Math.round(((item.discountPrice > 0 ? item.discountPrice : item.price) || 0) * 100);
    const product_data = {
      name: item.product.name,
      description: item.product.description || ''
    };
    if (item.product.image) product_data.images = [item.product.image];

    return { price_data: { currency: 'usd', product_data, unit_amount }, quantity: item.quantity };
  });

  return await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items,
    mode: 'payment',
    customer_email: user?.email,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId: user?._id?.toString() || 'guest',
      orderId
    }
  });
}

// 2) Verify webhook signature
export function verifyStripeWebHook(req, res) {
  const sig = req.headers['stripe-signature'];
  try {
    return stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    throw new Error(`Webhook Error: ${err.message}`);
  }
}


// 3) Retrieve session by ID
export async function retrieveStripeSession(sessionId) {
  return await stripe.checkout.sessions.retrieve(sessionId);
}

export async function retrievePaymentIntent(piId) {
  return await stripe.paymentIntents.retrieve(piId);
}





export default stripe;



