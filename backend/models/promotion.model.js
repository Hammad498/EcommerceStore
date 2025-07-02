import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  
  images: [{
    url: { type: String, required: true },
    public_id: String,
    isPrimary: { type: Boolean, default: false },
    alt: String,
  }],
  
  link: { type: String },

  type: {
    type: String,
    enum: ['category', 'product', 'custom'],
    required: true,
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: function () {
      return this.type === 'category';
    }
  },

  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: function () {
      return this.type === 'product';
    }
  },

  isActive: { type: Boolean, default: true },

  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },

  priority: { type: Number, default: 0 },

  discount: {
    type: Number,
    min: [0, 'Discount must be >= 0'],
    max: [100, 'Discount cannot exceed 100'],
  },
}, {
  timestamps: true
});

const Promotion = mongoose.model('Promotion', promotionSchema);
export default Promotion;
