import { Router } from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  getCurrentUser
} from '../controllers/authController';
import {
  registerValidation,
  loginValidation
} from '../validations/authValidations';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);

export default router; 