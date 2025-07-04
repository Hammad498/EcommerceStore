
import Product from "../../../models/product/product.model.js";
import Category from "../../../models/product/category.model.js";
import slugify from "slugify";
import {skuGenerator} from '../../../services/skuGenerator.js'
import mongoose from "mongoose";
import {applyBestDiscount} from '../../../services/promotion.service.js'
import Promotion from "../../../models/promotion.model.js";







/////////////////////////////////



export const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      brand,
      category,
      badges,
      variations,
      metaTitle,
      metaDescription,
      isFeatured,
      slug,
    } = req.body;

    if (!title || !description || !brand || !badges || !category || !variations) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const baseSKU = skuGenerator({ title });

    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const generatedSlug = slug || slugify(title, { lower: true, strict: true });
    const images = req.uploadedImages || [];

    let parsedVariations;
    try {
      parsedVariations = typeof variations === "string" ? JSON.parse(variations) : variations;
    } catch (e) {
      return res.status(400).json({ success: false, message: "Invalid variations format" });
    }

    const requiredAttributes = categoryDoc.attributes
      .filter(attr => attr.required)
      .map(attr => attr.name.toLowerCase());

    for (const [index, variation] of parsedVariations.entries()) {
      for (const attrName of requiredAttributes) {
        if (!variation.attributes || !variation.attributes[attrName]) {
          return res.status(400).json({
            success: false,
            message: `Variation ${index + 1} is missing required attribute: ${attrName}`,
          });
        }
      }
    }

    const processedVariations = parsedVariations.map((variation, index) => {
      const variantSKU = skuGenerator({ title: baseSKU, attributes: variation.attributes }) || `${baseSKU}-${index + 1}`;
      return {
        variantSKU,
        attributes: variation.attributes,
        price: variation.price ?? 0,
        discountPrice: variation.discountPrice ?? 0,
        stock: variation.stock ?? 0,
        isActive: variation.isActive !== false,
        images: [], 
      };
    });

    const product = new Product({
      title,
      slug: generatedSlug,
      description,
      brand,
      category: categoryDoc._id,
      badges,
      baseSKU,
      variations: processedVariations,
      metaTitle,
      metaDescription,
      isFeatured: !!isFeatured,
      images,
      createdBy: req.user?._id,
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });

  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};




//////////////////////////


export const getAllProducts = async (req, res) => {
  try {
    
    const now = new Date();
    const promos = await Promotion.find({
      isActive: true,
      startDate: { $lte: now },
      endDate  : { $gte: now }
    }).select("type category product variationSKU discount");

    
    const catMap = new Map(
      (await Category.find({}).select("name").lean())
        .map(c => [c._id.toString(), c.name.toLowerCase()])
    );

    
    const docs = await Product.find({})
      .populate({ path: "category",  select: "name" })
      .populate({ path: "createdBy", select: "name" })
      .sort({ createdAt: -1 })
      .select("-__v -createdBy.email -createdBy.role");

    if (!docs.length) {
      return res.status(404).json({ success:false, message:"No products found" });
    }

    
    const data = docs.map(doc => {
      const prod = doc.toObject();

      const catId   = prod.category?._id?.toString() || prod.category;
      const catName = catMap.get(catId);

      const matchedPromos = promos.filter(p =>
        (p.type === "category" &&
          (p.category?.toString() === catId ||
           p.category  === catName)) ||
        (p.type === "product"   && p.product?.toString() === prod._id.toString()) ||
        (p.type === "variation" && p.variationSKU &&
          prod.variations?.some(v =>
            v.variantSKU?.trim().toLowerCase() === p.variationSKU.trim().toLowerCase()))
      );

     
      prod.variations = prod.variations.map(v =>
        applyBestDiscount({ ...v }, matchedPromos)
      );

     
      const prices = prod.variations.map(v => v.finalPrice ?? v.price);
      prod.priceRange = { min: Math.min(...prices), max: Math.max(...prices) };

      return prod;
    });

    
    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data
    });

  } catch (err) {
    console.error("getAllProducts error:", err);
    res.status(500).json({
      success:false,
      message:"Failed to fetch: server error",
      error   : err.message
    });
  }
};






