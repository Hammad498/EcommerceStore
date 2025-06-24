import Router from 'express';
import { isAdmin } from '../../../middlewares/roles/isAdmin.js';
import { createCategory,getAllCategory,getAllCategoryById,editCategory,deleteCategory } from '../../../controllers/admin/product/category.controller.js';


const router = Router();

router.post('/',isAdmin,createCategory);
router.get('/',isAdmin,getAllCategory);
router.get('/:id',isAdmin,getAllCategoryById)
router.put('/:id',isAdmin,editCategory);
router.delete('/:id',isAdmin,deleteCategory);


export default router;