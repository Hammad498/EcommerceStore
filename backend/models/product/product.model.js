import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title:{
    type: String,
    required: true,
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
    required: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  
  // Base product information
  baseSKU: {
    type: String,
    required: true,
    unique: true
  },
  
  // Images for the main product (can be overridden by variations)
  images: [{
    url: String, // Cloudinary URL
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // Product variations 
  variations: [{
    // Variation identifier
    variantSKU: {
      type: String,
      required: true,
      unique: true
    },
    
    // Attributes that make this variation unique
    attributes: {
      type: Map,
      of: String
      // Example: { "Color": "Space Gray", "Memory": "16GB", "Storage": "1TB SSD" }
    },
    
    // Variation-specific data
    price: {
      type: Number,
      required: true
    },
    discountPrice: {
      type: Number,
      default: 0
    },
    stock: {
      type: Number,
      required: true,
      min: 0
    },
    
    // Variation-specific images (optional - inherits from main product if not provided)
    images: [{
      url: String,
      alt: String,
      isPrimary: {
        type: Boolean,
        default: false
      }
    }],
    
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Overall product ratings and reviews (shared across all variations)
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  
  // SEO and status
  metaTitle: String,
  metaDescription: String,
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Admin who created/modified
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
},{
  timestamps: true
});

productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ 'variations.variantSKU': 1 });
productSchema.index({ brand: 1 });

// Virtual for getting active variations
productSchema.virtual('activeVariations').get(function() {
  return this.variations.filter(variation => variation.isActive);
});

// Method to get price range
productSchema.methods.getPriceRange = function() {
  const activeVariations = this.variations.filter(v => v.isActive);
  if (activeVariations.length === 0) return { min: 0, max: 0 };
  
  const prices = activeVariations.map(v => v.discountPrice > 0 ? v.discountPrice : v.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
};

productSchema.methods.isInStock = function() {
  return this.variations.some(v => v.isActive && v.stock > 0);
};


const ProductVariation = mongoose.model('ProductVariation', productSchema);
export default ProductVariation;