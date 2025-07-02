import Router from 'express';
import { addToCart ,getCart,updateCartItem,removeFromCart,cleanCart} from '../../controllers/user/cart.Controller.js';

import { isUser } from '../../middlewares/roles/isUser.js';
const router=Router();


router.post('/',isUser,addToCart);
router.get('/',isUser,getCart);

router.put('/:id',isUser,updateCartItem);
router.delete('/:id',isUser,removeFromCart);

router.delete('/',isUser,cleanCart);





export default router;