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
