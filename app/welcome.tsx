// app/welcome.tsx
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function Welcome() {
  return (
    <View style={s.container}>
      <Image source={require("@/assets/images/Logo.png")} style={s.logo} resizeMode="contain" />
      <Text style={s.title}>Bienvenido a Empeños GT</Text>
      <Text style={s.subtitle}>Gestiona tus empeños de forma rápida y segura</Text>

      <View style={{ height: 16 }} />

      <Link href="/login" asChild>
        <TouchableOpacity style={s.primaryBtn}>
          <Text style={s.primaryText}>Iniciar sesión</Text>
        </TouchableOpacity>
      </Link>

      <View style={{ height: 10 }} />

      <Link href="/register" asChild>
        <TouchableOpacity style={s.secondaryBtn}>
          <Text style={s.secondaryText}>Crear cuenta</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: "#0B1B2B", padding: 24,
    alignItems: "center", justifyContent: "center"
  },
  logo: { width: 180, height: 180, marginBottom: 14 },
  title: { color: "#fff", fontSize: 24, fontWeight: "700" },
  subtitle: { color: "rgba(255,255,255,0.8)", textAlign: "center", marginTop: 6 },
  primaryBtn: {
    backgroundColor: "#1E66F5", paddingVertical: 14, borderRadius: 12, width: "100%", alignItems: "center"
  },
  primaryText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  secondaryBtn: {
    borderColor: "rgba(255,255,255,0.2)", borderWidth: 1, paddingVertical: 14,
    borderRadius: 12, width: "100%", alignItems: "center", backgroundColor: "rgba(255,255,255,0.04)"
  },
  secondaryText: { color: "#fff", fontSize: 16, fontWeight: "600" }
});
