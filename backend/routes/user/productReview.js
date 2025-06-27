import Router from 'express';
import {isUser}  from '../../middlewares/roles/isUser.js'
import { createReview } from '../../controllers/user/review.controller.js';


const router=Router();


router.post('/review',isUser,createReview);



export default router;