import Router from 'express';
import { loginUser } from '../controllers/user.Controller.js';
import { loginValidation } from '../validation/user.Validation.js';
import { isAdmin } from '../middlewares/roles/isAdmin.js';


const router= Router();

router.post('/login',loginValidation,isAdmin,loginUser);

export default router;