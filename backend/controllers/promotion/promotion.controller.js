import { initialValidation, dateValidation, validatePromotionType } from '../../services/promotion.service.js';
import Promotion from '../../models/promotion.model.js';


const asyncHandler = fn => (req, res, next) => fn(req, res, next).catch(next);




export const createPromotion = asyncHandler(async (req, res) => {
  const { title, description, link, type, category, product,variationSKU, startDate, endDate, isActive, priority } = req.body;

  const initialCheck = initialValidation(req);
  if (!initialCheck.success) return res.status(400).json(initialCheck);

  const dateCheck = dateValidation(startDate, endDate);
  if (!dateCheck.success) return res.status(400).json(dateCheck);

  const images = req.uploadedImages || [];
  if (!images.length) return res.status(400).json({ success: false, message: "No images uploaded" });

  const discountPercent = req.body.discount ? parseFloat(req.body.discount) : null;
  if (discountPercent !== null && (isNaN(discountPercent) || discountPercent < 0 || discountPercent > 100)) {
    return res.status(400).json({ success: false, message: "Discount must be between 0 and 100" });
  }

  const typeCheck = validatePromotionType(type, category, product,variationSKU);
  if (!typeCheck.success) return res.status(400).json(typeCheck);

  // const overlap = await checkPromotionOverlap({ type, category, product,variationSKU, startDate, endDate });
  // if (overlap) {
  //   return res.status(409).json({
  //     success: false,
  //     message: 'Another active promotion overlaps with this date range',
  //     data: overlap._id
  //   });
  // }

  const promotionData = {
    title,
    description,
    link,
    type,
    images,
    variationSKU: type === 'variation' ? variationSKU : null,
    category: type === 'category' ? category : null,
    product: type === 'product' ? product : null,
    isActive: isActive !== undefined ? isActive : true,
    startDate: new Date(startDate),
    endDate: endDate ? new Date(endDate) : null,
    priority: priority || 0,
    discount: discountPercent ?? undefined,
    createdBy: req.user?._id,
  };

  const promo = await Promotion.create(promotionData);
  res.status(201).json({ success: true, message: 'Promotion created successfully', data: promo });
});


///////////////////////////////////////////////////


export const getAllPromotions = asyncHandler(async (req, res) => {
  const now = new Date();
  const promotions = await Promotion.find({
    isActive: true,
    
  }).sort({ priority: -1, startDate: 1 });

  if (!promotions.length) {
    return res.status(404).json({ success: false, message: "No active promotions found" });
  }

  res.status(200).json({ success: true, message: "Active promotions retrieved successfully", data: promotions });
});


/////////////////////////////////////////////

export const updatePromotions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await Promotion.findById(id);
  if (!existing) return res.status(404).json({ success: false, message: "Promotion not found" });

  const update = {
    ...req.body,
    updatedBy: req.user?._id,
    images: req.uploadedImages || existing.images,
  };

  if (update.startDate) update.startDate = new Date(update.startDate);
  if (update.endDate) update.endDate = new Date(update.endDate);
  if (update.discount) update.discount = parseFloat(update.discount);

  if (update.type) {
  update.category     = update.type === 'category'  ? update.category     : null;
  update.product      = update.type === 'product'   ? update.product      : null;
  update.variationSKU = update.type === 'variation' ? update.variationSKU : null;
}

  const updated = await Promotion.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  res.status(200).json({ success: true, message: "Promotion updated successfully", data: updated });
});

//////////////////////////////////////////////////////////



export const deletePromotion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const promo = await Promotion.findById(id);
  if (!promo) return res.status(404).json({ success: false, message: "Promotion not found" });

  
  await Promotion.findByIdAndUpdate(id, { isActive: false, deleted: true });
  res.status(200).json({ success: true, message: "Promotion soft-deleted successfully" });
});
