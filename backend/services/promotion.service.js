
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






export const applyBestDiscount = (variation, promotions = []) => {
  const basePrice      = Number(variation.price);
  const staticDiscount = variation.discountPrice > 0 ? Number(variation.discountPrice) : null;
  const now = new Date();

  // keep only promos that really apply to *this* variation
  const activePromos = promotions.filter(p =>
    p.isActive &&
    new Date(p.startDate) <= now &&
    new Date(p.endDate)   >= now &&
    (
      p.type === 'variation'
        ? p.variationSKU === variation.variantSKU          // variation match
        : true                                             // product / category already pre‑filtered
    )
  );

  let bestPrice = basePrice;
  let bestPromo = null;

  activePromos.forEach(p => {
    if (p.discount > 0) {
      const promoPrice = +(basePrice * (1 - p.discount / 100)).toFixed(2);
      if (promoPrice < bestPrice) {
        bestPrice = promoPrice;
        bestPromo = p._id;
      }
    }
  });

  const finalPrice = staticDiscount !== null
    ? Math.min(bestPrice, staticDiscount)
    : bestPrice;

  return {
    ...variation,
    basePrice,
    staticDiscount,
    promoId: bestPromo,
    finalPrice
  };
};

