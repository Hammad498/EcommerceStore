import Router from 'express';
import { loginAdmin,registerAdmin} from '../../controllers/admin/admin.Controller.js';
import { loginValidation,registerValidation } from '../../validation/user.Validation.js';
import { isAdmin } from '../../middlewares/roles/isAdmin.js';


const router= Router();


router.post('/login', loginValidation, loginAdmin); 
router.post('/register', registerValidation, registerAdmin); 



/////////////////////////////
//product CRUD By the ADMIN




export default router;