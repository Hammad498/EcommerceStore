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




////////////////////////


export const refundLogsForProduct=async(req,res)=>{
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Order ID is required' });
    }
    const order = await Order.findById(id).populate('refunds');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.refunds.length === 0) {
      return res.status(404).json({ message: 'No refunds found for this order' });
    }
    return res.status(200).json({
      message: 'Refund logs retrieved successfully',
      success: true,
      refunds: order.refunds,
    });
  } catch (error) {
    console.error('Error retrieving refund logs:', error);
    return res.status(500).json({
      message: 'Failed to retrieve refund logs',
      success: false,
      error: error.message,
    });
  }
}


//////////////////////////


export const allrefundLogs=async(req,res)=>{
  try {
    const refunds = await Refund.find().populate('orderId', 'user sessionId totalAmount currency');
    if (refunds.length === 0) {
      return res.status(404).json({ message: 'No refunds found' });
    }
    return res.status(200).json({
      message: 'All refund logs retrieved successfully',
      success: true,
      refunds,
    });
  } catch (error) {
    console.error('Error retrieving all refund logs:', error);
    return res.status(500).json({
      message: 'Failed to retrieve all refund logs',
      success: false,
      error: error.message,
    });
  }
}


//////////////////////////


export const totalRefundLogsForProduct=async(req,res)=>{
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    const refunds = await Refund.find({ orderId: id });
    if (refunds.length === 0) {
      return res.status(404).json({ message: 'No refunds found for this product' });
    }

    /////totalrefund logs and after refund the total amount left after refunded


    const totalRefunded = refunds.reduce((sum, refund) => sum + refund.amount, 0);

    return res.status(200).json({
      message: 'Total refund logs for product retrieved successfully',
      success: true,
      totalRefunded,
    });


  } catch (error) {
    console.error('Error retrieving total refund logs for product:', error);
    return res.status(500).json({
      message: 'Failed to retrieve total refund logs for product',
      success: false,
      error: error.message,
    });
  }
}


////////////////

