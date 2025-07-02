import Router from 'express';
import {isAdmin} from '../middlewares/roles/isAdmin.js';
import {createPromotion} from '../controllers/promotion/promotion.controller.js';
import {uploadImages} from '../middlewares/cloudinary/adminUpload.js';

const router=Router();


router.post('/',isAdmin,uploadImages,createPromotion);
// router.get('/',isAdmin,getAllPromotions);
// router.put('/:id',isAdmin,updatePromotions);
// router.delete('/:id',isAdmin,deletPromotion);


// router.get('/',getActivePromotions)




export default router;