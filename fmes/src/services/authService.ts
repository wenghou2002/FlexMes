import api from './api';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

/**
 * Authentication service for handling user authentication
 */
export class AuthService {
  /**
   * Register a new user
   * @param data User registration data
   * @returns Promise with user data
   */
  static async register(data: RegisterData): Promise<{ message: string; user: User }> {
    try {
      const response = await api.post('/auth/register', data);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login a user
   * @param data User login data
   * @returns Promise with auth response containing user and token
   */
  static async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', data);
      
      // Store token and user in localStorage
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout the current user
   */
  static async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
      
      // Clear localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Get the current authenticated user
   * @returns Promise with user data
   */
  static async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  /**
   * Check if the user is authenticated
   * @returns Boolean indicating if user is logged in
   */
  static isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  /**
   * Get the current user from localStorage
   * @returns User object or null if not logged in
   */
  static getUser(): User | null {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }
}

/**
 * Convenience exports for direct function imports
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  return AuthService.login(data);
};

export const register = async (data: RegisterData): Promise<{ message: string; user: User }> => {
  return AuthService.register(data);
};

export const logout = async (): Promise<void> => {
  return AuthService.logout();
};

export const isAuthenticated = (): boolean => {
  return AuthService.isAuthenticated();
};

export function getUser(): User | null {
  return AuthService.getUser();
} 