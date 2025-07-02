// import Product from "../models/product/product.model.js";

// const validateProductAndVariation = async (productId, variationValue) => {
//   const product = await Product.findById(productId);
//   if (!product) return { valid: false, message: "Product not found" };

//   const matchedVariation = product.variations.find(
//     v => v.attributes?.material?.toLowerCase() === variationValue.toLowerCase()
//   );

//   if (!matchedVariation) return { valid: false, message: "Variation not found for product" };

//   return { valid: true, product, matchedVariation };
// };


// export default validateProductAndVariation




/////////////////////////


import Product from "../models/product/product.model.js";

const validateProductAndVariation = async (productId, variantSKU) => {
  const product = await Product.findById(productId);
  if (!product) {
    return { valid: false, message: "Product not found" };
  }

  const variation = product.variations.find(
    v => v.variantSKU.toLowerCase() === variantSKU.toLowerCase()
  );

  if (!variation) {
    return { valid: false, message: "Variation not found for product" };
  }

  if (variation.stock <= 0) {
    return { valid: false, message: "Variation is out of stock" };
  }

  return { valid: true, product, variation };
};

export default validateProductAndVariation;
