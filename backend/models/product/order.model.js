


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

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  sessionId: { type: String, default: null },
  items: [OrderItemSchema],
  shippingAddress: {
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  billingAddress: {
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  totalAmount: { type: Number, required: true },
  currency: { type: String, default: 'usd' },
  payment: {
    method: String,
    status: { type: String, default: 'Pending' },
   
  },
  deliveryStatus: { type: String, default: 'Pending' },
  isGuestOrder: { type: Boolean, default: false },
  notes: String
}, {
  timestamps: true
});

const Order = mongoose.model('Order', OrderSchema);
export default Order;
