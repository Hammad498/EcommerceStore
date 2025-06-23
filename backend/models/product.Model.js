import mongoose from "mongoose";

const variationSchema = new mongoose.Schema({
  color: {
     type: String,
      required: true 
    },
  size: { 
    type: String,
     required: true 
    },
  price: {
     type: Number,
      required: true 
    },
  stock: {
     type: Number,
      required: true 
    },
  images: [{ type: String }] 
}, { _id: false });

const specSchema = new mongoose.Schema({
  key: {
     type: String,
      required: true 
    },
  value: {
     type: String,
      required: true
     }
}, { _id: false });

const reviewSchema = new mongoose.Schema({
  user: {
     type: mongoose.Schema.Types.ObjectId,
      ref: "User" 
    },
  rating: {
     type: Number,
      min: 1,
       max: 5 
    },
  comment: String,
  createdAt: { type: Date, default: Date.now }
}, { _id: false });





const productSchema = new mongoose.Schema({
  title: {
     type: String,
      required: true 
    },
  slug: { 
    type: String,
     required: true,
      unique: true 
    },
  description: {
     type: String 
    },
  brand: {
     type: String,
      required: true 
    },
  category: { 
    type: String, 
    enum: ["electronics", "furniture", "utensils"], 
    required: true 
  },
  tags: [{ type: String }],
  variations: [variationSchema],
  specs: [specSchema],

  sku: { type: String, unique: true },

  images: [{ type: String }], 

  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  reviews: [reviewSchema],

  discount: {
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      default: null
    },
    value: { type: Number, default: 0 },
    validFrom: Date,
    validUntil: Date
  },

  availability: {
    type: String,
    enum: ["in-stock", "out-of-stock", "limited"],
    default: "in-stock"
  },

  isActive: {
    type: Boolean,
    default: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }

});

const Product = mongoose.model("Product", productSchema);
export default Product;
