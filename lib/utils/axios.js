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

// Response interceptor to handle auth errors gracefully
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect on 401 for auth/me endpoint as it's expected when not logged in
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/me')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem("token");
        // Only redirect if not already on auth pages
        if (!window.location.pathname.startsWith('/auth/')) {
          window.location.href = "/auth/signin";
        }
      }
    }
    return Promise.reject(error);
  }
);
