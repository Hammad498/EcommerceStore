import Router from 'express';
import { isAdmin } from '../../middlewares/roles/isAdmin.js';
import { addProduct,getAllProduct,editproduct } from '../../controllers/admin/product.Controller.js';
import {uploadImages} from '../../middlewares/cloudinary/adminUpload.js';


const router= Router();


router.post('/create',isAdmin,uploadImages,addProduct);
router.get('/getAll',isAdmin,getAllProduct);


router.put('/edit/:id',isAdmin,uploadImages,editproduct);


export default router;