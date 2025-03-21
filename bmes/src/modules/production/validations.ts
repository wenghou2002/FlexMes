import { body, param } from 'express-validator';

// Validation rules for creating a production record
export const createProductionValidation = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isString().withMessage('Name must be a string')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  
  body('status')
    .notEmpty().withMessage('Status is required')
    .isString().withMessage('Status must be a string')
    .isIn(['In Progress', 'Completed']).withMessage('Status must be either "In Progress" or "Completed"'),
  
  body('material')
    .optional()
    .isString().withMessage('Material must be a string')
    .isLength({ max: 255 }).withMessage('Material must be at most 255 characters')
];

// Validation rules for updating a production record
export const updateProductionValidation = [
  param('id')
    .isInt().withMessage('ID must be a number'),
  
  body('name')
    .optional()
    .isString().withMessage('Name must be a string')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  
  body('status')
    .optional()
    .isString().withMessage('Status must be a string')
    .isIn(['In Progress', 'Completed']).withMessage('Status must be either "In Progress" or "Completed"'),
  
  body('material')
    .optional()
    .isString().withMessage('Material must be a string')
    .isLength({ max: 255 }).withMessage('Material must be at most 255 characters')
];

// Validation for ID parameter
export const idParamValidation = [
  param('id')
    .isInt().withMessage('ID must be a number')
]; 