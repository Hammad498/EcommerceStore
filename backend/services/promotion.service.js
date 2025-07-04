
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


export const validatePromotionType = (type, category, product, variationSKU) => {
  if (type === 'category' && !category) {
    return { success:false, message:'Category is required for category promotions' };
  }
  if (type === 'product' && !product) {
    return { success:false, message:'Product is required for product promotions' };
  }
  if (type === 'variation' && !variationSKU) {
    return { success:false, message:'variationSKU is required for variation promotions' };
  }
  if (!['category','product','variation','custom'].includes(type)) {
    return { success:false, message:'Type must be category, product, variation, or custom' };
  }
  return { success:true };
};



//////////////////////////////////////////////////

// export const checkPromotionOverlap = async ({
//   type, category, product, variationSKU, startDate, endDate
// }) => {
//   return await Promotion.findOne({
//     type,
//     category    : type === 'category'  ? category     : undefined,
//     product     : type === 'product'   ? product      : undefined,
//     variationSKU: type === 'variation' ? variationSKU : undefined,
//     isActive:true,
//     $or:[
//       { startDate:{ $lte:new Date(endDate) }, endDate:{ $gte:new Date(startDate) } }
//     ]
//   });
// };




///////////////////////////////////////////////////










export function applyBestDiscount(variation, promos = []) {
  const basePrice = Number(variation.price);
  const staticDiscount = variation.discountPrice > 0 ? Number(variation.discountPrice) : null;

  let bestDiscountPercent = 0;
  let appliedPromoId = null;

  for (const promo of promos) {
    if (promo.type === "variation") {
      if (
        promo.variationSKU?.trim().toLowerCase() !==
        variation.variantSKU?.trim().toLowerCase()
      ) continue;
    }

    if (promo.discount && Number(promo.discount) > bestDiscountPercent) {
      bestDiscountPercent = Number(promo.discount);
      appliedPromoId = promo._id;
    }
  }

  const promoPrice = bestDiscountPercent
    ? +(basePrice * (1 - bestDiscountPercent / 100)).toFixed(2)
    : basePrice;

  const finalPrice =
    staticDiscount != null ? Math.min(staticDiscount, promoPrice) : promoPrice;

  return {
    ...variation,
    basePrice,
    staticDiscount,
    discountPercent: bestDiscountPercent,
    finalPrice,
    appliedPromoId,
  };
}


