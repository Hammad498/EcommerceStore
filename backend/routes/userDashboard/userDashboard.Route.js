import Router from 'express';
import { isUser } from '../../middlewares/roles/isUser.js';
import {updateUserAccount,updateShippingAddress,updateBillingAddress,getUserAllInfo,updatePassword} from '../../controllers/user/userDashboard/info.Controller.js';
import { uploadImages } from '../../middlewares/cloudinary/adminUpload.js';


const router=Router();


router.patch('/account',isUser,uploadImages,updateUserAccount);


router.patch('/shippingAddress',isUser,updateShippingAddress);

router.patch('/billingAddress',isUser,updateBillingAddress); 

router.get('/userinfo',isUser,getUserAllInfo);


router.patch('/password',isUser,updatePassword);



export default router;