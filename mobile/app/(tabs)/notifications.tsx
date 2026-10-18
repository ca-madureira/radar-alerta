import React, { useCallback, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Alert,
  Linking,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { api, Notification } from "../../lib/api";
import { Page, Heading, Action, s } from "../../components/ui";
import { colors as c } from "../../lib/theme";
export default function Notifications() {
  const [items, setItems] = useState<Notification[]>([]),
    [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  const load = async () => {
    setLoading(true);
    try {
      setItems(await api("/notifications"));
      setError("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );
  const feedback = async (id: string, useful: boolean) => {
    try {
      await api("/feedback", {
        method: "POST",
        body: JSON.stringify({ notificationId: id, useful }),
      });
      Alert.alert("Obrigado!", "Seu feedback foi registrado.");
    } catch (e: any) {
      Alert.alert("Erro", e.message);
    }
  };
  return (
    <Page>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} />
        }
      >
        <Heading sub="Novidades encontradas nas suas fontes.">
          Notificações
        </Heading>
        {!!error && <Text style={{ color: c.danger }}>{error}</Text>}
        {items.length === 0 && (
          <Text style={{ color: c.muted }}>Ainda não há notificações.</Text>
        )}
        {items.map((n) => (
          <View key={n.id} style={s.card}>
            <Text style={{ color: c.text, fontWeight: "800", fontSize: 17 }}>
              {n.detection?.title || "Nova oportunidade"}
            </Text>
            <Text
              style={{ color: c.muted, marginVertical: 10 }}
              numberOfLines={4}
            >
              {n.detection?.snippet}
            </Text>
            <Text style={{ color: c.muted, fontSize: 12 }}>
              Tipo:{" "}
              {n.detection?.eventType === "UPDATED"
                ? "Atualização"
                : "Nova publicação"}{" "}
              · Detectado: {new Date(n.createdAt).toLocaleString("pt-BR")}
            </Text>
            <Text style={{ color: c.muted, fontSize: 12, marginTop: 4 }}>
              Publicado:{" "}
              {n.detection?.publishedAt
                ? new Date(n.detection.publishedAt).toLocaleDateString("pt-BR")
                : "Não identificado"}
            </Text>
            <Text style={{ color: c.muted, fontSize: 12, marginTop: 4 }}>
              Atualizado na origem:{" "}
              {n.detection?.sourceUpdatedAt
                ? new Date(n.detection.sourceUpdatedAt).toLocaleDateString(
                    "pt-BR",
                  )
                : "Não identificado"}
            </Text>
            <Action
              title="Abrir publicação original ↗"
              onPress={() => {
                const u = n.detection?.url;
                if (u && /^https?:\/\//.test(u)) Linking.openURL(u);
              }}
            />
            <Action
              secondary
              title="Esse alerta foi útil"
              onPress={() => feedback(n.id, true)}
            />
            <Action
              secondary
              title="Não foi útil"
              onPress={() => feedback(n.id, false)}
            />
          </View>
        ))}
      </ScrollView>
    </Page>
  );
}
