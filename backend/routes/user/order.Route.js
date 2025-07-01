// routes/user/order.Route.js
import Router from 'express';
import {
  createCheckoutSession,
  createOrder,
  getOrderById,
  getOrdersByUser,
  updateOrderStatus,
  getAllOrders,
  getOrdersByStatus,
  deleteOrder
} from '../../controllers/Order/order.controller.js';

import { isAdmin } from '../../middlewares/roles/isAdmin.js';
import { isUser } from '../../middlewares/roles/isUser.js';

const router = Router();

// ✅ Checkout session
router.post('/checkout-session', isUser, createCheckoutSession);

// ✅ Create order
router.post('/', isUser, createOrder);

// ✅ Update order status (admin only)
router.put('/:id/status', isAdmin, updateOrderStatus);

// ❌ Webhook REMOVED from here — defined globally in server.js

// ✅ Get all orders (admin)
router.get('/', isAdmin, getAllOrders);

// ✅ Delete order (admin)
router.delete('/:id', isAdmin, deleteOrder);

// ✅ Get user orders
router.get('/user', isUser, getOrdersByUser);

// ✅ Get orders by status (admin)
router.get('/status/:status', isAdmin, getOrdersByStatus);

// ✅ Get specific order (user or admin)
router.get('/:id', isUser, getOrderById);

export default router;
