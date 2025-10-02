import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter, Link } from "expo-router";
import { register, login } from "@/src/api/auth";

export default function RegisterScreen() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit() {
    setErr(null);
    setLoading(true);
    try {
      await register({ nombre, email: email.trim().toLowerCase(), password });
      await login({ email: email.trim().toLowerCase(), password }); // auto-login
      router.replace("(tabs)");
    } catch (e: any) {
      setErr(e?.message ?? "No se pudo registrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0b0b0b", padding: 20, justifyContent: "center" }}>
      <Text style={{ color: "white", fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 16 }}>
        Crear cuenta
      </Text>

      {!!err && <Text style={{ color: "#fda4af", textAlign: "center", marginBottom: 10 }}>{err}</Text>}

      <TextInput placeholder="Tu nombre" placeholderTextColor="#a3a3a3"
        style={{ color: "white", borderColor: "#27272a", borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 }}
        value={nombre} onChangeText={setNombre} />

      <TextInput placeholder="correo@dominio.com" placeholderTextColor="#a3a3a3" autoCapitalize="none" keyboardType="email-address"
        style={{ color: "white", borderColor: "#27272a", borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 }}
        value={email} onChangeText={setEmail} />

      <TextInput placeholder="••••••••" placeholderTextColor="#a3a3a3" secureTextEntry
        style={{ color: "white", borderColor: "#27272a", borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 }}
        value={password} onChangeText={setPassword} />

      <TouchableOpacity disabled={loading} onPress={onSubmit}
        style={{ backgroundColor: "#22c55e", paddingVertical: 12, borderRadius: 12, alignItems: "center", opacity: loading ? 0.6 : 1 }}>
        {loading ? <ActivityIndicator /> : <Text style={{ color: "white", fontWeight: "600" }}>Crear cuenta</Text>}
      </TouchableOpacity>

      <Text style={{ color: "#a3a3a3", textAlign: "center", marginTop: 14 }}>
        ¿Ya tienes cuenta? <Link href="/login" style={{ color: "#60a5fa" }}>Inicia sesión</Link>
      </Text>
    </View>
  );
}
