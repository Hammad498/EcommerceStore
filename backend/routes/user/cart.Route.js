import Router from 'express';
import { addToCart ,getCart,updateCartItem,removeFromCart,cleanCart} from '../../controllers/user/cart.Controller.js';


const router=Router();


router.post('/',addToCart);
router.get('/',getCart);

router.put('/:id',updateCartItem);
router.delete('/:id',removeFromCart);

router.delete('/',cleanCart);





export default router;