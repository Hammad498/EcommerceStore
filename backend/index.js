// server.js
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

import { handleStripeWebhook } from './controllers/Order/order.controller.js';

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));


app.post('/api/user/order/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

//  Now parse JSON after webhook route
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
