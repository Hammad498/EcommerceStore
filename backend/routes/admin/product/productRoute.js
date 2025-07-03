
import Router from 'express';

import {uploadImages} from '../../../middlewares/cloudinary/adminUpload.js';
// import { isAdmin } from '../../../middlewares/roles/isAdmin.js';
import { createProduct,getAllProducts,getById,editproduct,deleteProduct } from '../../../controllers/admin/product/product.controller.js';
// import { productValidation } from '../../../validation/product.Validation.js';


const router=Router();

// router.post('/create',isAdmin,uploadImages,productValidation,createProduct);
// router.get('/get',isAdmin,getAllProducts);

// router.get('/get/:id',isAdmin,getById);
// router.put('/edit/:id',isAdmin,uploadImages,editproduct);

// router.delete('/delete/:id',isAdmin,deleteProduct);




router.post('/create',uploadImages,createProduct);
router.get('/get',getAllProducts);

router.get('/get/:id',getById);
router.put('/edit/:id',uploadImages,editproduct);

router.delete('/delete/:id',deleteProduct);

export default router;

        


