/**
 * Production model interfaces for type safety in the application
 */

// Base model for Production records
export interface Production {
  id: number;
  displayId: number;
  name: string;
  status: string;
  material?: string | null;
  userId?: number | null;
  createdAt: Date;
}

// Production with inspections
export interface ProductionWithInspections extends Production {
  inspections?: any[];
}

// Input type for creating a new Production
export interface ProductionInput {
  name: string;
  status: string;
  material?: string | null;
  userId?: number | null;
}

// Input type for updating a Production
export interface ProductionUpdateInput {
  name?: string;
  status?: string;
  material?: string | null;
}

// Production with optional joined user data
export interface ProductionWithUser extends Production {
  user?: {
    username: string;
  } | null;
}

// Response for Production access check
export interface ProductionAccessCheck {
  production: Production | null;
  hasAccess: boolean;
} 