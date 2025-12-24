import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Log error details in development
      if (import.meta.env.DEV) {
        console.error('API Error:', {
          status,
          url: error.config?.url,
          method: error.config?.method,
          message: data?.message,
          fullError: data
        });
      }

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login') {
            toast.error('Session expired. Please login again.');
            window.location.href = '/login';
          }
          break;
        case 403:
          toast.error(data.message || 'Access denied');
          break;
        case 404:
          toast.error(data.message || 'Resource not found');
          break;
        case 400:
          // Validation errors
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach((err) => {
              toast.error(err.message || err);
            });
          } else {
            toast.error(data.message || 'Invalid request');
          }
          break;
        case 500:
          // Show the actual error message from backend
          const errorMsg = data.message || data.error || 'Server error. Please try again.';
          toast.error(errorMsg);
          console.error('Server error:', data);
          break;
        default:
          toast.error(data.message || data.error || 'An error occurred');
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('An unexpected error occurred');
    }

    return Promise.reject(error);
  }
);

export default api;

