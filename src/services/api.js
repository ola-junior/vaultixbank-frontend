import axios from 'axios';

// Use environment variable for API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('🔗 API URL:', API_URL); // Always log in production for debugging

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // ✅ 60 seconds for Render cold start
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    // Log the actual error
    console.error('❌ Response Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message,
      code: error.code
    });
    
    // ✅ FIX: Don't transform the error - pass it through!
    // Let the component handle it
    
    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401) {
      const publicPaths = ['/login', '/register', '/', '/verify-email'];
      const currentPath = window.location.pathname;
      
      if (!publicPaths.some(path => currentPath.startsWith(path))) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    // ✅ Return the original error so component can access error.response
    return Promise.reject(error);
  }
);

export default api;