import axios from 'axios';

// Use environment variable for API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('🔗 API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 2 minutes timeout for slow connections/Render cold start
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error.message);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log error details
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      code: error.code
    });
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      const publicPaths = ['/login', '/register', '/', '/verify-email'];
      const currentPath = window.location.pathname;
      
      if (!publicPaths.some(path => currentPath.startsWith(path))) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    // Return the original error
    return Promise.reject(error);
  }
);

// Wake up function for Render cold starts
export const wakeUpBackend = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    await fetch(`${API_URL.replace('/api', '')}/health`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    console.log('Wake up attempt:', error.message);
    return false;
  }
};

// Retry wrapper for slow endpoints
export const retryRequest = async (requestFn, maxRetries = 3, delay = 2000) => {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await requestFn();
      return { success: true, data: response.data, response };
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx) except 408/429
      if (error.response?.status >= 400 && error.response?.status < 500) {
        if (![408, 429].includes(error.response.status)) {
          break;
        }
      }
      
      // Wait before retry
      if (i < maxRetries) {
        console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 1.5; // Exponential backoff
      }
    }
  }
  
  return { success: false, error: lastError };
};

export default api;