import { createStripeCheckoutSession } from "../stripe/stripe.js";
import Order from "../../models/product/order.model.js";



export const createCheckoutSessionService = async (req) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) throw new Error('Order not found');

  const cartItems = order.items.map(item => ({
    product: {
      name: item.product.title,
      description: item.product.description,
      image: item.product.image
    },
    variantSKU: item.variation.sku,
    quantity: item.quantity,
    price: item.variation.price,
    discountPrice: item.variation.discountPrice
  }));

  const session = await createStripeCheckoutSession({
    user: order.user ? { _id: order.user, email: req.user?.email } : null,
    cartItems,
    successUrl: `${process.env.CLIENT_URL}/order/success`,
    cancelUrl: `${process.env.CLIENT_URL}/cart`,
    orderId: order._id.toString()
  });

  return session;
};