
import Router from 'express';

import {uploadImages} from '../../../middlewares/cloudinary/adminUpload.js';
import { isAdmin } from '../../../middlewares/roles/isAdmin.js';
import { createProduct } from '../../../controllers/admin/product/product.controller.js';


const router=Router();

router.post('/create',isAdmin,uploadImages,createProduct);


export default router;

