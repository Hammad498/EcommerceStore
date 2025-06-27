import mongoose from 'mongoose';
import {Schema} from 'mongoose';

const cartItemSchema=new Schema({
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product",
        required:true
    },
    variation:{
        type:String,
        required:true
    },
    quantity:{
        type:Number,
        required:true,
        min:1
    },
})


const cartSchema=new Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:null   ///if guest 
    },
    sessionId:{
        type:String,
        required:false  //for guest users
    },
    items:[cartItemSchema],
    isOrdered:{
        type:Boolean,
        default:false
    },
    updatedAt:{
        type:Date,
        default:Date.now
    }
},{timestamps:true});


cartSchema.methods.totalItems=function(){
    return this.items.reduce((total, item) => total + item.quantity, 0);
};

const Cart=mongoose.model("Cart",cartSchema);
export default Cart