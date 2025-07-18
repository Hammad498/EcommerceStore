import { body, validationResult } from 'express-validator';

export const validateCreateOrder = [
  body('paymentMethod').notEmpty().withMessage('Payment method is required'),
  body('shippingAddress').optional().isObject().withMessage('Shipping address must be an object'),
  body('billingAddress').optional().isObject().withMessage('Billing address must be an object'),

  // Custom validation handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];


//////////////////////////


export const validateCheckoutSession = [
  body('orderId').notEmpty().withMessage('orderId is required'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];


/////////////////////////


export const validateFeedbackInput = (req, res, next) => {
  const { orderId, rating } = req.body;

  if (!orderId || rating === undefined) {
    return res.status(400).json({ message: 'Order ID and rating are required' });
  }

  const numericRating = Number(rating);

  if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
  }

  req.body.rating = numericRating;
  next();
};

///////////////////////////////////

