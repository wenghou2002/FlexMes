import prisma from '../../lib/prisma';
import { 
  Production, 
  ProductionInput, 
  ProductionUpdateInput, 
  ProductionWithUser,
  ProductionWithInspections,
  ProductionAccessCheck
} from './models';

/**
 * Service for Production operations
 * This layer separates business logic from controllers
 */
export class ProductionService {
  /**
   * Get all production records, optionally filtered by userId
   * @param userId Optional user ID to filter by
   * @returns Promise with array of Production records
   */
  static async getAllProductions(userId?: number): Promise<ProductionWithUser[]> {
    let whereClause = {};
    
    if (userId) {
      whereClause = { userId: Number(userId) };
    }
    
    return prisma.production.findMany({
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
   * Get a single production by ID
   * @param id Production ID
   * @returns Promise with a Production record
   */
  static async getProductionById(id: number): Promise<ProductionWithInspections | null> {
    return prisma.production.findUnique({
      where: { id: Number(id) },
      include: { inspections: true }
    });
  }

  /**
   * Create a new production record with user-specific displayId
   * @param data Production data
   * @returns Promise with the created Production
   */
  static async createProduction(data: ProductionInput): Promise<Production> {
    // Find the highest displayId for this user to generate the next one
    let nextDisplayId = 1;
    if (data.userId) {
      const highestRecord = await prisma.production.findFirst({
        where: { userId: Number(data.userId) },
        orderBy: { displayId: 'desc' }
      });
      
      if (highestRecord) {
        nextDisplayId = highestRecord.displayId + 1;
      }
    }
    
    // Add displayId to the data
    const productionWithDisplayId = {
      ...data,
      displayId: nextDisplayId
    };

    return prisma.production.create({
      data: productionWithDisplayId
    });
  }

  /**
   * Update a production record
   * @param id Production ID
   * @param data Updated Production data
   * @returns Promise with the updated Production
   */
  static async updateProduction(id: number, data: ProductionUpdateInput): Promise<Production> {
    return prisma.production.update({
      where: { id: Number(id) },
      data
    });
  }

  /**
   * Delete a production record
   * @param id Production ID
   * @returns Promise void
   */
  static async deleteProduction(id: number): Promise<void> {
    await prisma.production.delete({
      where: { id: Number(id) }
    });
  }

  /**
   * Check if a production exists and if user has access
   * @param id Production ID
   * @param userId User ID to check ownership
   * @param isAdmin Whether the user is an admin
   * @returns Object with production data and access boolean
   */
  static async checkProductionAccess(id: number, userId: number, isAdmin: boolean): Promise<ProductionAccessCheck> {
    const production = await prisma.production.findUnique({
      where: { id: Number(id) }
    });

    if (!production) {
      return { production: null, hasAccess: false };
    }

    // Check user ownership - admin can access all, others only their own
    const hasAccess = isAdmin || 
                     (production.userId === userId);

    return { production, hasAccess };
  }
} 