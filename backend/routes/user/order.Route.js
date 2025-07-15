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
  deleteOrder,
  getUserOrdersPaginated
} from '../../controllers/Order/order.controller.js';

import { isAdmin } from '../../middlewares/roles/isAdmin.js';
import { isUser } from '../../middlewares/roles/isUser.js';

const router = Router();

//  Checkout session
router.post('/checkout-session', isUser, createCheckoutSession);

// Create order
router.post('/', isUser, createOrder);

// Update order status (admin only)
router.put('/:id/status', isAdmin, updateOrderStatus);



//  Get all orders (admin)
router.get('/', isAdmin, getAllOrders);



//  Get orders by status (admin)
router.get('/status/:status', isAdmin, getOrdersByStatus);


//  Delete order (admin)
router.delete('/:id', isAdmin, deleteOrder);

//  Get user orders
router.get('/user', isUser, getOrdersByUser);

//for user dashboard (user all orders)
router.get('/paginated',isUser,getUserOrdersPaginated);

//  Get specific order (user or admin)
router.get('/:id', isUser, getOrderById);




export default router;
