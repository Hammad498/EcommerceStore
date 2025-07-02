import { initialValidation, dateValidation, validatePromotionType } from '../../services/promotion.service.js';
import Promotion from '../../models/promotion.model.js';

export const createPromotion = async (req, res) => {
  try {
    const { title, description, link, type, category, product, startDate, endDate, isActive, priority } = req.body;

    
    const initialCheck = initialValidation(req);
    if (!initialCheck.success) {
      return res.status(400).json(initialCheck);
    }

    const dateCheck = dateValidation(startDate, endDate);
    if (!dateCheck.success) {
      return res.status(400).json(dateCheck);
    }

    const images = req.uploadedImages || [];
    if (!images.length) {
      return res.status(400).json({ success: false, message: "No images uploaded" });
    }

    const discount = req.body.discount ? parseFloat(req.body.discount) : null;
    if (discount !== null && (isNaN(discount) || discount < 0 || discount > 100)) {
      return res.status(400).json({
        success: false,
        message: "Discount must be a number between 0 and 100"
      });
    }

    const promotionTypeCheck = validatePromotionType(type, category, product);
    if (!promotionTypeCheck.success) {
      return res.status(400).json(promotionTypeCheck);
    }

    const promotionData = {
      title,
      description,
      link,
      type,
      images,
      category: type === 'category' ? category : null,
      product: type === 'product' ? product : null,
      isActive: isActive !== undefined ? isActive : true,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      priority: priority || 0,
      discount: discount !== null ? discount : undefined
    };

    const promo = await Promotion.create(promotionData);
    return res.status(201).json({
      success: true,
      message: "Promotion created successfully",
      data: promo
    });

  } catch (error) {
    console.error("Error creating promotion:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create promotion",
      error: error.message
    });
  }
};


//////////////////////////


