import axios from 'axios';

// Create a globally accessible Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  // Crucial: ensures cookies (like the Fastify JWT token) are sent and received cross-origin
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Here we can catch 401 Unauthorized errors to dispatch a logout event globally later
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized request, user might need to log in again.');
      // window.location.href = '/login'; // Optional: forces redirect
    }
    return Promise.reject(error);
  }
);

export default api;
