import Router from 'express';
import { isAdmin } from '../../middlewares/roles/isAdmin.js';
import { createRefund } from '../../controllers/Order/refund.Controller.js';


const router=Router();

router.post("/:id",isAdmin,createRefund);



export default router;