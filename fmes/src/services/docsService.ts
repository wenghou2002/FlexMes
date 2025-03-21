import api from './api';

/**
 * Service for accessing documentation files
 */
export class DocsService {
  /**
   * Get a documentation file by filename
   * @param filename Name of the documentation file to retrieve
   * @returns Promise with documentation file content
   */
  static async getDocFile(filename: string): Promise<string> {
    try {
      const response = await api.get(`/docs/${filename}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching documentation file ${filename}:`, error);
      throw error;
    }
  }
}

/**
 * Convenience export for direct function import
 */
export const getDocFile = async (filename: string): Promise<string> => {
  return DocsService.getDocFile(filename);
}; 