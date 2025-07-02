




import Cart from "../models/cart.model.js";
import Product from "../models/product/product.model.js";

export const enrichCartItemsWithPrice = async (cart) => {
  const populated = await Cart.populate(cart, {
    path: "items.product",
    select: "title variations images"
  });

  const items = populated.items.map(item => {
    const variation = item.product.variations.find(
      v => v.variantSKU.toLowerCase() === item.variation.toLowerCase()
    );

    if (!variation) {
      return null; 
    }

    const finalPrice = variation.discountPrice > 0 ? variation.discountPrice : variation.price;

    return {
      productId: item.product._id,
      title: item.product.title,
      variantSKU: variation.variantSKU,
      attributes: variation.attributes,
      image: variation.images?.[0]?.url || null,
      quantity: item.quantity,
      unitPrice: variation.price,
      discountPrice: variation.discountPrice > 0 ? variation.discountPrice : null,
      finalPricePerUnit: finalPrice,
      totalPrice: finalPrice * item.quantity
    };
  }).filter(Boolean);

  return {
    _id: populated._id,
    user: populated.user,
    sessionId: populated.sessionId,
    items,
    isOrdered: populated.isOrdered,
    updatedAt: populated.updatedAt,
    createdAt: populated.createdAt
  };
};
