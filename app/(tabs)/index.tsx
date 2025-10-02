// app/(tabs)/index.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { me, type User } from "@/src/api/auth";

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        console.log("🏠 Cargando datos del usuario...");
        const userData = await me();

        if (!alive) return;

        console.log("✅ Usuario cargado:", userData.Nombre);
        setUser(userData);
      } catch (error) {
        console.error("❌ Error al cargar usuario:", error);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1e66f5" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {user ? `Hola, ${user.Nombre}!` : "Bienvenido"}
      </Text>
      <Text style={styles.subtitle}>
        {user?.Correo || "No se pudo cargar el usuario"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1B2B",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
  },
  loadingText: {
    color: "#fff",
    marginTop: 12,
  },
});