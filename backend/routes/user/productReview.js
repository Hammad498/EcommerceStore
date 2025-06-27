import Router from 'express';
import {isUser}  from '../../middlewares/roles/isUser.js'
import { createReview,getProductReviews,deleteReview ,toggleHelpful} from '../../controllers/user/review.controller.js';
import { uploadImages } from '../../middlewares/cloudinary/adminUpload.js';


const router=Router();


router.post('/',isUser,uploadImages,createReview);
router.get('/:productId',getProductReviews); 
router.delete('/:reviewId',isUser,deleteReview); 
router.patch('/helpful/:reviewId',isUser,toggleHelpful); 




export default router;