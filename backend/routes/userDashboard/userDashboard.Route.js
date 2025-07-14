import Router from 'express';
import { isUser } from '../../middlewares/roles/isUser.js';
import {updateUserAccount} from '../../controllers/user/userDashboard/info.Controller.js';


const router=Router();


router.patch('/account',isUser,updateUserAccount);



export default router;