import mongoose from 'mongoose';


const categorySchema=new mongoose.Schema({
    name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true
  },
  images: { type: [String], default: [] },

  isActive: {
    type: Boolean,
    default: true
  },
  // Define what attributes this category products can have
  attributes: [{
    name: {
      type: String,
      required: true
    }, // e.g., "Color", "Memory", "Storage", "Size"
    type: {
      type: String,
      enum: ['dropdown', 'color', 'size', 'text'],
      required: true
    },
    required: {
      type: Boolean,
      default: false
    },
    options: [String] // e.g., ["Space Gray", "Silver"] for Color
  }]
}
, {
  timestamps: true,}
);

const Category = mongoose.model('Category', categorySchema);
export default Category;