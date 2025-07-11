import Refund from '../../models/product/refund.model.js'
import Order from '../../models/product/order.model.js';
import stripe from '../../services/stripe/stripe.js';

export const createRefund=async(req,res)=>{
    try {
        const {id}=req.params;
        const {amount,reason}=req.body;


        if(!id ||!reason ||!amount || amount<=0){
            return res.status(400).json({
                message:"Please provide all required fields along with valid amount!",
                success:false,
                error
            })
        };
        const order=await Order.findById(id);
        if(!order){
            return res.status(404).json({
                message:"Order not found!",
                success:false
            })
        }
        if(order.payment.status!=='Paid'){
            return res.status(400).json({
                message:"Refund can only be created for successful payments!",
                success:false
            })
        }
        const refund=await stripe.refunds.create({
            payment_intent: order.payment.paymentIntentId,
            amount: amount * 100, // Stripe ==> amount in cents
            reason: reason,
            metadata: {
                orderId: order._id.toString(),
                userId: order.user ? order.user.toString() : 'guest'
            }
        });
        order.refunds.push({
            refundId: refund.id,
            amount: refund.amount / 100, 
            currency: refund.currency,
            reason: reason,
            status: refund.status,
            orderId: order._id
        })
        const totalRefunded=order.refunds.reduce((total,r)=>total + r.amount,0);
        const orderTotalCents=Math.round(order.totalAmount * 100);
        if(totalRefunded >= orderTotalCents){
            order.payment.status='Refunded';
        }
        await order.save();
        res.status(201).json({
            message:"Refund created successfully!",
            success:true,
            refund: {
                refundId: refund.id,
                amount: refund.amount / 100, 
                currency: refund.currency,
                reason: reason,
                status: refund.status,
                orderId: order._id
            }
            
        })
    } catch (error) {
        
    }
}