import Order from "../../models/product/order.model.js";
import Product from "../../models/product/product.model.js";
import { verifyStripeWebHook } from "../stripe/stripe.js";



export const handleStripeWebhookService = async (req, res) => {
  const event = verifyStripeWebHook(req, res);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata.orderId;
    const paymentIntentId = session.payment_intent;

    const order = await Order.findById(orderId);
    if (!order) {
      console.warn(`Order not found for ID: ${orderId}`);
      return;
    }

    order.payment.paymentIntentId = paymentIntentId;
    order.payment.status = 'Paid';

    // Update stock
    if (Array.isArray(order.linesForStock)) {
      for (const line of order.linesForStock) {
        await Product.updateOne(
          { _id: line.productId, 'variations.variantSKU': line.sku },
          { $inc: { 'variations.$.stock': -line.qty } }
        );

        const updatedProduct = await Product.findOne(
          { _id: line.productId },
          { variations: 1 }
        );

        const updatedVariation = updatedProduct.variations.find(v => v.variantSKU === line.sku);
        console.log(`Updated stock for SKU ${line.sku}:`, updatedVariation?.stock);
      }
    } else {
      console.warn(`linesForStock is missing or not an array for order ${order._id}`);
    }

    await order.save();
    console.log('Order paid and stock updated:', order._id);
  }
};