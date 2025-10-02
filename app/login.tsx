// app/login.tsx
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

// Si ya tienes un helper, úsalo:
import { loginWithGoogle } from "@/src/api/auth";
// En caso de no tenerlo, descomenta este fallback:
// const loginWithGoogle = async (idToken: string) => {
//   const res = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/auth/google`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ id_token: idToken }),
//   });
//   if (!res.ok) {
//     const t = await res.text();
//     throw new Error(t || "Error autenticando con backend");
//   }
//   return res.json(); // { access_token: string, ... }
// };

WebBrowser.maybeCompleteAuthSession();

const SCHEME = "pignoraticiosmobile"; // debe coincidir con tu app.json/app.config.js

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Vars de entorno (asegúrate que existan en tu .env)
  const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!;
  const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

  // En Expo Go usamos proxy; en build nativo puedes ir sin proxy usando el scheme
  const useProxy = __DEV__;
  const redirectUri = useMemo(
    () => makeRedirectUri({ scheme: SCHEME, useProxy }),
    []
  );

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: WEB_CLIENT_ID,                 // Expo Go usa SIEMPRE el Web Client ID
    androidClientId: ANDROID_CLIENT_ID,      // Se usa cuando generas APK/AAB
    redirectUri,
    responseType: "id_token",
    scopes: ["profile", "email"],
    // prompt: "consent", // opcional: forzar selector de cuenta
  });

  useEffect(() => {
    (async () => {
      if (!response) return;

      if (response.type !== "success") {
        if (response.type === "error") {
          const msg = (response as any)?.error?.message || "Error desconocido";
          console.error("❌ Google auth error:", msg);
          Alert.alert("Error", `No se pudo autenticar: ${msg}`);
        }
        return;
      }

      // id_token puede venir en authentication o en params según la plataforma
      const idToken =
        (response as any)?.authentication?.idToken ??
        (response as any)?.params?.id_token;

      if (!idToken) {
        Alert.alert("Error", "No se recibió el token de Google");
        return;
      }

      try {
        setLoading(true);

        // Intercambia con tu backend para obtener tu propio JWT
        const data = await loginWithGoogle(idToken);
        const accessToken = data?.access_token || data?.accessToken;

        if (!accessToken) {
          throw new Error("El backend no devolvió access_token");
        }

        // Guarda el JWT (úsalo en tus peticiones)
        await SecureStore.setItemAsync("access_token", String(accessToken));

        // Navega a tu Home/Tabs
        router.replace("/(tabs)");
      } catch (e: any) {
        console.error("❌ Error backend:", e?.response?.data || e?.message || e);
        Alert.alert("Error", "No se pudo iniciar sesión con el backend");
      } finally {
        setLoading(false);
      }
    })();
  }, [response]);

  const onGooglePress = async () => {
    try {
      await promptAsync({ useProxy });
    } catch (e: any) {
      console.error("❌ promptAsync error:", e);
      Alert.alert("Error", "No se pudo abrir Google Sign-In.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>EmpeñosGT</Text>

      <TouchableOpacity style={styles.button} disabled={!request || loading} onPress={onGooglePress}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Continuar con Google</Text>
        )}
      </TouchableOpacity>

      {!request && <Text style={styles.helperText}>Cargando Google Sign-In...</Text>}

      <Text style={styles.note}>
        {useProxy
          ? "Modo Expo Go (usa Web Client ID + proxy)"
          : "Build nativo (usa Android Client ID + scheme)"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B132B",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
 gap: 18
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8
  },
  button: {
    backgroundColor: "#1C2541",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    minWidth: 280,
    alignItems: "center"
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600"
  },
  helperText: {
    marginTop: 12,
    color: "rgba(255,255,255,0.6)",
    fontSize: 12
  },
  note: {
    marginTop: 6,
    color: "rgba(255,255,255,0.4)",
    fontSize: 11
  }
});
