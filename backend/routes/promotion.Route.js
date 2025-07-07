import Router from 'express';
import {isAdmin} from '../middlewares/roles/isAdmin.js';
import {createPromotion,getAllPromotions,updatePromotions,deletePromotion,deleteAllPromotions,getActivePromotions} from '../controllers/promotion/promotion.controller.js';
import {uploadImages} from '../middlewares/cloudinary/adminUpload.js';
import {isUser} from '../middlewares/roles/isUser.js';

const router=Router();


router.post('/',isAdmin,uploadImages,createPromotion);
router.get('/',isAdmin,getAllPromotions);
router.put('/:id',isAdmin,updatePromotions);
router.delete('/:id',isAdmin,deletePromotion);

router.delete('/',isAdmin,deleteAllPromotions);


router.get('/get',isUser,getActivePromotions);




export default router;