import Router from 'express';
import { isAdmin } from '../../middlewares/roles/isAdmin.js';
import { addProduct } from '../../controllers/admin/product.Controller.js';
import uploadImage from '../../middlewares/cloudinary/adminUpload.js';

const router= Router();


router.post('/create',isAdmin,uploadImage,addProduct);


export default router;