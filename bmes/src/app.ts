import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import config from './config';

// Import routes
import authRoutes from './modules/auth/routes';
import productionRoutes from './modules/production/routes';
import qualityControlRoutes from './modules/qualityControl/routes';

// Import middleware
import { authenticateToken, enforceDataAccess } from './modules/auth/middleware/authMiddleware';

// Initialize express app
const app = express();

// Apply middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Static folder for exports
app.use('/exports', express.static(path.join(__dirname, '..', 'exports')));

// API routes
app.use('/api/auth', authRoutes);

// Protected routes with authentication and data access control
app.use('/api/production', authenticateToken, enforceDataAccess, productionRoutes);
app.use('/api/quality-control', authenticateToken, enforceDataAccess, qualityControlRoutes);

// API health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: config.isDev ? err.message : undefined
  });
});

export default app;
