import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import router from '@/router';

// Create axios instance with base URL from environment variable
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Enable sending cookies with cross-origin requests
});

// Add a request interceptor to include token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 (Unauthorized) or 403 (Forbidden) and not already retrying
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const { data } = await axios.get('/api/auth/refresh', { 
          baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
          withCredentials: true 
        });
        
        // Update token in localStorage
        localStorage.setItem('accessToken', data.accessToken);
        
        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, handle token expiration
        console.log('Token refresh failed, redirecting to login');
        
        // Update auth store state
        const authStore = useAuthStore();
        if (authStore) {
          authStore.resetAuth();
        }
        
        // Redirect to login page
        if (router.currentRoute.value.name !== 'Login') {
          router.push({ 
            name: 'Login', 
            query: { redirect: router.currentRoute.value.fullPath, expired: 'true' } 
          });
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 