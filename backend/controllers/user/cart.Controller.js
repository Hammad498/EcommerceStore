import Cart from "../../models/cart.model.js";
import { getCartIdentifier } from "../../services/cartIdentifier.js";
import validateProductAndVariation from "../../validation/productCart.validation.js";
import Product from "../../models/product/product.model.js";
import { enrichCartItemsWithPrice } from "../../services/enrichCartItemsWithPrice.js";








export const addToCart = async (req, res) => {
  try {
    const { product, variation, quantity } = req.body;

    if (!product || !variation || !quantity) {
      return res.status(400).json({ message: "Product, variation, and quantity are required" });
    }

    const identifier = getCartIdentifier(req);
    if (!identifier) {
      return res.status(400).json({ message: "User or session ID required" });
    }

    const productDoc = await Product.findById(product);
    if (!productDoc) {
      return res.status(404).json({ message: "Product not found" });
    }

    const matchedVariation = productDoc.variations.find(
      (v) => v.variantSKU.toLowerCase() === variation.toLowerCase()
    );

    if (!matchedVariation) {
      return res.status(400).json({ message: "Variation not found for product" });
    }

    ////stock check before adding in the cart (2 conditions 1.if req is greater than stock and 2.not null(req))
    const reqQty=parseInt(quantity);
    if( matchedVariation && matchedVariation.stock && matchedVariation.stock >=0 &&    matchedVariation.stock < reqQty){
      return res.status(400).json({
        message:`Req qty ${reqQty} exceeds available stock ${matchedVariation.stock} for this variation`,
        error
      })
    }

    if(reqQty <=0){
      return res.status(400).json({
        message: "Quantity must be greater than zero"
      })
    }

    const query = identifier.type === "user"
      ? { user: identifier.id, isOrdered: false }
      : { sessionId: identifier.id, isOrdered: false };

    let cart = await Cart.findOne(query);

    if (cart) {
      const existingItem = cart.items.find(
        item => item.product.toString() === product &&
                item.variation === matchedVariation.variantSKU
      );

      if (existingItem) {
        const newQty=existingItem.quantity + reqQty;
        if(newQty >matchedVariation.stock){
          return res.status(400).json({
            message: `Req qty ${newQty} exceeds available stock ${matchedVariation.stock} for this variation`
          });
        }
        existingItem.quantity = newQty;
      } else {
        cart.items.push({ product, variation: matchedVariation.variantSKU, quantity: reqQty });
      }

      matchedVariation.stock -= reqQty; 

      await Product.updateOne(
        { _id: product, "variations.variantSKU": matchedVariation.variantSKU },
        { $set: { "variations.$.stock": matchedVariation.stock } }
      );

      cart.updatedAt = new Date();
      await cart.save();
    } else {
      cart = new Cart({
        user: identifier.type === "user" ? identifier.id : undefined,
        sessionId: identifier.type === "guest" ? identifier.id : undefined,
        items: [{ product, variation: matchedVariation.variantSKU, quantity: reqQty }],
        updatedAt: new Date()
      });

      matchedVariation.stock -= reqQty;
      await Product.updateOne(
        { _id: product, "variations.variantSKU": matchedVariation.variantSKU },
        { $set: { "variations.$.stock": matchedVariation.stock } }
      );
      cart.wasNew = true;
      cart.createdAt = new Date();
      cart.isOrdered = false; 

      await cart.save();
    }

    const enrichedCart = await enrichCartItemsWithPrice(cart);

    return res.status(cart.wasNew ? 201 : 200).json({
      message: cart.wasNew ? "Cart created and item added" : "Cart updated",
      cart: enrichedCart
    });

  } catch (error) {
    console.error("Error adding to cart:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add item to cart",
      error: error.message
    });
  }
};

//////////////////////////////

export const getCart=async(req,res)=>{
    try {
        const identifier = getCartIdentifier(req);
        const query = identifier.type === "user"? { user: identifier.id, isOrdered: false } : { sessionId: identifier.id, isOrdered: false };
        const cart = await Cart.findOne(query);

        if (!cart){
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            })
        }

        //only get the product that re in cart not the product with all variation/details get only that matches



        const enrichedCart = await enrichCartItemsWithPrice(cart);


        res.status(200).json({
            success: true,
            message: "Cart fetched successfully",
            data: [enrichedCart]
        });
    } catch (error) {
        console.error("Error fetching cart:", error);   
        res.status(500).json({
            success: false,
            message: "Failed to fetch cart",
            error: error.message
        });
    }
}


//////////////////////////////////////////




