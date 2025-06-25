import mongoose from "mongoose";


const reviewSchema = new mongoose.Schema({
    product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  variation: {
    type: String 
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  images: [{
    url: String,
    alt: String
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  helpful: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
},
{
  timestamps: true
});

reviewSchema.index({ product: 1, user: 1 }, { unique: true });


const Review = mongoose.model('Review', reviewSchema);
export default Review;

reviewSchema.post('save', async function() {
  await updateProductRating(this.product);
});

reviewSchema.post('remove', async function() {
  await updateProductRating(this.product);
});

async function updateProductRating(productId) {
  const Review = mongoose.model('Review');
  const Product = mongoose.model('Product');
  
  const stats = await Review.aggregate([
    { $match: { product: productId, isActive: true } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  
  const rating = stats.length > 0 ? {
    average: Math.round(stats[0].averageRating * 10) / 10,
    count: stats[0].totalReviews
  } : { average: 0, count: 0 };
  
  await Product.findByIdAndUpdate(productId, { ratings: rating });
}