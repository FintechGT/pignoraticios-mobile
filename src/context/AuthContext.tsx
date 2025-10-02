// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, useSegments } from "expo-router";
import { getMe, logout as logoutApi, hasToken, type User } from "@/src/api/auth";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const router = useRouter();
  const segments = useSegments();

  // ✅ Cargar usuario (igual que refresh() en web)
  const refresh = async () => {
    try {
      setLoading(true);
      const userData = await getMe();
      setUser(userData);
    } catch (error) {
      console.error("Error al cargar usuario:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Cerrar sesión
  const logout = async () => {
    await logoutApi();
    setUser(null);
    router.replace("/login");
  };

  // ✅ Verificar sesión al iniciar (igual que useEffect en AppLayoutClient.tsx)
  useEffect(() => {
    (async () => {
      const exists = await hasToken();
      if (!exists) {
        setLoading(false);
        return;
      }
      await refresh();
    })();
  }, []);

  // ✅ Protección de rutas (igual que en AppShell.tsx)
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(tabs)";

    if (!user && inAuthGroup) {
      // Usuario no autenticado intentando acceder a rutas protegidas
      router.replace("/login");
    } else if (user && !inAuthGroup) {
      // Usuario autenticado en login → redirigir a home
      router.replace("/(tabs)");
    }
  }, [user, loading, segments]);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}