export const updateCartItem = async (req, res) => {
  try {
    const { product, variantSKU, quantity } = req.body;

    if (!product || !variantSKU || !quantity) {
      return res.status(400).json({
        message: "Product, variantSKU, and quantity are required",
      });
    }

    const { valid, message } = await validateProductAndVariation(product, variantSKU);
    if (!valid) {
      return res.status(400).json({ message });
    }

    const identifier = getCartIdentifier(req);
    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: "User or session ID required for cart operations",
      });
    }

    const query =
      identifier.type === "user"
        ? { user: identifier.id, isOrdered: false }
        : { sessionId: identifier.id, isOrdered: false };

    const cart = await Cart.findOne(query);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    // Find the cart item with matching product and variantSKU
    const itemToUpdate = cart.items.find(
      (item) =>
        item.product.toString() === product &&
        item.variation === variantSKU
    );

    if (!itemToUpdate) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    const productDoc=await Product.findById(product);
    const matchedVariation = productDoc.variations.find(
      (v) => v.variantSKU.toLowerCase() === variantSKU.toLowerCase()
    );

    const diffQty=quantity - itemToUpdate.quantity;
    if (matchedVariation && diffQty>0 && matchedVariation.stock < diffQty) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity ${quantity} exceeds available stock ${matchedVariation.stock} for this variation`,
      });
    }

    itemToUpdate.quantity = quantity;
    matchedVariation.stock -= diffQty; 
    await Product.updateOne(
      { _id: product, "variations.variantSKU": variantSKU },
      { $set: { "variations.$.stock": matchedVariation.stock } }
    );



    cart.updatedAt = new Date();
    await cart.save();

    const enrichedCart = await enrichCartItemsWithPrice(cart);

    return res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      data: enrichedCart,
    });
  } catch (error) {
    console.error("Error updating cart item:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update cart item",
      error: error.message,
    });
  }
};








////////////////////////////
///entire product along with all qty it have at that time in cart

export const removeFromCart = async (req, res) => {
  try {
    
    const product     = req.body.product     || req.query.product;
    const variantSKU  = req.body.variantSKU  || req.query.variantSKU;

    if (!product || !variantSKU) {
      return res.status(400).json({ message: "Product and variation are required" });
    }

    
    const { valid, message } = await validateProductAndVariation(product, variantSKU);
    if (!valid) return res.status(400).json({ message });

    
    const idf   = getCartIdentifier(req);
    const query = idf.type === "user"
      ? { user: idf.id,       isOrdered: false }
      : { sessionId: idf.id,  isOrdered: false };

    const cart = await Cart.findOne(query);
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    
    const idx = cart.items.findIndex(
      i => i.product.toString() === product && i.variation === variantSKU
    );
    if (idx === -1) return res.status(404).json({ message: "Item not found in cart" });

    
    const removedItem = cart.items[idx];
    const productDoc = await Product.findById(product);
    const matchedVar = productDoc.variations.find(
      v => v.variantSKU.toLowerCase() === variantSKU.toLowerCase()
    );
    if (!matchedVar) return res.status(404).json({ message: "Variation not found" });

    matchedVar.stock += removedItem.quantity;
    await productDoc.save();

    
    cart.items.splice(idx, 1);
    cart.updatedAt = new Date();

    if (cart.items.length === 0) {
      await cart.deleteOne();
      return res.status(200).json({ message: "Cart is now empty", data: [] });
    }

    await cart.save();
    const enrichedCart = await enrichCartItemsWithPrice(cart);

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      data: enrichedCart
    });

  } catch (err) {
    console.error("removeFromCart error:", err);
    res.status(500).json({ message: "Failed to remove item from cart", error: err.message });
  }
};



/////////////////////////

export const cleanCart = async (req, res) => {
  try {
    const identifier = getCartIdentifier(req);
    
    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: "User or session ID required"
      });
    }

    const query = identifier.type === "user"
      ? { user: identifier.id, isOrdered: false }
      : { sessionId: identifier.id, isOrdered: false };

    const cart = await Cart.findOne(query);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }


    //////stock

    for (const item of cart.items){
      const productDoc=await Product.findById(item.product);  
      if (!productDoc) {
        console.warn(`Product with ID ${item.product} not found, skipping stock update`);
        continue;
      }
      const matchedVariation = productDoc.variations.find(
        v => v.variantSKU.toLowerCase() === item.variation.toLowerCase()
      );
      matchedVariation.stock += item.quantity; 
      await productDoc.save();
    }

    //////////

    const removeItems = cart.items.map(item => ({
      product: item.product,
      variation: item.variation,
      quantity: item.quantity
    }));
    console.log("Removing items from cart:", removeItems);
    

    cart.items = [];
    cart.updatedAt = new Date();
    await cart.save();

    const enrichedCart = await enrichCartItemsWithPrice(cart);

    res.status(200).json({
      success: true,
      message: "Cart cleaned successfully",
      data: [cart, enrichedCart]
    });

  } catch (error) {
    console.error("Error cleaning cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clean cart",
      error: error.message
    });
  }
};
