import Product from "../../models/product/product.model.js";

export async function mutateStock(lines, op = 'decrease') {
  for (const { productId, sku, qty } of lines) {
    const product = await Product.findById(productId);
    if (!product) throw new Error(`Product ${productId} not found`);
    const variation = product.variations.find(v => v.variantSKU.toLowerCase() === sku.toLowerCase());
    if (!variation) throw new Error(`SKU ${sku} not in product ${productId}`);
    if (op === 'decrease') {
      if (variation.stock < qty) throw new Error(`Not enough stock for ${sku}`);
      variation.stock -= qty;
    } else {
      variation.stock += qty;
    }
    await product.save();
  }
}
