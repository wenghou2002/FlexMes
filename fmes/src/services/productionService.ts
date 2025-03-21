import api from './api';

// Define the types for production data
export interface Production {
  id: number;
  product_id?: string; // Field from frontend
  name: string;
  status: string;
  material?: string;
  createdAt?: Date;
  userId?: number; // Added userId field
}

// Create a new production type without id and createdAt for creating/updating
export type ProductionInput = Omit<Production, 'id' | 'createdAt' | 'product_id'>;

/**
 * Convenience exports for direct function imports
 */
export async function getProductions(): Promise<Production[]> {
  const productions = await ProductionService.getAll();
  // Map backend id to product_id if not exists
  return productions.map(prod => ({
    ...prod,
    product_id: prod.product_id || String(prod.id)
  }));
}

export async function createProduction(data: ProductionInput): Promise<Production> {
  console.log('Creating production with data:', JSON.stringify(data, null, 2));
  
  try {
    const created = await ProductionService.create(data);
    console.log('Production created successfully:', JSON.stringify(created, null, 2));
    return {
      ...created,
      product_id: String(created.id)
    };
  } catch (error) {
    console.error('Error in createProduction:', error);
    throw error;
  }
}

export async function updateProduction(id: number | string, data: ProductionInput): Promise<Production> {
  console.log(`Updating production ${id} with data:`, JSON.stringify(data, null, 2));
  const numericId = typeof id === 'string' ? parseInt(id) : id;
  
  try {
    const updated = await ProductionService.update(numericId, data);
    console.log('Production updated successfully:', JSON.stringify(updated, null, 2));
    return {
      ...updated,
      product_id: String(updated.id)
    };
  } catch (error) {
    console.error('Error in updateProduction:', error);
    throw error;
  }
}

export async function deleteProduction(id: number | string): Promise<void> {
  console.log(`Deleting production ${id}`);
  const numericId = typeof id === 'string' ? parseInt(id) : id;
  
  try {
    await ProductionService.delete(numericId);
    console.log(`Production ${id} deleted successfully`);
  } catch (error) {
    console.error(`Error deleting production ${id}:`, error);
    throw error;
  }
}

/**
 * Service class for Production-related API calls
 */
export class ProductionService {
  /**
   * Get all production records
   * @returns Promise with array of Production objects
   */
  static async getAll(): Promise<Production[]> {
    try {
      const response = await api.get('/production');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch productions:", error);
      throw error;
    }
  }
  
  /**
   * Get a single production by ID
   * @param id Production ID
   * @returns Promise with a Production object
   */
  static async getById(id: number): Promise<Production> {
    try {
      const response = await api.get(`/production/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch production with id ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Create a new production record
   * @param data Production data
   * @returns Promise with the created Production object
   */
  static async create(data: ProductionInput): Promise<Production> {
    try {
      console.log('API calling POST /production with data:', JSON.stringify(data, null, 2));
      
      if (!data.name) {
        throw new Error('Production name is required');
      }
      
      if (!data.status) {
        // Default to In Progress if status not provided
        data.status = 'In Progress';
      }
      
      const response = await api.post('/production', data);
      console.log('API create production response:', response);
      return response.data;
    } catch (error: any) {
      console.error("Failed to create production:", error);
      if (error.response) {
        console.error("Response error data:", error.response.data);
        console.error("Response status:", error.response.status);
        throw new Error(`Server error: ${error.response.data?.message || error.response.statusText}`);
      }
      throw error;
    }
  }
  
  /**
   * Update a production record
   * @param id Production ID
   * @param data Updated production data
   * @returns Promise with the updated Production object
   */
  static async update(id: number, data: ProductionInput): Promise<Production> {
    try {
      console.log(`API calling PUT /production/${id} with data:`, JSON.stringify(data, null, 2));
      
      if (!data.name) {
        throw new Error('Production name is required');
      }
      
      if (!data.status) {
        throw new Error('Production status is required');
      }
      
      const response = await api.put(`/production/${id}`, data);
      console.log('API update production response:', response);
      return response.data;
    } catch (error: any) {
      console.error(`Failed to update production with id ${id}:`, error);
      if (error.response) {
        console.error("Response error data:", error.response.data);
        console.error("Response status:", error.response.status);
        throw new Error(`Server error: ${error.response.data?.message || error.response.statusText}`);
      }
      throw error;
    }
  }
  
  /**
   * Delete a production record
   * @param id Production ID
   * @returns Promise that resolves when deletion is complete
   */
  static async delete(id: number): Promise<void> {
    try {
      await api.delete(`/production/${id}`);
    } catch (error) {
      console.error(`Failed to delete production with id ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Export production data as CSV
   * @returns Promise that triggers a file download
   */
  static async exportCsv(): Promise<void> {
    try {
      // Use window.location to trigger file download
      window.location.href = `${api.defaults.baseURL}/production/export/csv`;
    } catch (error) {
      console.error("Failed to export productions:", error);
      throw error;
    }
  }
}
