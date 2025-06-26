


import Router from 'express';

import { loginValidation,registerValidation } from '../../validation/user.Validation.js';
import { loginUser, registerUser } from '../../controllers/user/user.Controller.js';



const router= Router();


router.post('/login', loginValidation, loginUser); 
router.post('/register', registerValidation, registerUser); 






export default router;