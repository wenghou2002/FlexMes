import { Router } from 'express';
import {
  getAllQualityControls,
  getQualityControlById,
  createQualityControl,
  updateQualityControl,
  deleteQualityControl,
  exportQualityControlCSV
} from './controllers';
import {
  createQualityControlValidation,
  updateQualityControlValidation,
  idParamValidation
} from './validations';

const router = Router();

// GET all quality controls
router.get('/', getAllQualityControls);

// GET export quality controls as CSV - this needs to be before the :id route to avoid conflict
router.get('/export/csv', exportQualityControlCSV);

// GET a single quality control by ID
router.get('/:id', idParamValidation, getQualityControlById);

// POST create a new quality control
router.post('/', createQualityControlValidation, createQualityControl);

// PUT update a quality control
router.put('/:id', updateQualityControlValidation, updateQualityControl);

// DELETE a quality control
router.delete('/:id', idParamValidation, deleteQualityControl);

export default router; 