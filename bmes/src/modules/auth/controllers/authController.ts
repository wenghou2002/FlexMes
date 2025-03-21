import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';
import config from '../../../config';
import { SignOptions } from 'jsonwebtoken';

// Register a new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Format user-friendly error messages
      const errorMessages: {
        general: string[],
        password: string[]
      } = {
        general: [],
        password: []
      };
      
      // Extract error messages
      errors.array().forEach(error => {
        if (error.msg && typeof error.msg === 'string') {
          // Check if it's a password-related error message by content
          if (error.msg.includes('Password')) {
            errorMessages.password.push(error.msg);
          } else {
            // @ts-ignore - Express-validator types may vary between versions
            errorMessages.general.push(`${error.path || error.param}: ${error.msg}`);
          }
        }
      });
      
      res.status(400).json({ 
        message: 'Validation failed',
        errors: errorMessages,
        passwordRequirements: {
          minLength: 8,
          requiresDigit: true,
          requiresUppercase: true,
          requiresLowercase: true,
          requiresSpecialChar: true,
          exampleValidPassword: 'Example1Password!'
        }
      });
      return;
    }

    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      res.status(409).json({ 
        message: 'Registration failed',
        error: 'Username or email already exists',
        suggestion: 'Please try a different username or email address, or use the password recovery option if you already have an account'
      });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: 'user' // Default role
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json({ 
      message: 'User registered successfully',
      user: newUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Failed to register user', 
      error: 'An unexpected error occurred while creating your account. Please try again later.',
      technicalDetails: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Format user-friendly error messages
      const errorMessages: string[] = [];
      
      // Extract error messages
      errors.array().forEach(error => {
        if (error.msg && typeof error.msg === 'string') {
          errorMessages.push(error.msg);
        }
      });
      
      res.status(400).json({ 
        message: 'Login failed',
        errors: errorMessages
      });
      return;
    }

    const { username, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      res.status(401).json({ 
        message: 'Login failed',
        error: 'Invalid username or password',
        suggestion: 'Please check your credentials and try again'
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ 
        message: 'Login failed',
        error: 'Invalid username or password',
        suggestion: 'Please check your credentials and try again'
      });
      return;
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.accessTokenExpiry } as SignOptions
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      config.jwt.secret,
      { expiresIn: config.jwt.refreshTokenExpiry } as SignOptions
    );

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      ...config.cookie,
      maxAge: config.cookie.maxAge
    });

    // Return user and access token
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      accessToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Failed to login', 
      error: 'An unexpected error occurred. Please try again later.',
      technicalDetails: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

// Refresh token
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ message: 'Refresh token not found' });
      return;
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.secret) as { userId: number };
    const userId = decoded.userId;

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(401).json({ message: 'Invalid refresh token' });
      return;
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.accessTokenExpiry } as SignOptions
    );

    res.status(200).json({
      accessToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// Logout user
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Clear refresh token cookie
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Failed to logout', error: (error as Error).message });
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Failed to get user', error: (error as Error).message });
  }
}; 