


import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  product: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    title: String,
    description: String,
    image: String
  },
  variation: {
    material: String,
    color: String,
    sku: String,
    price: Number,
    discountPrice: Number,
    images: [
      {
        url: String,
        alt: String,
        isPrimary: Boolean
      }
    ]
  },
  quantity: { type: Number, required: true },
  total: { type: Number, required: true }
});


const addressSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  companyName: String,
  addressLine1: String,
  addressLine2: String,
  city: {
    type: String,
   
    default: 'Other',
  },
  state: {
    type: String,
   
    default: 'Other',
  },
  postalCode: String,
  country: {
    type: String,
    
    default: 'Other',
  },
  email: {
    type: String,
    match: /.+\@.+\..+/,
  },
  phone: {
    type: String,
    
  },
}, { _id: false });











const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  sessionId: { type: String, default: null },
  items: [OrderItemSchema],

  shippingAddress: addressSchema,
  billingAddress: addressSchema,


  totalAmount: { type: Number, required: true },
  currency: { type: String, default: 'usd' },
  payment: {
    method: String,
    sessionId:{type:String},
   paymentIntentId: String,
  status: { type: String, enum: ['Pending', 'Paid', 'Refunded'], default: 'Pending' }
  },
  linesForStock: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      sku: String,
      qty: Number
    }
  ],
 refunds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Refund' }],
  deliveryStatus: { type: String, default: 'Pending' },

  trackingHistory:[
    {
      status:String,
      enum:['Order Placed','Packaging','On the road','Delivered', 'Cancelled'],
      timestamp: { type: Date, default: Date.now },
      message:String
    }
  ],

  orderFeedback: [
  {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }
],






  isGuestOrder: { type: Boolean, default: false },
  notes: String
}, {
  timestamps: true
});

const Order = mongoose.model('Order', OrderSchema);
export default Order;
