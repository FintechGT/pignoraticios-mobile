// app.config.js
export default ({ config }) => ({
  ...config,
  expo: {
    ...(config.expo || {}),
    name: "pignoraticios-mobile",
    slug: "pignoraticios-mobile",
    scheme: "pignoraticiosmobile",              // 👈 CLAVE
    newArchEnabled: true,
    userInterfaceStyle: "automatic",
    ios: { supportsTablet: true },
    android: {
      package: "com.jeancarlo.pignoraticios",
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash.png",
          imageWidth: 220,
          resizeMode: "contain",
          backgroundColor: "#0B1B2B",
          dark: { backgroundColor: "#000000" }
        }
      ],
      "expo-secure-store",
      "expo-web-browser"
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    extra: {
      ...(config.expo?.extra || {}),
      googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
      googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      eas: {
        ...(config.expo?.extra?.eas || {}),
        projectId: "7c15571b-9675-4940-937c-a23917ee047b"
      }
    }
  }
});
