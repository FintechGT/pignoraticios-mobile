// app.config.js
export default ({ config }) => ({
  ...config,
  expo: {
    ...(config.expo || {}),
    extra: {
      ...(config.expo?.extra || {}),
      androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
    }
  }
});
