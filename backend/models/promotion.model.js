// models/promotion.model.js
import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
},
  description: {
     type: String 
    },
  image: {
     type: String 
    }, 
  link: {
     type: String
     }, 
  type: {
     type: String, 
     enum: ['category', 'product', 'custom'], 
     required: true 
    },
  category: {
     type: mongoose.Schema.Types.ObjectId, 
     ref: 'Category' 
    },
  product: {
     type: mongoose.Schema.Types.ObjectId, 
     ref: 'Product' 
    },
  isActive: {
     type: Boolean, 
     default: true 
    },
  startDate: {
     type: Date, 
     required: true 
    },
  endDate: {
     type: Date, 
     required: true 
    },
  priority: {
     type: Number, 
     default: 0 
    } // Optional: for ordering
}, {
  timestamps: true
});

const Promotion = mongoose.model('Promotion', promotionSchema);
export default Promotion;
