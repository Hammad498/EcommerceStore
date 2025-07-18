
import Order from '../../models/product/order.model.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';


///services for controllers
import { 
  createOrderService,
  getOrderItemsByIdService,
  createUserFeedbackService 
} from '../../services/order/orderService.js';

import {createCheckoutSessionService} from '../../services/order/checkoutService.js';
import { handleStripeWebhookService } from '../../services/order/webhookService.js';
import {getUserOrdersPaginatedService} from '../../services/order/getUserOrdersPagService.js';
import {updateTrackingHistoryService} from '../../services/order/updateTrackingHistoryService.js';





dotenv.config();



export async function createOrder(req, res) {
  try {
    const order = await createOrderService(req);
    res.status(201).json({
      message: 'Order created',
      orderId: order._id,
      order
    });

  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({
      message: 'Internal server error',
      error: err.message
    });
  }
}

/////////////////////////////////////////////////////

export async function createCheckoutSession(req, res) {
  try {
    const session = await createCheckoutSessionService(req);
    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error('Checkout session error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
}



////////////////////////////////////////////////

export const handleStripeWebhook = async (req, res) => {
  try {
    await handleStripeWebhookService(req, res);
    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook Error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};


////////////////////////////////////////////////

export async function getOrderById(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }
    const order = await Order.findById(req.params.id).populate('user').lean();
    if (!order) return res.status(404).json({ message: 'Order not found' });

    let savedShipping = order.shippingAddress;
    let savedBilling = order.billingAddress;

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


export const getUserOrdersPaginated = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await getUserOrdersPaginatedService(userId, page, limit);
    
    res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error('Error fetching paginated user orders:', error);
    res.status(500).json({
      message: 'Internal server error',
      success: false,
      orders: [],
      totalOrders: 0
    });
  }
};



/////////////////////////////////////////////////////



export const updateTrackHistory = async (req, res) => {
  try {
    const { status, message } = req.body;
    const orderId = req.params.id;

    const result = await updateTrackingHistoryService(orderId, status, message);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Error updating tracking history:', error);
    res.status(500).json({
      message: 'Failed to update tracking history',
      success: false,
      error: error.message
    });
  }
};

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



export const orderItemsForThatOrder = async (req, res) => {
  try {
    const { orderId } = req.query;
    const user = req.user;

    const result = await getOrderItemsByIdService(orderId, user);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error fetching order items:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching order items",
      error: error.message
    });
  }
};

//////////////////////////////////



export const createUserFeedback = async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;
    const user = req.user;

    const result = await createUserFeedbackService({ orderId, rating, comment, user });

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error creating user feedback:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};



//////////////////////////////////




