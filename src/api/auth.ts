// src/api/auth.ts
import { api } from "./client";
import * as SecureStore from "expo-secure-store";

export type User = {
  ID_Usuario: number;
  Nombre: string;
  Correo: string;
  Verificado?: boolean;
  Estado_Activo?: boolean;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
};

/**
 * Login con Google (igual que en web)
 */
export async function loginWithGoogle(id_token: string): Promise<TokenResponse> {
  const response = await api.post<TokenResponse>("/auth/google", { id_token });
  const { access_token } = response.data;

  // Guardar token (como saveToken() en web)
  await SecureStore.setItemAsync("access_token", access_token);

  return response.data;
}

/**
 * Obtener datos del usuario autenticado (igual que getMe() en web)
 */
export async function getMe(): Promise<User> {
  const response = await api.get<User>("/auth/me");
  return response.data;
}

/**
 * Cerrar sesión (igual que clearToken() en web)
 */
export async function logout(): Promise<void> {
  await SecureStore.deleteItemAsync("access_token");
}

/**
 * Verificar si existe token
 */
export async function hasToken(): Promise<boolean> {
  const token = await SecureStore.getItemAsync("access_token");
  return !!token;
}