// import mongoose from 'mongoose';

// const orderItemSchema = new mongoose.Schema({
//   product: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Product",
//     required: true
//   },
//   productTitle: { type: String }, 
//   variation: { type: String, required: true }, 
//   attributes: { type: Object }, 
//   quantity: { type: Number, required: true, min: 1 },
//   price: { type: Number, required: true }, 
//   discountPrice: { type: Number, default: 0 },
//   total: { type: Number, required: true } 
// }, { _id: false });





// const orderSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: false
//   },
//   sessionId: {
//     type: String,
//     required: false
//   },
//   items: [orderItemSchema],
  
//   shippingAddress: {
//     fullName: String,
//     addressLine1: String,
//     addressLine2: String,
//     city: String,
//     state: String,
//     postalCode: String,
//     country: String,
//     phone: String
//   },

//   billingAddress: {
//     fullName: String,
//     addressLine1: String,
//     addressLine2: String,
//     city: String,
//     state: String,
//     postalCode: String,
//     country: String,
//     phone: String
//   },

//   payment: {
//     method: {
//       type: String,
//       enum: ["Stripe"],
//       default: "Stripe"
//     },
//     status: {
//       type: String,
//       enum: ["Pending", "Paid", "Failed", "Refunded"],
//       default: "Pending"
//     },
//     stripePaymentIntentId: { type: String },
//     stripeCustomerId: { type: String },
//     paidAt: { type: Date }
//   },

//   deliveryStatus: {
//     type: String,
//     enum: ["Pending", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled", "Returned"],
//     default: "Pending"
//   },

//   totalAmount: {
//     type: Number,
//     required: true
//   },

//   currency: {
//     type: String,
//     default: "usd"
//   },

//   isGuestOrder: {
//     type: Boolean,
//     default: false
//   },

//   notes: {
//     type: String
//   }

// }, { timestamps: true });

// orderSchema.methods.calculateTotal = function () {
//   return this.items.reduce((sum, item) => sum + item.total, 0);
// };

// const Order = mongoose.model("Order", orderSchema);
// export default Order;

/////////////////////////////////////


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
    status: { type: String, default: 'Pending' }
  },
  deliveryStatus: { type: String, default: 'Pending' },
  isGuestOrder: { type: Boolean, default: false },
  notes: String
}, {
  timestamps: true
});

const Order = mongoose.model('Order', OrderSchema);
export default Order;
