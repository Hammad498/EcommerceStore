import Router from 'express';
import { isAdmin } from '../../middlewares/roles/isAdmin.js';
import { addProduct } from '../../controllers/admin/product.Controller.js';
import {uploadImages} from '../../middlewares/cloudinary/adminUpload.js';

const router= Router();


router.post('/create',isAdmin,uploadImages,addProduct);


export default router;