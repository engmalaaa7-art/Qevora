import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { config } from "./config";
import { storage } from "./storage";
import { STORAGE_KEYS } from "./constants";

export class APIError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "APIError";
  }
}

const axiosInstance = axios.create({
  baseURL: config.apiUrl,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (cfg: InternalAxiosRequestConfig) => {
    // Inject authorization token if present
    const token = storage.get(STORAGE_KEYS.TOKEN);
    if (token && !cfg.headers.Authorization) {
      cfg.headers.Authorization = `Bearer ${token}`;
    }
    return cfg;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    let status = 500;
    let message = "Network Error";
    let data: any = null;

    if (error.response) {
      status = error.response.status;
      data = error.response.data;
      message = (data as any)?.detail || (data as any)?.message || error.response.statusText || message;
    } else if (error.request) {
      message = "No response received from server. Please check your network connection.";
    } else {
      message = error.message;
    }

    // Normalized error structure
    const apiError = new APIError(message, status, data);
    return Promise.reject(apiError);
  }
);

export const api = {
  get: async <T>(endpoint: string, options?: any): Promise<T> => {
    const response = await axiosInstance.get<T>(endpoint, options);
    return response.data;
  },
  post: async <T>(endpoint: string, body?: any, options?: any): Promise<T> => {
    const response = await axiosInstance.post<T>(endpoint, body, options);
    return response.data;
  },
  put: async <T>(endpoint: string, body?: any, options?: any): Promise<T> => {
    const response = await axiosInstance.put<T>(endpoint, body, options);
    return response.data;
  },
  delete: async <T>(endpoint: string, options?: any): Promise<T> => {
    const response = await axiosInstance.delete<T>(endpoint, options);
    return response.data;
  },
};
