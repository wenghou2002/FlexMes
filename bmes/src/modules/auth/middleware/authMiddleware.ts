import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../../../config';

// Extend Express Request interface to include user object
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        username: string;
        role: string;
      };
    }
  }
}

// Middleware to authenticate API requests
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  // Get token from header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ message: 'Access token is required' });
    return;
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as {
      userId: number;
      username: string;
      role: string;
    };

    // Add user data to request
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Role-based access control middleware
export const authorizeRoles = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Access forbidden: Insufficient permissions' });
      return;
    }

    next();
  };
};

// Data access control middleware - automatically applies userId filtering for non-admin users
export const enforceDataAccess = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  // Modify query parameters for GET requests
  if (req.method === 'GET' && req.user.role !== 'admin') {
    // Add userId filter to query parameters for listing endpoints
    req.query.userId = String(req.user.userId);
    console.log(`[DataAccess] Enforcing userId filter for ${req.path}, userId: ${req.user.userId}`);
  }
  
  // For POST/PUT/DELETE, the controllers should handle authorization checks
  
  next();
}; 