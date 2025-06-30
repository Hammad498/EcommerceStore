import Router from 'express';
import {createCheckoutSession,
    createOrder,
    getOrderById,
    getOrdersByUser,
    updateOrderStatus,
    handleStripeWebhook,
    getAllOrders,
    getOrdersByStatus,
    deleteOrder} from '../../controllers/Order/order.controller.js';


import {isAdmin} from '../../middlewares/roles/isAdmin.js';
import { isUser } from '../../middlewares/roles/isUser.js';


const router=Router();


// Create a new checkout session
router.post('/checkout-session', isUser, createCheckoutSession);

// Create a new order
router.post('/', isUser, createOrder);


// Update order status (admin only)
router.put('/:id/status', isAdmin, updateOrderStatus);
// Handle Stripe webhook
router.post('/webhook', handleStripeWebhook);
// Get all orders (admin only)
router.get('/', isAdmin, getAllOrders);

// Delete an order (admin only)
router.delete('/:id', isAdmin, deleteOrder);

// Get orders by user
router.get('/user', isUser, getOrdersByUser);
// Get orders by status (admin only)
router.get('/status/:status', isAdmin, getOrdersByStatus);
// Get order by ID (user or admin)
router.get('/:id', isUser, getOrderById); 








export default router;