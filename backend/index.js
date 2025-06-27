import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import adminRoutes from './routes/admin/admin.Route.js';
import userRoutes from './routes/user/user.Route.js';
import fileUpload from 'express-fileupload';
import bodyParser from 'body-parser';

import categoryRoutes from './routes/admin/product/prod_cat_var.js';
import productVariationRoutes from './routes/admin/product/productRoute.js'
import reviewRoutes from './routes/user/productReview.js'

import cartRoutes from './routes/user/cart.Route.js';


dotenv.config();


connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(bodyParser.json());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/temp/',
    createParentPath: true,
}))

app.use('/api', adminRoutes);
app.use('/api/user', userRoutes);


app.use('/api/admin/category', categoryRoutes);
app.use('/api/admin/product', productVariationRoutes);
app.use('/api/user/review',reviewRoutes);

app.use('/api/user/cart', cartRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});