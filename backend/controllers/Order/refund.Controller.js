import Refund from '../../models/product/refund.model.js';
import Order from '../../models/product/order.model.js';
import stripe from '../../services/stripe/stripe.js';

export const createRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;

    if (!id || !reason || !amount || amount <= 0) {
      return res.status(400).json({
        message: "Please provide all required fields along with valid amount!",
        success: false,
      });
    }

    // Validate Stripe-allowed reasons
    const validReasons = ['duplicate', 'fraudulent', 'requested_by_customer'];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({
        message: `Invalid reason: must be one of ${validReasons.join(', ')}`,
        success: false,
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        message: "Order not found!",
        success: false,
      });
    }

    const paymentIntentId = order.payment?.paymentIntentId;
    if (!paymentIntentId) {
      return res.status(400).json({ message: 'PaymentIntent ID missing from order' });
    }

    if (order.payment.status !== 'Paid') {
      return res.status(400).json({
        message: "Refund can only be created for successful payments!",
        success: false,
      });
    }

    //  Create refund on Stripe
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: Math.round(amount * 100), 
      reason,
      metadata: {
        orderId: order._id.toString(),
        userId: order.user ? order.user.toString() : 'guest',
      },
    });

  
    const refundRecord = await Refund.create({
      refundId: refund.id,
      amount: refund.amount / 100, 
      currency: refund.currency,
      reason,
      status: refund.status.charAt(0).toUpperCase()+refund.status.slice(1),
      orderId: order._id,
    });

    
    order.refunds.push(refundRecord);

    
    const totalRefunded = order.refunds.reduce((sum, r) => sum + r.amount, 0);
    if (totalRefunded >= order.totalAmount) {
      order.payment.status = 'Refunded';
    }

    await order.save();

    return res.status(201).json({
      message: "Refund created successfully!",
      success: true,
      refund: refundRecord,
    });

  } catch (error) {
    console.log("Error creating refund:", error);
    return res.status(500).json({
      message: "Failed to create refund",
      success: false,
      error: error.message,
    });
  }
};

