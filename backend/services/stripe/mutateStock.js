


import Product from "../../models/product/product.model.js";
import mongoose from "mongoose";



export const mutateStock = async (lines, op = "decrease", session = null) => {
  for (const { productId, sku, qty } of lines) {
    const product = await Product.findById(productId).session(session);
    if (!product) throw new Error(`Product ${productId} not found`);

    const variation = product.variations.find(
      v => v.variantSKU.trim().toLowerCase() === sku.trim().toLowerCase()
    );
    if (!variation) throw new Error(`SKU ${sku} not in product ${productId}`);

    if (op === "decrease") {
      if (variation.stock < qty)
        throw new Error(`Not enough stock for ${sku}`);
      variation.stock -= qty;
    } else {
      variation.stock += qty;
    }

    await product.save({ session });       
    console.log(
      `[Stock] ${op} ${qty}  ${sku}  → new stock ${variation.stock}`
    );
  }
};