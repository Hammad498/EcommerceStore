import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const refundSchema=new Schema({
    refundId:{
        type:String,
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    currency:{
        type:String,
        default:'usd'
    },
    reason:{
        type:String,
        required:true
    },
    orderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Order',
        required:true
    },
    status:{
        type:String,
        enum:['Pending','Succeeded ','Failed'],
        default:'Pending'
    },
    createdAt:{
        type:Date,
        default:Date.now
    }

},{_id:false});


const refundModel=mongoose.model("Refund",refundSchema);
export default refundModel;