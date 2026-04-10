import api from '../services/api';

export const testApiConnection = async () => {
  console.log('Testing API Connection...');
  console.log('API URL:', import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
  
  try {
    // Test health endpoint
    const healthResponse = await fetch('http://localhost:5000/health');
    const healthData = await healthResponse.json();
    console.log('Health Check:', healthData);
    
    // Test registration endpoint with minimal data
    const testData = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
    };
    
    console.log('Testing registration with:', testData);
    
    const response = await api.post('/auth/register', testData);
    console.log('Registration Success:', response.data);
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('API Test Failed:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    
    return { 
      success: false, 
      error: error.response?.data || error.message 
    };
  }
};