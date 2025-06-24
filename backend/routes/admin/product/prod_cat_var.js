import Router from 'express';
import { isAdmin } from '../../../middlewares/roles/isAdmin.js';
import { createCategory,getAllCategory } from '../../../controllers/admin/product/category.controller.js';


const router = Router();

router.post('/',isAdmin,createCategory);
router.get('/',isAdmin,getAllCategory);


export default router;