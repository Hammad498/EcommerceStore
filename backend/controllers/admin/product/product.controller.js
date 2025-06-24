
import ProductVariation from "../../../models/product/product.model.js";
import Category from "../../../models/product/category.model.js";
import slugify from "slugify";

export const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      brand,
      category,
      baseSKU,
      variations,
      metaTitle,
      metaDescription,
      isFeatured,
      slug,
    } = req.body;

    // Validate required fields
    if (!title || !description || !brand || !category || !baseSKU || !variations) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check if category exists
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const generatedSlug = slug || slugify(title, { lower: true, strict: true });

    const images = (req.uploadedImages || []).map((img) => ({
      url: img.url,
      alt: `Main image for ${title}`,
    }));

    const parsedVariations = typeof variations === "string" ? JSON.parse(variations) : variations;

    const processedVariations = parsedVariations.map((variation, index) => {
      const variantSKU = baseSKU + "-" + (index + 1);
      return {
        variantSKU,
        attributes: variation.attributes ? new Map(Object.entries(variation.attributes)) : new Map(),
        price: variation.price ?? 0,
        discountPrice: variation.discountPrice ?? 0,
        stock: variation.stock ?? 0,
        isActive: variation.isActive !== undefined ? variation.isActive : true,
        images: (variation.uploadedImages || []).map((img) => ({
          url: img.url,
          alt: img.alt || `Image for ${variantSKU}`,
        })),
      };
    });

    const product = new ProductVariation({
      title,
      slug: generatedSlug,
      description,
      brand,
      category: categoryDoc._id,
      baseSKU,
      variations: processedVariations,
      metaTitle,
      metaDescription,
      isFeatured: isFeatured || false,
      images,
      createdBy: req.user._id,
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