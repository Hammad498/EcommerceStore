import Router from 'express';
import { isUser } from '../../middlewares/roles/isUser.js';
import {updateUserAccount} from '../../controllers/user/userDashboard/info.Controller.js';
import { uploadImages } from '../../middlewares/cloudinary/adminUpload.js';


const router=Router();


router.patch('/account',isUser,uploadImages,updateUserAccount);



export default router;