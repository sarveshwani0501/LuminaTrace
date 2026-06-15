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
    // Redirect to login on 401 — handles session expiry mid-session.
    // The primary auth guard lives in PrivateLayout (checks Redux isAuthenticated).
    if (error.response && error.response.status === 401) {
      // Only redirect if we're currently inside an app route to avoid redirect loops
      if (window.location.pathname.startsWith('/app')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
