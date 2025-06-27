import Review from "../../models/product/review.model.js";



export const createReview = async (req, res) => {
  try {
    const { product, variation, rating, title, comment } = req.body;
    const user = req.user;

    if (!product || !rating || !comment) {
      return res.status(400).json({ message: "Product, rating, and comment are required" });
    }

    const existingReview = await Review.findOne({ product, user: user._id });
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    const images = (req.uploadedImages || []).map(img => ({
      url: img.url,
      alt: img.alt || "Review image"
    }));

    const review = new Review({
      product,
      user: user._id,
      variation,
      rating,
      title,
      comment,
      isVerified: user.isVerified || false, 
      images
    });

    await review.save();

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create review",
      error: error.message
    });
  }
};

/////////////////////////////////////////

export const getProductReviews=async(req,res)=>{
    try {
        const  { productId } = req.params;
        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }
        const reviews = await Review.find({ product: productId })
            .populate("user", "name email")
            .sort({ createdAt: -1 });
        if (!reviews || reviews.length === 0) {
            return res.status(404).json({ message: "No reviews found for this product" });
        }
        res.status(200).json({
            success: true,
            message: "Reviews fetched successfully",
            data: reviews
        });

    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch reviews",
            error: error.message
        });
    }
}
//////////////////////////////////////////



export const deleteReview=async(req,res)=>{
    try {
        const { reviewId } = req.params;
        if (!reviewId) {
            return res.status(400).json({ message: "Review ID is required" });
        }
        const review=await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }
        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this review" });
        }
        await Review.findByIdAndDelete(reviewId);
        res.status(200).json({
            success: true,
            message: "Review deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete review",
            error: error.message
        });
    }
}


//////////////////////////////


export const toggleHelpful=async(req,res)=>{
    try {
        const { reviewId } = req.params;
        if (!reviewId) {
            return res.status(400).json({ message: "Review ID is required" });
        }
        const {increment =1}=req.body;

        const review=await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }
        if (increment !== 1 && increment !== -1) {
            return res.status(400).json({ message: "Increment value must be 1 or -1" });
        }
        review.helpfulCount = (review.helpfulCount || 0) + increment;
        await review.save();
        res.status(200).json({
            success: true,
            message: "Helpful status toggled successfully",
            data: review
        });
    } catch (error) {
        console.error("Error toggling helpful status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to toggle helpful status",
            error: error.message
        });
    }
}