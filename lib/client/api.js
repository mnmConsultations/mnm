/**
 * Client-Side API Instance
 * 
 * Alternative axios configuration for client-side API calls
 * Similar to lib/utils/axios.js but with environment variable support
 * 
 * Configuration:
 * - baseURL: Uses NEXT_PUBLIC_API_URL env var or defaults to /api
 * - responseType: JSON for all requests
 * 
 * Request Interceptor:
 * - Auto-attaches JWT token from localStorage
 * - Format: Bearer <token>
 * - Only runs in browser (checks typeof window)
 * 
 * Response Interceptor:
 * - Handles 401 Unauthorized globally
 * - Auto-clears token on auth failure
 * - Redirects to /auth/signin
 * 
 * Differences from lib/utils/axios.js:
 * - Supports NEXT_PUBLIC_API_URL environment variable
 * - Simpler error handling (no /auth/me exception)
 * - No auth page redirect protection
 * 
 * Usage:
 * import { apiInstance } from '@/lib/client/api';
 * const response = await apiInstance.get('/endpoint');
 * 
 * Note: This file duplicates functionality from lib/utils/axios.js
 * Consider consolidating these two files in future refactoring
 */
import axios from "axios";

export const apiInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  responseType: "json",
});

apiInstance.interceptors.request.use((reqPayload) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  if (token) {
    reqPayload.headers.Authorization = `Bearer ${token}`;
  }
  return reqPayload;
});

apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem("token");
        window.location.href = "/auth/signin";
      }
    }
    return Promise.reject(error);
  }
);
