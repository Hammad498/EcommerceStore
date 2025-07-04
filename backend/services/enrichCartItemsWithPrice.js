




import Cart from "../models/cart.model.js";
import Product from "../models/product/product.model.js";
import Promotion from "../models/promotion.model.js";
import {applyBestDiscount} from './promotion.service.js';
import Category from "../models/product/category.model.js";



export const enrichCartItemsWithPrice = async (cart) => {
  const now = new Date();

  
  const promos = await Promotion.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).select("type category product variationSKU discount");

 
  const populated = await Cart.populate(cart, {
    path: "items.product",
    select: "title variations images category",
  });

  
  const enrichedItems = populated.items.map((item) => {
    const prod = item.product;
    if (!prod) return null;



    const variation = prod.variations.find(
      (v) =>
        v.variantSKU?.trim().toLowerCase() ===
        item.variation?.trim().toLowerCase()
    );

    if (!variation) {
      console.warn("No matching variation found for:", item.variation);
      return null;
    }

    const matchedPromos = promos.filter((p) =>
      (p.type === "category" &&
        p.category?.toString() === (prod.category?._id || prod.category)?.toString()) ||
      (p.type === "product" &&
        p.product?.toString() === prod._id.toString()) ||
      (p.type === "variation" &&
        p.variationSKU?.trim().toLowerCase() === variation.variantSKU?.trim().toLowerCase())
    );

    
    if (variation.price == null) {
  console.error(" Variation missing price:", variation);
}
    if (variation.basePrice == null) {
  console.error("Variation missing basePrice:", variation);
}


  
    const plainVariation = variation.toObject ? variation.toObject() : variation;
const pricedVar = applyBestDiscount(plainVariation, matchedPromos);



    const finalPrice = Number(pricedVar.finalPrice);
    const totalPrice = finalPrice * Number(item.quantity);

    if (isNaN(finalPrice) || isNaN(totalPrice)) {
      console.error("Invalid final or total price for SKU:", pricedVar.variantSKU);
      return null;
    }

    
    return {
      productId: prod._id,
      title: prod.title,
      variantSKU: pricedVar.variantSKU,
      attributes: pricedVar.attributes,
      image: pricedVar.images?.[0]?.url || null,
      quantity: item.quantity,
      unitPrice: pricedVar.basePrice,
      discountPrice: pricedVar.staticDiscount ?? null,
      promoDiscount: pricedVar.discountPercent || 0,
      finalPricePerUnit: finalPrice,
      totalPrice: totalPrice
    };
  }).filter(Boolean);

  
  return {
    _id: populated._id,
    user: populated.user,
    sessionId: populated.sessionId,
    items: enrichedItems,
    isOrdered: populated.isOrdered,
    updatedAt: populated.updatedAt,
    createdAt: populated.createdAt,
  };
};
