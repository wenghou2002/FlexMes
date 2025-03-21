import { body, param } from 'express-validator';

// Validation rules for creating a quality control record
export const createQualityControlValidation = [
  body('productId')
    .notEmpty().withMessage('Product ID is required')
    .isInt().withMessage('Product ID must be a number'),
  
  body('inspectionDate')
    .notEmpty().withMessage('Inspection date is required')
    .isISO8601().withMessage('Inspection date must be a valid date format (YYYY-MM-DD)'),
  
  body('scheduledDate')
    .notEmpty().withMessage('Scheduled date is required')
    .isISO8601().withMessage('Scheduled date must be a valid date format (YYYY-MM-DD)'),
  
  body('result')
    .notEmpty().withMessage('Result is required')
    .isString().withMessage('Result must be a string')
    .isIn(['Passed', 'Failed', 'Pending']).withMessage('Result must be either "Passed", "Failed", or "Pending"')
];

// Validation rules for updating a quality control record
export const updateQualityControlValidation = [
  param('id')
    .isInt().withMessage('ID must be a number'),
  
  body('productId')
    .optional()
    .isInt().withMessage('Product ID must be a number'),
  
  body('inspectionDate')
    .optional()
    .isISO8601().withMessage('Inspection date must be a valid date format (YYYY-MM-DD)'),
  
  body('scheduledDate')
    .optional()
    .isISO8601().withMessage('Scheduled date must be a valid date format (YYYY-MM-DD)'),
  
  body('result')
    .optional()
    .isString().withMessage('Result must be a string')
    .isIn(['Passed', 'Failed', 'Pending']).withMessage('Result must be either "Passed", "Failed", or "Pending"')
];

// Validation for ID parameter
export const idParamValidation = [
  param('id')
    .isInt().withMessage('ID must be a number')
]; 