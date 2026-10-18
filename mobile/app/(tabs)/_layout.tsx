import React from "react";
import { Tabs } from "expo-router";
import { colors as c } from "../../lib/theme";
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: c.card, borderTopColor: c.line },
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.muted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Início", tabBarIcon: () => null }}
      />
      <Tabs.Screen
        name="monitors"
        options={{ title: "Alertas", tabBarIcon: () => null }}
      />
      <Tabs.Screen
        name="notifications"
        options={{ title: "Notificações", tabBarIcon: () => null }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Conta", tabBarIcon: () => null }}
      />
    </Tabs>
  );
}
