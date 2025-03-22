/**
 * QualityControl model interfaces for type safety in the application
 */

// Base model for QualityControl records
export interface QualityControl {
  id: number;
  displayId: number;
  productId: number;
  inspectionDate: Date;
  scheduledDate: Date;
  result: string;
  notes?: string | null;
  userId?: number | null;
  createdAt: Date;
}

// Input type for creating a new QualityControl
export interface QualityControlInput {
  productId: number;
  inspectionDate: Date;
  scheduledDate: Date;
  result: string;
  notes?: string | null;
  userId?: number | null;
}

// Input type for updating a QualityControl
export interface QualityControlUpdateInput {
  productId?: number;
  inspectionDate?: Date;
  scheduledDate?: Date;
  result?: string;
  notes?: string | null;
}

// QualityControl with joined user data
export interface QualityControlWithUser extends QualityControl {
  user?: {
    username: string;
  } | null;
}

// QualityControl with joined product data
export interface QualityControlWithProduct extends QualityControl {
  product?: {
    id: number;
    name: string;
    status: string;
    createdAt: Date;
  } | null;
}

// Response for QualityControl access check
export interface QualityControlAccessCheck {
  qualityControl: QualityControl | null;
  hasAccess: boolean;
} 