import Router from 'express';
import { addToCart ,getCart,updateCartItem,removeFromCart,cleanCart} from '../../controllers/user/cart.Controller.js';

import { isUser } from '../../middlewares/roles/isUser.js';
const router=Router();


router.post('/',isUser,addToCart);
router.get('/',getCart);

router.put('/:id',updateCartItem);
router.delete('/:id',removeFromCart);

router.delete('/',cleanCart);





export default router;