///////////////////////////////////

export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    const product = await Product.findById(id)
      
      .select("-__v -createdBy.email -createdBy.role")
      .lean();  

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const now = new Date();
    const promos = await Promotion.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: [
        { type: 'product', product: product._id },
        { type: 'category', category: product.category?._id || product.category },
        { type: 'variation', variationSKU: { $in: product.variations.map(v => v.variantSKU) } }
      ]
    });

    product.variations = product.variations.map(v => applyBestDiscount(v, promos));

    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });

  } catch (error) {
    console.error("Error fetching product by ID:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};


////////////////////////






export const editproduct = async (req, res) => {
  try {
    const { id } = req.params;

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const {
      title,
      description,
      brand,
      category,
      badges,
      variations,
      metaTitle,
      metaDescription,
      isFeatured,
      slug,
    } = req.body;

    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const generatedSlug = slug || slugify(title, { lower: true, strict: true });

    const updatedImages = req.uploadedImages?.length
      ? req.uploadedImages
      : existingProduct.images;

    let parsedVariations;
    try {
      parsedVariations = typeof variations === "string" ? JSON.parse(variations) : variations;
    } catch (e) {
      return res.status(400).json({ success: false, message: "Invalid variations format" });
    }

    const processedVariations = parsedVariations.map((variation, index) => {
      const variantSKU = skuGenerator({ title, attributes: variation.attributes }) || `${existingProduct.baseSKU}-${index + 1}`;
      return {
        variantSKU,
        attributes: variation.attributes,
        price: variation.price ?? 0,
        discountPrice: variation.discountPrice ?? 0,
        stock: variation.stock ?? 0,
        isActive: variation.isActive !== false,
        images: [], // Optional variant-level image logic
      };
    });

    Object.assign(existingProduct, {
      title,
      slug: generatedSlug,
      description,
      brand,
      category: categoryDoc._id,
      badges,
      metaTitle,
      metaDescription,
      isFeatured: !!isFeatured,
      images: updatedImages,
      variations: processedVariations,
    });

    await existingProduct.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: existingProduct,
    });

  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};




///////////////////////////////////


export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing product ID",
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }

    const deleted = await Product.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Successfully deleted!",
      data: deleted,
    });

  } catch (error) {
    console.error('Error deleting product:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      message: "Unable to delete the product! : Server error",
      error: error.message || "Unknown error"
    });
  }
};


/////////////////////////////////



export const getByVariantSku = async (req, res) => {
  try {
    const { variantSKU } = req.query;
    if (!variantSKU) {
      return res.status(400).json({
        success: false,
        message: "Variant SKU is required",
      });
    }

    
    const product = await Product.findOne({ "variations.variantSKU": variantSKU })
      // .populate({ path: "category", select: "name" })
      // .populate({ path: "createdBy", select: "name" })
      .select("-__v -createdBy.email -createdBy.role")
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product with the specified variant SKU not found",
      });
    }

    
    const matchedVariation = product.variations.find(
      (v) => v.variantSKU === variantSKU
    );

    if (!matchedVariation) {
      return res.status(404).json({
        success: false,
        message: "Variant with the specified SKU not found in product",
      });
    }

    const now = new Date();
   const promos = await Promotion.find({
  isActive: true,
  startDate: { $lte: now },
  endDate: { $gte: now },
  $or: [
    { type: 'product', product: product._id },
    { type: 'category', category: product.category?._id || product.category },
    { type: 'variation', variationSKU: variantSKU } 
  ]
});


    
    const discountedVariation = applyBestDiscount(matchedVariation, promos);

   
    product.variations = [discountedVariation];

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product by variant SKU:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product by variant SKU",
      error: error.message,
    });
  }
};



