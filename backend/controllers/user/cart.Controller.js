import Cart from "../../models/cart.model.js";
import { getCartIdentifier } from "../../services/cartIdentifier.js";
import validateProductAndVariation from "../../validation/productCart.validation.js";




export const addToCart = async (req, res) => {
  try {
    const { product, variation, quantity } = req.body;

    if (!product || !quantity) {
      return res.status(400).json({ message: "Product and quantity are required" });
    }

    const { valid, message } = await validateProductAndVariation(product, variation);
    if (!valid) return res.status(400).json({ message });

    const identifier = getCartIdentifier(req);
    if (!identifier) {
      return res.status(400).json({ message: "User or session ID required" });
    }

    const query = identifier.type === "user"
      ? { user: identifier.id, isOrdered: false }
      : { sessionId: identifier.id, isOrdered: false };

    let existingCart = await Cart.findOne(query);

    if (existingCart) {
      const existingItem = existingCart.items.find(
        item => item.product.toString() === product && item.variation === variation
      );

      if (existingItem) {
        existingItem.quantity += parseInt(quantity);
      } else {
        existingCart.items.push({ product, variation, quantity });
      }

      existingCart.updatedAt = new Date();
      await existingCart.save();

      return res.status(200).json({
        message: "Cart updated",
        cart: existingCart
      });
    }

    
    const newCart = new Cart({
      user: identifier.type === "user" ? identifier.id : undefined,
      sessionId: identifier.type === "guest" ? identifier.id : undefined,
      items: [{ product, variation, quantity }],
      updatedAt: new Date()
    });

    await newCart.save();

    return res.status(201).json({
      message: "Cart created and item added",
      cart: newCart
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

///////


/////////////////


/////////////////////////////////

//get current user or guest cart

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
        res.status(200).json({
            success: true,
            message: "Cart fetched successfully",
            data: [cart,cart._id]
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

export const updateCartItem=async(req,res)=>{
    try {
        const {product, variation, quantity} = req.body;
        
        if (!product || !quantity) {
            return res.status(400).json({ message: "Product and quantity are required" });
        }
        const { valid, message } = await validateProductAndVariation(product, variation);
    if (!valid) return res.status(400).json({ message });
        const identifier = getCartIdentifier(req);
        const query = identifier.type === "user"? { user: identifier.id, isOrdered: false } : { sessionId: identifier.id, isOrdered: false };
        const cart = await Cart.findOne(query);
        if(!cart){
            return res.status(404).json({
                success:false,
                message:"cart not found!",
                error
            })
        }

        const updatedItem=cart.items.find(item=>item.product.toString()===product && item.variation.toString()===variation);
        if(!updatedItem){
            return res.status(404).json({
                success: false,
                message: "Item not found in cart"
            })
        }
        updatedItem.quantity = quantity;
        cart.updatedAt = new Date();
        await cart.save();
        res.status(200).json({
            success: true,
            message: "Cart item updated successfully",
            data: cart
        });
    } catch (error) {
        console.error("Error updating cart item:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update cart item",
            error: error.message
        });
        
    }
}
////////////////////////////


export const removeFromCart=async(req,res)=>{
    try {
        const {product,variation}=req.body;
        
        if (!product || !variation) {
            return res.status(400).json({ message: "Product and variation are required" });
        }
        const { valid, message } = await validateProductAndVariation(product, variation);
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
        const itemIndex = cart.items.findIndex(item => item.product.toString() === product && item.variation.toString() === variation);
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Item not found in cart"
            });
        }
        cart.items.splice(itemIndex, 1);
        cart.updatedAt = new Date();
        await cart.save();
        res.status(200).json({
            success: true,
            message: "Item removed from cart successfully",
            data: cart
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

export const cleanCart=async(req,res)=>{
    try {
        const identifier = getCartIdentifier(req);
        const query = identifier.type === "user"? { user: identifier.id, isOrdered: false } : { sessionId: identifier.id, isOrdered: false };
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
        res.status(200).json({
            success: true,
            message: "Cart cleaned successfully",
            data: cart
        });
    } catch (error) {
        console.error("Error cleaning cart:", error);
        res.status(500).json({
            success: false,
            message: "Failed to clean cart",
            error: error.message
        });
        
    }
}