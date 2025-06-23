import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import adminRoutes from './routes/admin/admin.Route.js';
import fileUpload from 'express-fileupload';
import bodyParser from 'body-parser';
import productRoutes from './routes/admin/product.Route.js';

dotenv.config();


connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/temp/',
    createParentPath: true,
}))

app.use('/api', adminRoutes);
app.use('/api/admin/product', productRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});