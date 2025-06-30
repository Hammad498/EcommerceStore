
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

export const createOrder=async(req,res)=>{
    try {
        
    } catch (error) {
        
    }
}







export const getOrderById=async(req,res)=>{
    try {
        
    } catch (error) {
        
    }
}



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
        
    } catch (error) {
        
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




