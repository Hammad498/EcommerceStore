import Router from 'express';
import {isAdmin} from '../middlewares/roles/isAdmin.js';
import {createPromotion} from '../controllers/promotion/promotion.controller.js';

const router=Router();


router.post('/',isAdmin,createPromotion);




export default router;