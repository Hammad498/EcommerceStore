


import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, trim: true },
  // images: { type: [String], default: [] },
  images: [
    {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    }        
  ],
  isActive: { type: Boolean, default: true },
  attributes: [{
    name: { type: String, required: true },
    type: { type: String, enum: ['dropdown', 'color', 'size', 'text'], required: true },
    required: { type: Boolean, default: false },
    options: [String]
  }]
}, {
  timestamps: true,
});

const Category = mongoose.model('Category', categorySchema);
export default Category;
