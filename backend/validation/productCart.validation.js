


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
