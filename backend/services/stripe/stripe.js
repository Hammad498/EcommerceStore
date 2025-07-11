import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();


const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);



// export const createStripeCheckoutSession = async ({ user, cartItems, successUrl, cancelUrl }) => {
//     const lineItems = cartItems.map(item => {
//         const unitAmount = Math.round(
//             ((typeof item.discountPrice === 'number' && item.discountPrice > 0)
//                 ? item.discountPrice
//                 : item.price || 0) * 100
//         );

//         const productData = {
//             name: item.product.name || 'Unnamed Product',
//             description: item.product.description || '',
//         };

        
//         if (item.product.image && typeof item.product.image === 'string' && item.product.image.trim() !== '') {
//             productData.images = [item.product.image];
//         }

//         return {
//             price_data: {
//                 currency: 'usd',
//                 product_data: productData,
//                 unit_amount: unitAmount,
//             },
//             quantity: item.quantity || 1,
//         };
//     });

//     const session = await stripe.checkout.sessions.create({
//         payment_method_types: ['card'],
//         line_items: lineItems,
//         mode: 'payment',
//         customer_email: user?.email || undefined,
//         success_url: successUrl,
//         cancel_url: cancelUrl,
//         metadata: {
//             userId: user ? user._id.toString() : 'guest',
//             cartItems: JSON.stringify(cartItems.map(item => ({
//                 productId: item.product._id,
//                 variation: item.variantSKU || '',
//                 quantity: item.quantity,
//             }))),
//         },
//     });

//     return session;
// };



export const createStripeCheckoutSession = async ({ user, cartItems, successUrl, cancelUrl }) => {
    const lineItems = cartItems.map(item => {
        const unitAmount = Math.round(
            ((typeof item.discountPrice === 'number' && item.discountPrice > 0)
                ? item.discountPrice
                : item.price || 0) * 100
        );

        const productData = {
            name: item.product.name || 'Unnamed Product',
            description: item.product.description || '',
        };

        if (item.product.image && typeof item.product.image === 'string' && item.product.image.trim() !== '') {
            productData.images = [item.product.image];
        }

        return {
            price_data: {
                currency: 'usd',
                product_data: productData,
                unit_amount: unitAmount,
            },
            quantity: item.quantity || 1,
        };
    });

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        customer_email: user?.email || undefined,
        success_url: successUrl,
        cancel_url: cancelUrl,
        shipping_address_collection: {
            allowed_countries: ['US', 'IN'], // adjust to your needs
        },
        billing_address_collection: 'required',
        metadata: {
            userId: user ? user._id.toString() : 'guest',
            cartItems: JSON.stringify(cartItems.map(item => ({
                productId: item.product._id,
                variation: item.variation || '',  // ✅ FIXED
                quantity: item.quantity,
            }))),
        },
    });

    return session;
};





export const verifyStripeWebHook=async(req,res)=>{
    const sig = req.headers['stripe-signature'];
    try {
        const event=stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        return event;
    } catch (error) {
        throw new Error(`Webhook Error: ${error.message}`);
    }
}



export const retrieveStripeSession = async (sessionId) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        return session;
    } catch (error) {
        throw new Error(`Failed to retrieve Stripe session: ${error.message}`);
    }
};



export const retrievePaymentIntent=async(paymentIntentId)=>{
    return await stripe.paymentIntents.retrieve(paymentIntentId);
}


export default stripe;

