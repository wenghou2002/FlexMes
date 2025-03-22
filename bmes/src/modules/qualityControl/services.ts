import prisma from '../../lib/prisma';
import {
  QualityControl,
  QualityControlInput,
  QualityControlUpdateInput,
  QualityControlWithUser,
  QualityControlWithProduct,
  QualityControlAccessCheck,
  SeverityLevel
} from './models';

/**
 * Service for Quality Control operations
 * This layer separates business logic from controllers
 */
export class QualityControlService {
  /**
   * Get all quality control records, optionally filtered by userId
   * @param userId Optional user ID to filter by
   * @returns Promise with array of QualityControl records
   */
  static async getAllQualityControls(userId?: number): Promise<QualityControlWithUser[]> {
    let whereClause = {};
    
    if (userId) {
      whereClause = { userId: Number(userId) };
    }
    
    return prisma.qualityControl.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            username: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get a single quality control by ID
   * @param id QualityControl ID
   * @returns Promise with a QualityControl record and its related Product
   */
  static async getQualityControlById(id: number): Promise<QualityControlWithProduct | null> {
    const qualityControl = await prisma.qualityControl.findUnique({
      where: { id: Number(id) }
    });
    
    if (!qualityControl) {
      return null;
    }
    
    // Fetch the product separately
    const product = await prisma.production.findUnique({
      where: { id: qualityControl.productId }
    });
    
    // Return quality control with product (or default if not found)
    return {
      ...qualityControl,
      product: product || { 
        id: qualityControl.productId, 
        name: 'Unknown Product', 
        status: 'Unknown',
        createdAt: new Date()
      }
    };
  }

  /**
   * Create a new quality control record with user-specific displayId
   * @param data QualityControl data
   * @returns Promise with the created QualityControl
   */
  static async createQualityControl(data: QualityControlInput): Promise<QualityControl> {
    // Find the highest displayId for this user to generate the next one
    let nextDisplayId = 1;
    if (data.userId) {
      const highestRecord = await prisma.qualityControl.findFirst({
        where: { userId: Number(data.userId) },
        orderBy: { displayId: 'desc' }
      });
      
      if (highestRecord) {
        nextDisplayId = highestRecord.displayId + 1;
      }
    }

    // Add displayId to the data
    const qualityControlWithDisplayId = {
      ...data,
      displayId: nextDisplayId
    };

    return prisma.qualityControl.create({
      data: qualityControlWithDisplayId
    });
  }

  /**
   * Update a quality control record
   * @param id QualityControl ID
   * @param data Updated QualityControl data
   * @returns Promise with the updated QualityControl
   */
  static async updateQualityControl(id: number, data: QualityControlUpdateInput): Promise<QualityControl> {
    return prisma.qualityControl.update({
      where: { id: Number(id) },
      data
    });
  }

  /**
   * Delete a quality control record
   * @param id QualityControl ID
   * @returns Promise void
   */
  static async deleteQualityControl(id: number): Promise<void> {
    await prisma.qualityControl.delete({
      where: { id: Number(id) }
    });
  }

  /**
   * Check if a quality control exists and if user has access
   * @param id QualityControl ID
   * @param userId User ID to check ownership
   * @param isAdmin Whether the user is an admin
   * @returns Object with qualityControl data and access boolean
   */
  static async checkQualityControlAccess(id: number, userId: number, isAdmin: boolean): Promise<QualityControlAccessCheck> {
    const qualityControl = await prisma.qualityControl.findUnique({
      where: { id: Number(id) }
    });

    if (!qualityControl) {
      return { qualityControl: null, hasAccess: false };
    }

    // Check user ownership - admin can access all, others only their own
    const hasAccess = isAdmin || 
                     (qualityControl.userId === userId);

    return { qualityControl, hasAccess };
  }
} 