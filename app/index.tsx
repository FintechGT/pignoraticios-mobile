// app/index.tsx
import { useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        console.log("🔍 Verificando token...");
        const token = await SecureStore.getItemAsync("access_token");

        console.log("🔑 Token encontrado:", token ? "Sí" : "No");

        if (!alive) return;

        // Pequeño delay para asegurar que la navegación esté lista
        await new Promise(resolve => setTimeout(resolve, 100));

        if (token) {
          console.log("✅ Redirigiendo a (tabs)");
          router.replace("/(tabs)");
        } else {
          console.log("➡️ Redirigiendo a login");
          router.replace("/login");
        }
      } catch (error) {
        console.error("❌ Error en Index:", error);
        if (!alive) return;
        router.replace("/login");
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <View style={{
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#0B1B2B"
    }}>
      <ActivityIndicator color="#1e66f5" size="large" />
      <Text style={{ color: "#fff", marginTop: 16 }}>Cargando...</Text>
    </View>
  );
}