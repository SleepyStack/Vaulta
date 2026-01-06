import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL;

console.log('🔧 API Configuration:');
console.log('   Base URL:', baseURL);
console.log('   Environment:', process.env.NODE_ENV);

if (! baseURL) {
  console.error('❌ NEXT_PUBLIC_API_URL is not set! ');
  console.error('   Create frontend/.env.local with: NEXT_PUBLIC_API_URL=http://localhost:8080');
}

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
  console.log('   Full URL:', `${config.baseURL}${config.url}`);
  
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('vaulta_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('   🔑 Token attached');
    }
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    console.log('   Data:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.message);
    console.error('   URL:', error.config?.url);
    console.error('   Status:', error. response?.status);
    console.error('   Data:', error. response?.data);
    
    // 401/403 triggers a security logout based on our SecureUser logic
    // BUT only if we're NOT on the login or register page (those expect 401 for bad credentials)
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        
        // Don't redirect if we're already on login/register - let the page handle the error
        if (currentPath !== '/login' && currentPath !== '/register') {
          localStorage.removeItem('vaulta_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;