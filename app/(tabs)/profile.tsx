// app/(tabs)/profile.tsx
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { me, logout, type Me } from "@/src/api/auth";
import { useRouter } from "expo-router";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<Me | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const u = await me();
        setUser(u);
      } catch (e) {
        console.log("Error cargando perfil:", e);
      }
    })();
  }, []);

  async function onLogout() {
    await logout(); // borra token de SecureStore
    router.replace("/login");
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0b0b0b", padding: 16 }}>
      <Text style={{ color: "white", fontSize: 22, fontWeight: "700", marginBottom: 16 }}>
        Mi Perfil
      </Text>

      <View style={{ marginBottom: 24, padding: 16, borderRadius: 16, borderColor: "#262626", borderWidth: 1 }}>
        <Row label="ID Usuario" value={user?.ID_Usuario ?? "—"} />
        <Row label="Nombre" value={user?.Nombre ?? "—"} />
        <Row label="Correo" value={user?.Correo ?? "—"} />
        <Row label="Verificado" value={user?.Verificado ? "Sí" : "No"} />
      </View>

      <TouchableOpacity
        onPress={() =>
          Alert.alert("Cerrar sesión", "¿Seguro que deseas salir?", [
            { text: "Cancelar" },
            { text: "Salir", style: "destructive", onPress: onLogout },
          ])
        }
        style={{
          backgroundColor: "#ef4444",
          paddingVertical: 12,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "600" }}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
      <Text style={{ color: "#a3a3a3" }}>{label}</Text>
      <Text style={{ color: "white", fontWeight: "600" }}>{String(value)}</Text>
    </View>
  );
}
