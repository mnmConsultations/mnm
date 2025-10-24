/**
 * Axios HTTP Client Configuration
 * 
 * Pre-configured Axios instance for API requests
 * Handles authentication, base URL, and error responses
 * 
 * Configuration:
 * - baseURL: Auto-detects origin (client) or defaults to localhost (server)
 * - responseType: JSON for all requests
 * 
 * Request Interceptor:
 * - Auto-attaches JWT token from localStorage to Authorization header
 * - Format: Bearer <token>
 * - Client-side only (checks typeof window)
 * 
 * Response Interceptor:
 * - Handles 401 Unauthorized errors globally
 * - Auto-clears invalid token from localStorage
 * - Auto-redirects to /auth/signin on auth failure
 * 
 * Special Case - /auth/me:
 * - Allows 401 without redirect
 * - Used to check auth status without forcing login
 * 
 * Redirect Protection:
 * - Skips redirect if already on /auth/* pages
 * - Prevents redirect loops
 * 
 * Usage:
 * import { apiInstance } from '@/lib/utils/axios';
 * const response = await apiInstance.get('/api/dashboard/tasks');
 * 
 * UX Benefits:
 * - Seamless authentication across all API calls
 * - Automatic session cleanup on token expiry
 * - User-friendly redirect to login when needed
 */
import axios from "axios";

export const apiInstance = axios.create({
  baseURL: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
  responseType: "json",
});

apiInstance.interceptors.request.use((reqPayload) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      reqPayload.headers.Authorization = `Bearer ${token}`;
    }
  }
  return reqPayload;
});

apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/me')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem("token");
        if (!window.location.pathname.startsWith('/auth/')) {
          window.location.href = "/auth/signin";
        }
      }
    }
    return Promise.reject(error);
  }
);
