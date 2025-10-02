// src/api/cliente.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:8000";

console.log("🌐 API Base URL:", API_BASE_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ✅ Interceptor: Agregar token automáticamente
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Interceptor: Manejar errores
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Log para debugging
    console.error("❌ API Error:", {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });

    if (error?.response?.status === 401) {
      // Token inválido/expirado
      await SecureStore.deleteItemAsync("access_token");
    }

    const message =
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      error?.message ||
      "Error de red";

    return Promise.reject(new Error(message));
  }
);