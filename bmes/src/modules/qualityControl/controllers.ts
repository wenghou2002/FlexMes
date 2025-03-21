import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Parser } from 'json2csv';
import fs from 'fs';
import path from 'path';
import { getMalaysiaTime } from '../../utils/dateUtils';
import { QualityControlService } from './services';
import { SeverityLevel } from './models';

// Extend the Express Request type to include the user property
interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    username: string;
    role: string;
  }
}

// Get all quality control records
export const getAllQualityControls = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.query.userId ? Number(req.query.userId) : undefined;
    console.log(`Filtering quality controls by userId: ${userId}`);
    
    // Get quality controls with appropriate filter using the service
    const qualityControls = await QualityControlService.getAllQualityControls(userId);
    res.json(qualityControls);
  } catch (error) {
    console.error('Error fetching quality controls:', error);
    res.status(500).json({ message: 'Error fetching quality controls' });
  }
};

// Get a single quality control record by ID
export const getQualityControlById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const qualityControlWithProduct = await QualityControlService.getQualityControlById(Number(id));
    
    if (!qualityControlWithProduct) {
      res.status(404).json({ message: `Quality control with ID ${id} not found` });
      return;
    }
    
    res.status(200).json(qualityControlWithProduct);
  } catch (error) {
    console.error('Error fetching quality control:', error);
    res.status(500).json({ message: 'Failed to fetch quality control', error: (error as Error).message });
  }
};

// Create a new quality control record
export const createQualityControl = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { productId, inspectionDate, scheduledDate, result, notes, severity } = req.body;
    const userId = req.user?.userId;
    
    console.log('Creating QC with user ID:', userId);

    const qcData = {
      productId: Number(productId),
      inspectionDate: new Date(inspectionDate),
      scheduledDate: new Date(scheduledDate),
      result,
      notes,
      severity: severity as SeverityLevel | undefined,
      userId
    };

    const qualityControl = await QualityControlService.createQualityControl(qcData);
    res.status(201).json(qualityControl);
  } catch (error) {
    console.error('Error creating quality control:', error);
    res.status(500).json({ message: 'Error creating quality control' });
  }
};

// Update a quality control record
export const updateQualityControl = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const userId = req.user?.userId;
    const isAdmin = req.user?.role === 'admin';
    
    // Check access using service
    const { qualityControl, hasAccess } = await QualityControlService.checkQualityControlAccess(
      id,
      userId || 0,
      isAdmin || false
    );

    if (!qualityControl) {
      res.status(404).json({ message: 'Quality control not found' });
      return;
    }

    if (!hasAccess) {
      res.status(403).json({ message: 'Not authorized to update this quality control' });
      return;
    }

    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    
    const { productId, inspectionDate, scheduledDate, result, severity, notes } = req.body;
    
    // Create update data object
    const updateData: any = {};
    
    if (productId) updateData.productId = Number(productId);
    if (inspectionDate) updateData.inspectionDate = new Date(inspectionDate);
    if (scheduledDate) updateData.scheduledDate = new Date(scheduledDate);
    if (result) updateData.result = result;
    if (result === 'Failed' && severity) updateData.severity = severity as SeverityLevel;
    if (notes !== undefined) updateData.notes = notes;
    
    // Update quality control record using service
    const updatedQualityControl = await QualityControlService.updateQualityControl(id, updateData);
    res.status(200).json(updatedQualityControl);
  } catch (error) {
    console.error('Error updating quality control:', error);
    res.status(500).json({ message: 'Failed to update quality control', error: (error as Error).message });
  }
};

// Delete a quality control record
export const deleteQualityControl = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const userId = req.user?.userId;
    const isAdmin = req.user?.role === 'admin';
    
    // Check access using service
    const { qualityControl, hasAccess } = await QualityControlService.checkQualityControlAccess(
      id,
      userId || 0,
      isAdmin || false
    );

    if (!qualityControl) {
      res.status(404).json({ message: 'Quality control not found' });
      return;
    }

    if (!hasAccess) {
      res.status(403).json({ message: 'Not authorized to delete this quality control' });
      return;
    }

    // Delete quality control record using service
    await QualityControlService.deleteQualityControl(id);
    res.status(200).json({ message: 'Quality control record deleted successfully' });
  } catch (error) {
    console.error('Error deleting quality control:', error);
    res.status(500).json({ message: 'Failed to delete quality control', error: (error as Error).message });
  }
};

// Export quality control data as CSV
export const exportQualityControlCSV = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.query.userId ? Number(req.query.userId) : undefined;
    console.log(`Exporting quality controls filtered by userId: ${userId}`);
    
    // Get quality control records with filter using service
    const qualityControls = await QualityControlService.getAllQualityControls(userId);

    if (qualityControls.length === 0) {
      res.status(404).json({ message: 'No quality control data available to export' });
      return;
    }
    
    // Format records for CSV export
    const formattedRecords = qualityControls.map(record => {
      const username = record.user?.username || 'Unknown User';
      return {
        inspection_id: record.id,
        display_id: record.displayId,
        product_id: record.productId,
        inspector: username,
        inspection_date: record.inspectionDate.toISOString().split('T')[0],
        scheduled_date: record.scheduledDate.toISOString().split('T')[0],
        result: record.result,
        severity: record.severity || 'N/A'
      };
    });
    
    // Format date for filename
    const dateString = getMalaysiaTime();
    
    // Define CSV fields
    const fields = [
      'inspection_id',
      'display_id',
      'product_id',
      'inspector',
      'inspection_date',
      'scheduled_date',
      'result',
      'severity'
    ];
    
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(formattedRecords);
    
    // Ensure directory exists
    const exportDir = path.join(__dirname, '../../../exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    
    // Write CSV file
    const filename = `QualityControl_report_${dateString}.csv`;
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
    console.error('Error exporting quality control data:', error);
    res.status(500).json({ message: 'Failed to export quality control data', error: (error as Error).message });
  }
}; 