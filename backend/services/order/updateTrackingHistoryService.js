import Order from "../../models/product/order.model.js";


export const updateTrackingHistoryService = async (orderId, status, message) => {
  const validStatuses = ['Order Placed', 'Packaging', 'On the road', 'Delivered', 'Cancelled'];

  if (!validStatuses.includes(status)) {
    return { success: false, statusCode: 400, message: 'Invalid status' };
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return { success: false, statusCode: 404, message: 'Order not found' };
  }
////
  order.trackingHistory.push({
    status,
    message,
    timestamp: new Date()
  });

  await order.save();

  return {
    success: true,
    statusCode: 200,
    message: 'Tracking history updated successfully',
    trackingHistory: order.trackingHistory
  };
};