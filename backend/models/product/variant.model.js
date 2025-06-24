import mongoose from "mongoose";

const productVariantSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  sku: {
    type: String,
    required: true,
    unique: true
  },
  attributes: {
    type: Map,
    of: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
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
  stock: {
    type: Number,
    required: true
  },
  availability: {
    type: String,
    enum: ["in-stock", "out-of-stock", "limited"],
    default: "in-stock"
  },
  images: [String] 
}, {
  timestamps: true
});

export default mongoose.model("ProductVariant", productVariantSchema);
