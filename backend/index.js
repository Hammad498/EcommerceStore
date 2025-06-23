import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import adminRoutes from './routes/admin/admin.Route.js';
import fileUpload from 'express-fileupload';
import bodyParser from 'body-parser';

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
    tempFileDir: 'uploads/',
    createParentPath: true,
}))
app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.use('/api', adminRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});