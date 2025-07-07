import Router from 'express';
import {isAdmin} from '../middlewares/roles/isAdmin.js';
import {createPromotion,getAllPromotions,updatePromotions,deletePromotion,deleteAllPromotions} from '../controllers/promotion/promotion.controller.js';
import {uploadImages} from '../middlewares/cloudinary/adminUpload.js';

const router=Router();


router.post('/',isAdmin,uploadImages,createPromotion);
router.get('/',isAdmin,getAllPromotions);
router.put('/:id',isAdmin,updatePromotions);
router.delete('/:id',isAdmin,deletePromotion);

router.delete('/',isAdmin,deleteAllPromotions);


// router.get('/',getActivePromotions)




export default router;