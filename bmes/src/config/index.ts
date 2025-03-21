import 'dotenv/config';
import path from 'path';

// Load environment variables from .env file
path.resolve(__dirname, '../../.env');

export default {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:admin@localhost:5432/test?schema=public',
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'mes-dashboard-secret-key-change-in-production',
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '1h', // 1 hour
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d', // 7 days
  },
  
  // Cookie Configuration
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  },
}; 