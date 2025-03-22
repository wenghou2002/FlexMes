import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { User, login as loginService, logout as logoutService, register as registerService, LoginData, RegisterData } from '@/services/authService';

// Define error types
export interface AuthError {
  message?: string;
  general?: string[];
  password?: string[];
  [key: string]: any;
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | AuthError | null>(null);
  const isAuthenticated = ref(false);

  // Initialize state from localStorage
  const initializeFromLocalStorage = () => {
    const userJson = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    
    if (userJson && token) {
      user.value = JSON.parse(userJson);
      isAuthenticated.value = true;
    }
  };
  
  // Initialize on store creation
  initializeFromLocalStorage();

  // Actions
  const login = async (credentials: LoginData) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await loginService(credentials);
      user.value = response.user;
      isAuthenticated.value = true;
      
      return response;
    } catch (err: any) {
      if (err.response?.data) {
        error.value = err.response.data;
      } else {
        error.value = err.message || 'Failed to login';
      }
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const register = async (userData: RegisterData) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await registerService(userData);
      return response;
    } catch (err: any) {
      if (err.response?.data) {
        error.value = err.response.data;
      } else {
        error.value = err.message || 'Failed to register';
      }
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    loading.value = true;
    
    try {
      await logoutService();
      user.value = null;
      isAuthenticated.value = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    } catch (err: any) {
      console.error('Logout error:', err);
    } finally {
      loading.value = false;
    }
  };

  // Reset auth state (for token expiration)
  const resetAuth = () => {
    user.value = null;
    isAuthenticated.value = false;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  };

  // Computed
  const userRole = computed(() => user.value?.role || 'guest');
  const username = computed(() => user.value?.username || '');

  return {
    // State
    user,
    loading,
    error,
    isAuthenticated,
    
    // Actions
    login,
    register,
    logout,
    resetAuth,
    
    // Computed
    userRole,
    username
  };
}); 