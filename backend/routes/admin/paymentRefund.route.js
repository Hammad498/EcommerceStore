import Router from 'express';
import { isAdmin } from '../../middlewares/roles/isAdmin.js';
import { createRefund,refundLogsForProduct,allrefundLogs,totalRefundLogsForProduct } from '../../controllers/Order/refund.Controller.js';


const router=Router();

router.post("/:id",isAdmin,createRefund);


///refundLogs

router.get('/:id',isAdmin,refundLogsForProduct);

///allrefundLogs

router.get('/',isAdmin,allrefundLogs);


//no of refunds for a product
 router.get('/product/:id', isAdmin, totalRefundLogsForProduct);

 



export default router;