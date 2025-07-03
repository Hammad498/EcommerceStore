
import Promotion from '../models/promotion.model.js';


export const initialValidation = (req) => {
    if (!req.body.title || !req.body.type || !req.body.startDate || !req.body.endDate) {
        return {
            success: false,
            message: "Title, type, start date, and end date are required"
        };
    }
    return { success: true };
};




export const dateValidation=(startDate,endDate)=>{
    if(new Date(startDate) >= new Date(endDate)){
        return {
            success: false,
            message: "Start date must be before the end date"
        };
    }
    return { success: true };
}


export const validatePromotionType=(type,category,product)=>{
    if(type === 'category' && !category) {
        return {
            success: false,
            message: "Category is required for category promotions"
        };
    }
    if(type === 'product' && !product) {
        return {
            success: false,
            message: "Product is required for product promotions"
        };
    }
    if(type !== 'category' && type !== 'product' && type !== 'custom') {
        return {
            success: false,
            message: "Type must be either 'category', 'product', or 'custom'"
        };
    }
    return { success: true };
}


//////////////////////////////////////////////////

export const checkPromotionOverlap=async ({ type, category, product, startDate, endDate }) => {
  return await Promotion.findOne({
    type,
    category: type === 'category' ? category : undefined,
    product : type === 'product'  ? product  : undefined,
    isActive: true,
    $or: [
      { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }
    ]
  });
};



///////////////////////////////////////////////////


export const applyBestDiscount = (variation, promotions = []) => {
  const basePrice = variation.price;
  const staticDiscount = variation.discountPrice || basePrice;

  const currentDate = new Date();
  const applicablePromotions = promotions.filter(promo =>
    promo.isActive &&
    new Date(promo.startDate) <= currentDate &&
    new Date(promo.endDate) >= currentDate
  );

  if (applicablePromotions.length === 0) {
    return {
      basePrice,
      discountPrice: staticDiscount,
      finalPrice: staticDiscount,
      variation,
      promotion: null
    };
  }

  let promotedDiscountPrice = basePrice;
  let bestPromo = null;

  for (const promo of applicablePromotions) {
    if (promo.discount && promo.discount > 0) {
      const tempPrice = basePrice - ((basePrice * promo.discount) / 100);
      if (tempPrice < promotedDiscountPrice) {
        promotedDiscountPrice = tempPrice;
        bestPromo = promo._id;
      }
    }
  }

  const finalPrice = Math.min(promotedDiscountPrice, staticDiscount);

  return {
    basePrice,
    discountPrice: finalPrice > 0 ? finalPrice : 0,
    finalPrice,
    promotion: bestPromo,
    variation: {
      ...variation,
      price: basePrice,
      discountPrice: finalPrice > 0 ? finalPrice : 0
    }
  };
};
