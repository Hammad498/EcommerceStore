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

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        message: "Order not found!",
        success: false,
      });
    }

    if (order.payment.status !== 'Paid') {
      return res.status(400).json({
        message: "Refund can only be created for successful payments!",
        success: false,
      });
    }

    if (!order.payment.paymentIntentId) {
      return res.status(400).json({
        message: "Missing paymentIntentId in order!",
        success: false,
      });
    }

    // Create refund using Stripe
    const refund = await stripe.refunds.create({
      payment_intent: order.payment.paymentIntentId,
      amount: Math.round(amount * 100), // convert dollars to cents
      reason: reason,
      metadata: {
        orderId: order._id.toString(),
        userId: order.user ? order.user.toString() : 'guest',
      },
    });

    // Save refund in Refund collection
    const refundRecord = await Refund.create({
      refundId: refund.id,
      amount: refund.amount / 100, // store in dollars
      currency: refund.currency,
      reason,
      status: refund.status,
      orderId: order._id,
    });

    // Optionally push into order model (if your Order model has refunds array)
    order.refunds.push(refundRecord);
    
    // Calculate total refunded in dollars
    const totalRefunded = order.refunds.reduce((total, r) => total + r.amount, 0);

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
