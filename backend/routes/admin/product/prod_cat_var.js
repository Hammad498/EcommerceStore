import Router from 'express';
import { isAdmin } from '../../../middlewares/roles/isAdmin.js';
import { getAllCategories,createCategory,updateCategory,deleteCategory } from '../../../controllers/admin/product/category.controller.js';
import { uploadImages } from '../../../middlewares/cloudinary/adminUpload.js';
// import { categoryValidation } from '../../../validation/category.Validation.js';




const router = Router();

// router.get('/',isAdmin,getAllCategories);
// router.post('/',isAdmin,uploadImages,categoryValidation,createCategory);
// router.put('/:id',isAdmin,uploadImages,categoryValidation,updateCategory); 
// router.delete('/:id',isAdmin,deleteCategory);



// router.get('/',getAllCategories);
// router.post('/',uploadImages,categoryValidation,createCategory);
// router.put('/:id',uploadImages,categoryValidation,updateCategory); 
// router.delete('/:id',deleteCategory);


router.get('/',getAllCategories);
router.post('/',uploadImages,createCategory);
router.put('/:id',uploadImages,updateCategory); 
router.delete('/:id',deleteCategory);










export default router;