
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

import fileUpload from 'express-fileupload';
import bodyParser from 'body-parser';

import adminRoutes from './routes/admin/admin.Route.js';
import userRoutes from './routes/user/user.Route.js';
import categoryRoutes from './routes/admin/product/prod_cat_var.js';
import productVariationRoutes from './routes/admin/product/productRoute.js';
import reviewRoutes from './routes/user/productReview.js';
import cartRoutes from './routes/user/cart.Route.js';
import orderRoutes from './routes/user/order.Route.js';
import promotionRoutes from './routes/promotion.route.js'
import refundRoutesAdmin from './routes/admin/paymentRefund.route.js';

import { handleStripeWebhook } from './controllers/Order/order.controller.js';

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;




app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));



app.use(express.urlencoded({ extended: true }));

//webhook comes 1st then body-parser
app.post('/api/user/order/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);


app.use(bodyParser.json());
app.use(express.json());

//  File upload middleware
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/temp/',
  createParentPath: true,
}));

//  Routes
app.use('/api', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin/category', categoryRoutes);
app.use('/api/admin/product', productVariationRoutes);
app.use('/api/user/review', reviewRoutes);
app.use('/api/user/cart', cartRoutes);
app.use('/api/user/order', orderRoutes);
app.use('/api/promotion',promotionRoutes);
app.use('/api/admin/refund', refundRoutesAdmin);

app.listen(PORT,'0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API is available at http://localhost:${PORT}/api`);
  console.log(`Admin API is available at http://localhost:${PORT}/api/admin`);
  console.log(`for client the url is ${process.env.CLIENT_URL }`);
});
