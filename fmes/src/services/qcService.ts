import api from './api';
import { Production } from './productionService';

// Define the types for quality control inspections
export interface QualityControl {
  id: number;
  inspection_id?: string; // Field used in frontend
  productId: number;
  product_id?: string; // Field used in frontend
  inspectionDate: string;
  inspection_date?: string; // Field used in frontend
  scheduledDate: string;
  scheduled_date?: string; // Field used in frontend
  result: string;
  createdAt?: Date;
  product?: Production;
  userId?: number; // Added userId field
}

// Create a new QC type without id and createdAt for creating/updating
export type QualityControlInput = Omit<QualityControl, 'id' | 'createdAt' | 'product' | 'inspection_id'>;

/**
 * Convenience exports for direct function imports
 */
export async function getInspections(): Promise<QualityControl[]> {
  const inspections = await QualityControlService.getAll();
  // Map backend fields to frontend fields
  return inspections.map(insp => ({
    ...insp,
    inspection_id: insp.inspection_id || String(insp.id),
    product_id: insp.product_id || String(insp.productId),
    inspection_date: insp.inspection_date || insp.inspectionDate,
    scheduled_date: insp.scheduled_date || insp.scheduledDate
  }));
}

export async function createInspection(data: QualityControlInput): Promise<QualityControl> {
  console.log('Creating inspection with input data:', JSON.stringify(data, null, 2));
  
  // Map frontend fields to backend fields if needed
  const backendData = {
    productId: typeof data.product_id === 'string' ? parseInt(data.product_id) : data.productId,
    inspectionDate: data.inspection_date || data.inspectionDate,
    scheduledDate: data.scheduled_date || data.scheduledDate || data.inspection_date || data.inspectionDate, // fallback
    result: data.result
  };
  
  console.log('Transformed backend data:', JSON.stringify(backendData, null, 2));
  
  try {
    const created = await QualityControlService.create(backendData);
    console.log('API response:', JSON.stringify(created, null, 2));
    
    return {
      ...created,
      inspection_id: String(created.id),
      product_id: String(created.productId),
      inspection_date: created.inspectionDate,
      scheduled_date: created.scheduledDate
    };
  } catch (error) {
    console.error('Error in createInspection:', error);
    throw error;
  }
}

export async function updateInspection(id: number | string, data: QualityControlInput): Promise<QualityControl> {
  console.log('Update inspection input data:', JSON.stringify(data, null, 2));
  const numericId = typeof id === 'string' ? parseInt(id) : id;
  
  // Map frontend fields to backend fields if needed
  const backendData = {
    productId: typeof data.product_id === 'string' ? parseInt(data.product_id) : data.productId,
    inspectionDate: data.inspection_date || data.inspectionDate,
    scheduledDate: data.scheduled_date || data.scheduledDate || data.inspection_date || data.inspectionDate, // fallback
    result: data.result
  };
  
  console.log('Update inspection backend data:', JSON.stringify(backendData, null, 2));

  try {
    const updated = await QualityControlService.update(numericId, backendData);
    console.log('API update response:', JSON.stringify(updated, null, 2));
    
    return {
      ...updated,
      inspection_id: String(updated.id),
      product_id: String(updated.productId),
      inspection_date: updated.inspectionDate,
      scheduled_date: updated.scheduledDate
    };
  } catch (error) {
    console.error('Error in updateInspection:', error);
    throw error;
  }
}

export async function deleteInspection(id: number | string): Promise<void> {
  const numericId = typeof id === 'string' ? parseInt(id) : id;
  return QualityControlService.delete(numericId);
}

/**
 * Service class for Quality Control-related API calls
 */
export class QualityControlService {
  /**
   * Get all quality control records
   * @returns Promise with array of QualityControl objects
   */
  static async getAll(): Promise<QualityControl[]> {
    try {
      const response = await api.get('/quality-control');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch quality controls:", error);
      throw error;
    }
  }
  
  /**
   * Get a single quality control record by ID
   * @param id QualityControl ID
   * @returns Promise with a QualityControl object
   */
  static async getById(id: number): Promise<QualityControl> {
    try {
      const response = await api.get(`/quality-control/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch quality control with id ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Create a new quality control record
   * @param data QualityControl data
   * @returns Promise with the created QualityControl object
   */
  static async create(data: QualityControlInput): Promise<QualityControl> {
    try {
      console.log('API create call with data:', JSON.stringify(data, null, 2));
      
      if (!data.productId && !data.product_id) {
        throw new Error('Product ID is required');
      }
      
      if (!data.inspectionDate && !data.inspection_date) {
        throw new Error('Inspection date is required');
      }
      
      // Validate the result field
      if (!data.result) {
        data.result = 'Passed'; // Default value
      }
      
      // Ensure result is one of the allowed values
      if (!['Passed', 'Failed'].includes(data.result)) {
        console.warn(`Unexpected result value: ${data.result}. Setting to 'Passed'`);
        data.result = 'Passed';
      }
      
      console.log('Sending create request with processed data:', JSON.stringify(data, null, 2));
      
      const response = await api.post('/quality-control', data);
      console.log('API create response:', response);
      return response.data;
    } catch (error: any) {
      console.error("Failed to create quality control:", error);
      if (error.response) {
        console.error("Response error data:", error.response.data);
        console.error("Response status:", error.response.status);
        throw new Error(`Server error: ${error.response.data.message || error.response.statusText}`);
      }
      throw error;
    }
  }
  
  /**
   * Update a quality control record
   * @param id QualityControl ID
   * @param data Updated quality control data
   * @returns Promise with the updated QualityControl object
   */
  static async update(id: number, data: QualityControlInput): Promise<QualityControl> {
    try {
      console.log(`API update call with id ${id} and data:`, JSON.stringify(data, null, 2));
      
      if (!data.productId && !data.product_id) {
        throw new Error('Product ID is required');
      }
      
      if (!data.inspectionDate && !data.inspection_date) {
        throw new Error('Inspection date is required');
      }
      
      // Validate the result field
      if (!data.result) {
        data.result = 'Passed'; // Default value
      }
      
      // Ensure result is one of the allowed values
      if (!['Passed', 'Failed'].includes(data.result)) {
        console.warn(`Unexpected result value: ${data.result}. Setting to 'Passed'`);
        data.result = 'Passed';
      }
      
      console.log('Sending update request with processed data:', JSON.stringify(data, null, 2));
      
      const response = await api.put(`/quality-control/${id}`, data);
      console.log('API update response:', response);
      return response.data;
    } catch (error: any) {
      console.error(`Failed to update quality control with id ${id}:`, error);
      if (error.response) {
        console.error("Response error data:", error.response.data);
        console.error("Response status:", error.response.status);
        throw new Error(`Server error: ${error.response.data.message || error.response.statusText}`);
      }
      throw error;
    }
  }
  
  /**
   * Delete a quality control record
   * @param id QualityControl ID
   * @returns Promise that resolves when deletion is complete
   */
  static async delete(id: number): Promise<void> {
    try {
      await api.delete(`/quality-control/${id}`);
    } catch (error) {
      console.error(`Failed to delete quality control with id ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Export quality control data as CSV
   * @returns Promise that triggers a file download
   */
  static async exportCsv(): Promise<void> {
    try {
      // Use window.location to trigger file download
      window.location.href = `${api.defaults.baseURL}/quality-control/export/csv`;
    } catch (error) {
      console.error("Failed to export quality controls:", error);
      throw error;
    }
  }
}