import React, { useEffect, useState } from "react";
import { ScrollView, Text, Alert, Platform } from "react-native";
import { supabase } from "../../lib/supabase";
import { api } from "../../lib/api";
import { Page, Heading, Action, s } from "../../components/ui";
import { colors as c } from "../../lib/theme";
export default function Profile() {
  const [email, setEmail] = useState("");
  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data }) => setEmail(data.user?.email || ""));
  }, []);
  async function enablePush() {
    try {
      if (Platform.OS === "web")
        throw new Error("Push nativo exige Android ou iOS");
      const Notifications = await import("expo-notifications");
      const Device = await import("expo-device");
      if (!Device.isDevice)
        throw new Error("Use um dispositivo físico para testar push");
      if (Platform.OS === "android")
        await Notifications.setNotificationChannelAsync("default", {
          name: "Alertas",
          importance: Notifications.AndroidImportance.HIGH,
        });
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
      let p = await Notifications.getPermissionsAsync();
      if (p.status !== "granted")
        p = await Notifications.requestPermissionsAsync();
      if (p.status !== "granted") throw new Error("Permissão não concedida");
      const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
      if (!projectId) throw new Error("Configure EXPO_PUBLIC_EAS_PROJECT_ID");
      const token = (await Notifications.getExpoPushTokenAsync({ projectId }))
        .data;
      await api("/devices", {
        method: "POST",
        body: JSON.stringify({ expoToken: token }),
      });
      Alert.alert("Pronto", "Notificações ativadas");
    } catch (e: any) {
      Alert.alert("Não foi possível ativar", e.message);
    }
  }
  return (
    <Page>
      <ScrollView>
        <Heading sub="Gerencie seu acesso e as notificações.">
          Minha conta
        </Heading>
        <Text style={{ color: c.text, marginBottom: 20 }}>{email}</Text>
        <Action title="Ativar notificações push" onPress={enablePush} />
        <Action
          secondary
          title="Sair da conta"
          onPress={() => supabase.auth.signOut()}
        />
      </ScrollView>
    </Page>
  );
}
