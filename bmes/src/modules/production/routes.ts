import { Router } from 'express';
import {
  getAllProductions,
  getProductionById,
  createProduction,
  updateProduction,
  deleteProduction,
  exportProductionCSV
} from './controllers';
import {
  createProductionValidation,
  updateProductionValidation,
  idParamValidation
} from './validations';

const router = Router();

// GET all productions
router.get('/', getAllProductions);

// GET export productions as CSV - this needs to be before the :id route to avoid conflict
router.get('/export/csv', exportProductionCSV);

// GET a single production by ID
router.get('/:id', idParamValidation, getProductionById);

// POST create a new production
router.post('/', createProductionValidation, createProduction);

// PUT update a production
router.put('/:id', updateProductionValidation, updateProduction);

// DELETE a production
router.delete('/:id', idParamValidation, deleteProduction);

export default router; 