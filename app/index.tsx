// app/index.tsx
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const t = await SecureStore.getItemAsync("access_token");
        if (!alive) return;
        router.replace(t ? "(tabs)" : "login"); // si hay token → tabs; si no → login
      } catch {
        router.replace("login");
      }
    })();
    return () => {
      alive = false;
    };
  }, [router]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0b0b0b" }}>
      <ActivityIndicator color="#2563eb" size="large" />
    </View>
  );
}
