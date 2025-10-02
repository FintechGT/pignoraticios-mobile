// app/login.tsx
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

WebBrowser.maybeCompleteAuthSession();

// IMPORTANTÍSIMO: redirect EXACTO del proxy de Expo (debe estar en Google Cloud)
const EXPO_REDIRECT_URI = "https://auth.expo.io/@jeancarlo_dev/pignoraticios-mobile";

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!;
  const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

  console.log("➡️ Usando redirectUri:", EXPO_REDIRECT_URI);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: WEB_CLIENT_ID,               // Expo Go usa SIEMPRE el Web Client ID
    androidClientId: ANDROID_CLIENT_ID,    // Para build nativo
    responseType: "id_token",
    scopes: ["profile", "email"],
    // 👇 forzamos el redirect del proxy (NADA de exp://)
    redirectUri: EXPO_REDIRECT_URI,
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

      const idToken =
        (response as any)?.authentication?.idToken ??
        (response as any)?.params?.id_token;

      console.log("✅ idToken len:", idToken?.length, "pref:", idToken?.slice?.(0, 14));
      if (!idToken) return Alert.alert("Error", "No se recibió el token de Google");

      try {
        setLoading(true);
        const r = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_token: idToken }), // el backend espera id_token
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data?.detail || `Error ${r.status}`);

        const accessToken = data?.access_token || data?.accessToken;
        if (!accessToken) throw new Error("El backend no devolvió access_token");

        await SecureStore.setItemAsync("access_token", String(accessToken));
        router.replace("/(tabs)");
      } catch (e: any) {
        console.error("❌ Error backend:", e?.message || e);
        Alert.alert("Error", e?.message || "No se pudo iniciar sesión con el backend");
      } finally {
        setLoading(false);
      }
    })();
  }, [response]);

  const onGooglePress = async () => {
    try {
      // 👇 usa el proxy; como ya pasamos redirectUri del proxy, no habrá exp://
      await promptAsync({ useProxy: true, redirectUri: EXPO_REDIRECT_URI });
    } catch (e: any) {
      console.error("❌ promptAsync error:", e);
      Alert.alert("Error", "No se pudo abrir Google Sign-In.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>EmpeñosGT</Text>
      <TouchableOpacity style={styles.button} disabled={!request || loading} onPress={onGooglePress}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Continuar con Google</Text>}
      </TouchableOpacity>
      {!request && <Text style={styles.helper}>Cargando Google Sign-In…</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B132B", alignItems: "center", justifyContent: "center", padding: 24, gap: 18 },
  title: { color: "#fff", fontSize: 28, fontWeight: "800" },
  button: { backgroundColor: "#1C2541", paddingVertical: 14, paddingHorizontal: 18, borderRadius: 12, minWidth: 280, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  helper: { marginTop: 12, color: "rgba(255,255,255,0.7)", fontSize: 12 }
});
