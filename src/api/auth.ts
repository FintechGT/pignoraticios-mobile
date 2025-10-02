// src/api/auth.ts
import { api } from "./cliente";  // ✅ CORRECTO
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
// src/api/auth.ts
export async function loginWithGoogle(idToken: string) {
  const url = `${process.env.EXPO_PUBLIC_API_BASE_URL}/auth/google`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token: idToken }), // el backend espera "id_token"
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text || `Error ${res.status}`);
  try { return JSON.parse(text); } catch { return text as any; }
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