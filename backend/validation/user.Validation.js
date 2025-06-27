
import { body, validationResult } from "express-validator";


const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

export const loginValidation = [
  body("email")
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email format"),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),

  // Optional field
  body("rememberMe").optional().isBoolean().withMessage("Remember Me must be a boolean"),

  handleValidationErrors
];


export const registerValidation = [
  body("name")
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 3 }).withMessage("Name must be at least 3 characters long"),

  body("email")
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email format"),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/)
    .withMessage("Password must include uppercase, lowercase, number, and special character"),

  body("role").optional().isIn(["user", "admin"]).withMessage("Role must be either 'user' or 'admin'"),
  body("isVerified").optional().isBoolean().withMessage("isVerified must be a boolean value"),

  handleValidationErrors
];
