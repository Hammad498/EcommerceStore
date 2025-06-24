import Router from 'express';
import { isAdmin } from '../../../middlewares/roles/isAdmin.js';
import { getAllCategories,createCategory,updateCategory,deleteCategory } from '../../../controllers/admin/product/category.controller.js';
import { uploadImages } from '../../../middlewares/cloudinary/adminUpload.js';




const router = Router();

router.get('/',isAdmin,getAllCategories);
router.post('/',isAdmin,uploadImages,createCategory);
router.put('/:id',isAdmin,uploadImages,updateCategory); 
router.delete('/:id',isAdmin,deleteCategory);







export default router;