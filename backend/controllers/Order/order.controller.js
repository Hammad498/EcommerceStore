
import { createStripeCheckoutSession,verifyStripeWebHook,retrieveStripeSession,retrievePaymentIntent } from "../../services/stripe/stripe.js"
import Order from '../../models/product/order.model.js';
import Cart from '../../models/cart.model.js';
import { getCartIdentifier } from "../../services/cartIdentifier.js";


export const createCheckoutSession=async(req,res)=>{
    try {
        const identifier=getCartIdentifier(req);
        if(!identifier){
            return res.status(400).json({message:"Cart identifier is required"});
        }
        const cart=await Cart.findOne(identifier.type === 'user' ? { user: identifier.id } : { sessionId: identifier.id }).populate('items.product items.variation');
        if(!cart || cart.items.length === 0){
            return res.status(400).json({message:"Cart is empty"});
        }
        const cartItems=cart.items.map(item=>({
            product: item.product._id.toString(),
            productTitle: item.product.title,
            variation: item.variation ? item.variation._id.toString() : null,
            quantity: item.quantity,
            price: item.discountPrice > 0 ? item.discountPrice : item.price,
            discountPrice: item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price,
        }))

        const session=await createStripeCheckoutSession({
            user: identifier.type === 'user' ? identifier.id : null,
            cartItems,
            successUrl: `${process.env.CLIENT_URL}/order/success`,
            cancelUrl: `${process.env.CLIENT_URL}/cart`,
        });
        res.status(200).json({ sessionId: session.id });
    } catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
////////////////////////////////////////////////////////////////////////

export const createOrder=async(req,res)=>{
    try {
        const identifier=getCartIdentifier(req);
        if(!identifier){
            return res.status(400).json({message:"Not found!"});
        }
        const cart=await Cart.findOne(identifier.type === 'user' ? { user: identifier.id } : { sessionId: identifier.id }).populate('items.product items.variation');
        if(!cart || cart.items.length === 0){
            return res.status(400).json({message:"Cart is empty"});
        }
        const items=cart.items.map(item=>{
            const product=item.product;
            const unitPrice=product.discountPrice > 0 ? product.discountPrice : product.price;
            return {
                product:product._id.toString(),
                productTitle: product.title,
                variation: item.variation ? item.variation._id.toString() : null,
                attributes:{},
                quantity: item.quantity,
                price: unitPrice,
                discountPrice: product.discountPrice > 0 ? product.discountPrice : product.price,
                total: item.quantity * unitPrice
            }
        })
        const totalAmount=items.reduce((sum,item)=>sum+item.total,0);

        const order=new Order({
            user:identifier.type === 'user' ? identifier.id : null,
            sessionId: identifier.type === 'guest' ? identifier.id : null,
            items,
            shippingAddress: req.body.shippingAddress || {},
            billingAddress: req.body.billingAddress || {},
            totalAmount,
            isGuestOrder:identifier.type === 'guest',
            payment:{
                method: req.body.paymentMethod || 'stripe',
                status: 'pending', 
            },
            notes: req.body.notes || '',
        })
        await order.save();
        await Cart.deleteOne({_id: cart._id});
        res.status(201).json({message:"Order created successfully", orderId: order._id.toString()});
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({message:"Internal server error"});
    }
}




///////////////////////////////////////////////////////////////////////


export const getOrderById=async(req,res)=>{
    try {
        const order=await Order.findById(req.params.id).populate('items.product items.variation user').lean();
        if(!order){
            return res.status(404).json({message:"Order not found"});
        }
        if(order.user && order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin){
            return res.status(403).json({message:"Access denied"});
        }
        if(order.sessionId && order.sessionId !== req.session.id && !req.user.isAdmin){
            return res.status(403).json({message:"Access denied"});
        }

        res.status(200).json(order);
    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({message:"Internal server error"});
    }
}


////////////////////////////////////////////////////////////
export const getOrdersByUser=async(req,res)=>{
    try {
        
    } catch (error) {
        
    }
}


export const updateOrderStatus=async(req,res)=>{
    try {
        
    } catch (error) {
        
    }
}



export const handleStripeWebhook=async(req,res)=>{
    try {
        const event=await verifyStripeWebHook(req,res);
        if(event.type === 'checkout.session.completed'){
            const session=event.data.object;
            console.log("Checkout session completed:", session.id);
        }
        res.status(200).json({ received: true });
            
    } catch (error) {
        console.error("Error handling Stripe webhook:", error);
        res.status(400).json({ error: 'Webhook Error' });
    }
}



export const getAllOrders=async(req,res)=>{
    try {
        
    } catch (error) {
        
    }
}





export const getOrdersByStatus=async(req,res)=>{
    try {
        
    } catch (error) {
        
    }
}




export const deleteOrder=async(req,res)=>{
    try {
        
    } catch (error) {
        
    }
}




