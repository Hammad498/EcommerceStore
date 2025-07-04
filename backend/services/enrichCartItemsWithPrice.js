




import Cart from "../models/cart.model.js";
import Product from "../models/product/product.model.js";
import Promotion from "../models/promotion.model.js";
import {applyBestDiscount} from './promotion.service.js';
import Category from "../models/product/category.model.js";

// export const enrichCartItemsWithPrice = async (cart) => {

  
//   const populated = await Cart.populate(cart, {
//     path: "items.product",
//     select: "title variations images"
//   });

  

  
//   const items = populated.items.map(item => {
//     const variation = item.product.variations.find(
//       v => v.variantSKU.toLowerCase() === item.variation.toLowerCase()
//     );

//     if (!variation) {
//       return null; 
//     }

//     const finalPrice = variation.discountPrice > 0 ? variation.discountPrice : variation.price;
    

//     return {
//       productId: item.product._id,
//       title: item.product.title,
//       variantSKU: variation.variantSKU,
//       attributes: variation.attributes,
//       image: variation.images?.[0]?.url || null,
//       quantity: item.quantity,
//       unitPrice: variation.price,
//       discountPrice: variation.discountPrice > 0 ? variation.discountPrice : null,
//       finalPricePerUnit: finalPrice,
//       totalPrice: finalPrice * item.quantity
//     };
//   }).filter(Boolean);

//   return {
//     _id: populated._id,
//     user: populated.user,
//     sessionId: populated.sessionId,
//     items,
//     isOrdered: populated.isOrdered,
//     updatedAt: populated.updatedAt,
//     createdAt: populated.createdAt
//   };
// };




// export const enrichCartItemsWithPrice = async (cart) => {
//   const now = new Date();

//   const promos = await Promotion.find({
//     isActive: true,
//     startDate: { $lte: now },
//     endDate: { $gte: now },
//   }).select("type category product variationSKU discount");

//   const populated = await Cart.populate(cart, {
//     path: "items.product",
//     select: "title variations images category",
//   });

//   const enrichedItems = populated.items.map((item) => {
//     const prod = item.product;
//     if (!prod) return null;

//     const variation = prod.variations.find(
//       (v) =>
//         v.variantSKU?.trim().toLowerCase() ===
//         item.variation?.trim().toLowerCase() 
//     );
//     if (!variation) return null;

//     const matchedPromos = promos.filter((p) =>
//       (p.type === "category" &&
//         p.category?.toString() ===
//           (prod.category?._id || prod.category)?.toString()) ||
//       (p.type === "product" &&
//         p.product?.toString() === prod._id.toString()) ||
//       (p.type === "variation" && p.variationSKU && prod.variations.some(v=>{
//         v.variantSKU?.trim().toLowerCase() === p.variationSKU.trim().toLowerCase()
//       })
//        )
//     );

    

//     prod.variations = prod.variations.map((v) => { 
//       const promo = matchedPromos.find(
//         (p) =>
//           (p.type === "variation" &&
//             p.variationSKU?.trim().toLowerCase() ===
//               v.variantSKU?.trim().toLowerCase()) ||
//           (p.type === "product" && p.product?.toString() === prod._id.toString()) ||
//           (p.type === "category" &&
//             p.category?.toString() ===
//               (prod.category?._id || prod.category)?.toString())
//       );

//       return applyBestDiscount(v, promo ? [promo] : []);
//     });

//     const prices=prod.variations.map(v => v.finalPrice ?? v.price);
//     prod.priceRange = {
//       min: Math.min(...prices),
//       max: Math.max(...prices),
//     };

  
    
//     return prod.variations.map((v) => {
//       const finalPrice = v.finalPrice ?? (v.discountPrice > 0 ? v.discountPrice : v.price);
//       return {
//         productId: prod._id,
//         title: prod.title,
//         variantSKU: v.variantSKU,
//         attributes: v.attributes,
//         image: v.images?.[0]?.url || null,
//         quantity: item.quantity,
//         unitPrice: v.price,
//         discountPrice: v.discountPrice > 0 ? v.discountPrice : null,
//         promoDiscount: v.discountPercent || 0,
//         finalPricePerUnit: finalPrice,
//         totalPrice: finalPrice * item.quantity,
//       };
//     });
//   }).flat().filter(Boolean);

//   return {
//     _id: populated._id,
//     user: populated.user,
//     sessionId: populated.sessionId,
//     items: enrichedItems,
//     isOrdered: populated.isOrdered,
//     updatedAt: populated.updatedAt,
//     createdAt: populated.createdAt,
//   };
// };








export const enrichCartItemsWithPrice = async (cart) => {
  const now = new Date();

  // Fetch all active promotions
  const promos = await Promotion.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).select("type category product variationSKU discount");

  console.log("Promotions found:", promos.length, promos.map(p => ({
    type: p.type,
    category: p.category?.toString(),
    product: p.product?.toString(),
    variationSKU: p.variationSKU?.trim().toLowerCase(),
    discount: p.discount
  })));

  // Populate product details in cart
  const populated = await Cart.populate(cart, {
    path: "items.product",
    select: "title variations images category",
  });

  console.log("Populated cart items:", populated.items.length);

  // Process each cart item
  const enrichedItems = populated.items.map((item) => {
    const prod = item.product;
    if (!prod) return null;

    console.log("Processing product:", prod.title, "SKU:", item.variation);

    const variation = prod.variations.find(
      (v) =>
        v.variantSKU?.trim().toLowerCase() ===
        item.variation?.trim().toLowerCase()
    );

    if (!variation) {
      console.warn("No matching variation found for:", item.variation);
      return null;
    }

    console.log("Found variation:", variation.variantSKU, "Price:", variation.price);

    // Filter matching promotions
    const matchedPromos = promos.filter((p) =>
      (p.type === "category" &&
        p.category?.toString() === (prod.category?._id || prod.category)?.toString()) ||
      (p.type === "product" &&
        p.product?.toString() === prod._id.toString()) ||
      (p.type === "variation" &&
        p.variationSKU?.trim().toLowerCase() === variation.variantSKU?.trim().toLowerCase())
    );

    console.log("Matched", matchedPromos.length, "promotions for SKU:", variation.variantSKU);
    console.log("Variation before applyBestDiscount:", variation);

    if (variation.price == null) {
  console.error("❌ Variation missing price:", variation);
}
    if (variation.basePrice == null) {
  console.error("❌ Variation missing basePrice:", variation);
}


    // Apply the best discount logic
    const plainVariation = variation.toObject ? variation.toObject() : variation;
const pricedVar = applyBestDiscount(plainVariation, matchedPromos);


    console.log("applyBestDiscount result:", {
      basePrice: pricedVar.basePrice,
      staticDiscount: pricedVar.staticDiscount,
      discountPercent: pricedVar.discountPercent,
      finalPrice: pricedVar.finalPrice
    });

    const finalPrice = Number(pricedVar.finalPrice);
    const totalPrice = finalPrice * Number(item.quantity);

    if (isNaN(finalPrice) || isNaN(totalPrice)) {
      console.error("Invalid final or total price for SKU:", pricedVar.variantSKU);
      return null;
    }

    console.log("Final price per unit:", finalPrice, "Total price:", totalPrice);

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

  // Return the full enriched cart
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
