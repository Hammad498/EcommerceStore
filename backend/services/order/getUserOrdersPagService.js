
import Order from '../../models/product/order.model.js';



export const getUserOrdersPaginatedService = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const totalOrders = await Order.countDocuments({ user: userId });
  const totalPages = Math.ceil(totalOrders / limit);

  const orders = await Order.find({ user: userId })
    .skip(skip)
    .limit(limit)
    .select('_id deliveryStatus createdAt totalAmount totalQuantity items')
    .lean();

  if (!orders || orders.length === 0) {
    return {
      success: false,
      message: 'No orders found for this user',
      orders: [],
      totalOrders: 0,
      totalPages: 0,
      currentPage: page
    };
  }

  const mapStatus = (status) => {
    switch (status) {
      case 'Pending': return 'In Process';
      case 'Processing': return 'Processing';
      case 'Shipped': return 'Shipped';
      case 'Delivered': return 'Completed';
      case 'Cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const formatted = orders.map(order => ({
    order: order._id,
    status: mapStatus(order.deliveryStatus),
    date: order.createdAt,
    total: `$${order.totalAmount.toFixed(2)} (${order.items.length} items)`
  }));

  return {
    success: true,
    message: 'Orders fetched successfully',
    orders: formatted,
    totalOrders,
    totalPages,
    currentPage: page
  };
};