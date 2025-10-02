// app/login.tsx
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { loginWithGoogle } from "@/src/api/auth";

// Cierra posibles sesiones previas del navegador in-app
WebBrowser.maybeCompleteAuthSession();

const SCHEME = "pignoraticiosmobile"; // coincide con app.json

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Variables de entorno (Expo Public)
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!;
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID; // opcional en Expo Go

  // En Expo Go usamos SIEMPRE proxy para evitar requisitos de androidClientId
  const useProxy = true;
  const redirectUri = makeRedirectUri({ scheme: SCHEME, useProxy });

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: webClientId,              // siempre
    androidClientId,                    // se usará cuando no haya proxy (build nativa)
    redirectUri,
    scopes: ["profile", "email"],
    // IMPORTANTÍSIMO: con proxy activado no exigirá androidClientId en Expo Go
  });

  useEffect(() => {
    (async () => {
      if (response?.type !== "success") return;
      // idToken puede venir en authentication o en params, según versión
      const idToken =
        (response as any).authentication?.idToken ??
        (response as any).params?.id_token;

      if (!idToken) {
        Alert.alert("Google", "No se recibió id_token");
        return;
      }

      try {
        setLoading(true);
        await loginWithGoogle(idToken);
        // guarda que hay token; si tu API ya lo hace, omite esta línea
        await SecureStore.setItemAsync("last_login_provider", "google");
        router.replace("(tabs)");
      } catch (e: any) {
        console.error(e);
        Alert.alert("Inicio de sesión", "No se pudo iniciar sesión con Google.");
      } finally {
        setLoading(false);
      }
    })();
  }, [response]);

  const onGooglePress = async () => {
    if (!request) return;
    try {
      setLoading(true);
      await promptAsync({ useProxy }); // clave en Expo Go
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar sesión</Text>

      <TouchableOpacity
        disabled={!request || loading}
        onPress={onGooglePress}
        style={[styles.button, (!request || loading) && { opacity: 0.7 }]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Continuar con Google</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center", padding: 24 },
  title: { color: "#fff", fontSize: 24, fontWeight: "700", marginBottom: 24 },
  button: {
    backgroundColor: "#1e66f5",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 240,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
