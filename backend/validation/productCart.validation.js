import Product from "../models/product/product.model.js";

const validateProductAndVariation = async (productId, variationValue) => {
  const product = await Product.findById(productId);
  if (!product) return { valid: false, message: "Product not found" };

  const matchedVariation = product.variations.find(
    v => v.attributes?.material?.toLowerCase() === variationValue.toLowerCase()
  );

  if (!matchedVariation) return { valid: false, message: "Variation not found for product" };

  return { valid: true, product, matchedVariation };
};


export default validateProductAndVariation