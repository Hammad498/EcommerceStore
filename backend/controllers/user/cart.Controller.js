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
        existingItem.quantity += parseInt(quantity);
      } else {
        cart.items.push({ product, variation: matchedVariation.variantSKU, quantity });
      }

      cart.updatedAt = new Date();
      await cart.save();
    } else {
      cart = new Cart({
        user: identifier.type === "user" ? identifier.id : undefined,
        sessionId: identifier.type === "guest" ? identifier.id : undefined,
        items: [{ product, variation: matchedVariation.variantSKU, quantity }],
        updatedAt: new Date()
      });

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
            data: [cart,cart._id,enrichedCart]
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

    itemToUpdate.quantity = quantity;
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


export const removeFromCart=async(req,res)=>{
    try {
        const {product,variantSKU}=req.body;
        
        if (!product || !variantSKU) {
            return res.status(400).json({ message: "Product and variation are required" });
        }
        const { valid, message } = await validateProductAndVariation(product, variantSKU);
    if (!valid) return res.status(400).json({ message });
        const identifier = getCartIdentifier(req);
        const query = identifier.type === "user"? { user: identifier.id, isOrdered: false } : { sessionId: identifier.id, isOrdered: false };
        const cart = await Cart.findOne(query);
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }
        const itemIndex = cart.items.findIndex(item => item.product.toString() === product && item.variation.toString() === variantSKU);
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Item not found in cart"
            });
        }
        cart.items.splice(itemIndex, 1);
        cart.updatedAt = new Date();
        await cart.save();
        const enrichedCart = await enrichCartItemsWithPrice(cart);
        res.status(200).json({
            success: true,
            message: "Item removed from cart successfully",
            data: [cart,enrichedCart]
        });
    } catch (error) {
        console.error("Error removing item from cart:", error);
        res.status(500).json({
            success: false,
            message: "Failed to remove item from cart",
            error: error.message
        });
        
    }
}


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
