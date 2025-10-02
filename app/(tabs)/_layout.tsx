// app/(tabs)/_layout.tsx
import React from "react";
import { Tabs } from "expo-router";
import { House, User2 } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => <User2 color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

