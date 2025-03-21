import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Parser } from 'json2csv';
import fs from 'fs';
import path from 'path';
import { getMalaysiaTime } from '../../utils/dateUtils';
import { ProductionService } from './services';

// Extend the Express Request type to include the user property
interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    username: string;
    role: string;
  }
}

// Get all production records
export const getAllProductions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.query.userId ? Number(req.query.userId) : undefined;
    console.log(`Filtering productions by userId: ${userId}`);
    
    const productions = await ProductionService.getAllProductions(userId);
    res.status(200).json(productions);
  } catch (error) {
    console.error('Error fetching productions:', error);
    res.status(500).json({ message: 'Failed to fetch productions', error: (error as Error).message });
  }
};

// Get a single production record by ID
export const getProductionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const production = await ProductionService.getProductionById(Number(id));
    
    if (!production) {
      res.status(404).json({ message: `Production with ID ${id} not found` });
      return;
    }
    
    res.status(200).json(production);
  } catch (error) {
    console.error('Error fetching production:', error);
    res.status(500).json({ message: 'Failed to fetch production', error: (error as Error).message });
  }
};

// Create a new production record
export const createProduction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    
    const { name, status, material } = req.body;
    const userId = req.user?.userId;

    const productionData = {
      name,
      status,
      material: material || null,
      userId: userId
    };
    
    console.log(`Creating production with authenticated userId: ${userId}`);
    
    const newProduction = await ProductionService.createProduction(productionData);
    res.status(201).json(newProduction);
  } catch (error) {
    console.error('Error creating production:', error);
    res.status(500).json({ message: 'Failed to create production', error: (error as Error).message });
  }
};

// Update a production record
export const updateProduction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    
    const { id } = req.params;
    const { name, status, material } = req.body;
    const userId = req.user?.userId;
    const isAdmin = req.user?.role === 'admin';
    
    // Check access
    const { production, hasAccess } = await ProductionService.checkProductionAccess(
      Number(id),
      userId || 0,
      isAdmin || false
    );
    
    if (!production) {
      res.status(404).json({ message: `Production with ID ${id} not found` });
      return;
    }
    
    if (!hasAccess) {
      res.status(403).json({ message: `Not authorized to update this record` });
      return;
    }
    
    // Create update data object
    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (status) updateData.status = status;
    if (material !== undefined) updateData.material = material || null;
    
    // Update production
    const updatedProduction = await ProductionService.updateProduction(Number(id), updateData);
    res.status(200).json(updatedProduction);
  } catch (error) {
    console.error('Error updating production:', error);
    res.status(500).json({ message: 'Failed to update production', error: (error as Error).message });
  }
};

// Delete a production record
export const deleteProduction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const isAdmin = req.user?.role === 'admin';
    
    // Check access
    const { production, hasAccess } = await ProductionService.checkProductionAccess(
      Number(id),
      userId || 0,
      isAdmin || false
    );
    
    if (!production) {
      res.status(404).json({ message: `Production with ID ${id} not found` });
      return;
    }
    
    if (!hasAccess) {
      res.status(403).json({ message: `Not authorized to delete this record` });
      return;
    }
    
    // Delete the production record
    await ProductionService.deleteProduction(Number(id));
    res.json({ message: `Production with ID ${id} deleted successfully` });
  } catch (error) {
    console.error('Error deleting production:', error);
    res.status(500).json({ message: 'Failed to delete production', error: (error as Error).message });
  }
};

// Export production data as CSV
export const exportProductionCSV = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.query.userId ? Number(req.query.userId) : undefined;
    console.log(`Exporting productions filtered by userId: ${userId}`);
    
    // Get production records with filter
    const productions = await ProductionService.getAllProductions(userId);
    
    if (productions.length === 0) {
      res.status(404).json({ message: 'No production data available to export' });
      return;
    }
    
    // Format date for filename
    const dateString = getMalaysiaTime();
    
    // Define CSV fields
    const fields = ['id', 'displayId', 'name', 'material', 'status', 'createdAt'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(productions);
    
    // Ensure directory exists
    const exportDir = path.join(__dirname, '../../../exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    
    // Write CSV file
    const filename = `Production_report_${dateString}.csv`;
    const filePath = path.join(exportDir, filename);
    fs.writeFileSync(filePath, csv);
    
    // Send file as response
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).json({ message: 'Error downloading the file' });
      }
    });
  } catch (error) {
    console.error('Error exporting production data:', error);
    res.status(500).json({ message: 'Failed to export production data', error: (error as Error).message });
  }
}; 