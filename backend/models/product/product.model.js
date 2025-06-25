


import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  alt: { type: String },
  isPrimary: { type: Boolean, default: false },
});

const variationSchema = new mongoose.Schema({
  variantSKU: { type: String, required: false, unique: false },
  attributes: {
    type: Object, 
    required: true
  },
  price: { type: Number, required: true },
  discountPrice: { type: Number, default: 0 },
  stock: { type: Number, required: true, min: 0 },
  images: [imageSchema],
  isActive: { type: Boolean, default: true },
});

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, required: true },
  brand: { type: String, required: true, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  baseSKU: { type: String, required: false, unique: false},
  badges: {
    type: [String],
    enum: ["Hot", "Trending", "Best Seller", "New Arrival", "Limited Stock"],
    default: []
  },
  images: [imageSchema],
  variations: [variationSchema],
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  metaTitle: String,
  metaDescription: String,
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, {
  timestamps: true,
});

productSchema.virtual("activeVariations").get(function () {
  return this.variations.filter(v => v.isActive);
});

productSchema.methods.getPriceRange = function () {
  const prices = this.activeVariations.map(v => v.discountPrice > 0 ? v.discountPrice : v.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
};

productSchema.methods.isInStock = function () {
  return this.activeVariations.some(v => v.stock > 0);
};

const Product = mongoose.model("Product", productSchema);
export default Product;
