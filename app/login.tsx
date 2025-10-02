// app/login.tsx
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
// import { loginWithGoogle } from "@/src/api/auth";

WebBrowser.maybeCompleteAuthSession();

// En Expo Go no necesitamos scheme; lo usamos en build nativo.
// Lo dejamos definido por si lo usas luego.
const SCHEME = "pignoraticiosmobile";

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!;
  const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

  // 👇 FORZAR PROXY EN EXPO GO
  const useProxy = true;

  // 👇 IMPORTANTE: sin scheme cuando useProxy=true para obtener https://auth.expo.io/...
  const redirectUri = useMemo(
    () => makeRedirectUri({ useProxy: true }),
    []
  );

  console.log("🔁 redirectUri (debe empezar con https://auth.expo.io):", redirectUri);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: WEB_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
    responseType: "id_token",
    scopes: ["profile", "email"],
    redirectUri, // 👈 aquí va el redirect del proxy
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

      console.log("➡️ idToken length:", idToken?.length, "prefix:", idToken?.slice?.(0, 14));
      if (!idToken) return Alert.alert("Error", "No se recibió el token de Google");

      try {
        setLoading(true);

        // === Llama a tu backend ===
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_token: idToken }), // el backend espera "id_token"
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.detail || `Error ${res.status}`);

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
      await promptAsync({ useProxy: true }); // 👈 forzar proxy también aquí
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
