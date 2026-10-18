import React, { useCallback, useState } from "react";
import { ScrollView, Text, View, Alert, RefreshControl } from "react-native";
import { useFocusEffect, router } from "expo-router";
import { api, Monitor } from "../../lib/api";
import { Page, Heading, Action, s } from "../../components/ui";
import { colors as c } from "../../lib/theme";
export default function Monitors() {
  const [items, setItems] = useState<Monitor[]>([]),
    [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  const load = async () => {
    setLoading(true);
    try {
      setItems(await api("/monitors"));
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
  const toggle = async (m: Monitor) => {
    try {
      await api("/monitors/" + m.id, {
        method: "PATCH",
        body: JSON.stringify({
          status: m.status === "ACTIVE" ? "PAUSED" : "ACTIVE",
        }),
      });
      load();
    } catch (e: any) {
      Alert.alert("Erro", e.message);
    }
  };
  const remove = (m: Monitor) =>
    Alert.alert("Excluir?", m.name, [
      { text: "Cancelar" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await api("/monitors/" + m.id, { method: "DELETE" });
            load();
          } catch (e: any) {
            Alert.alert("Erro", e.message);
          }
        },
      },
    ]);
  return (
    <Page>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} />
        }
      >
        <Heading sub="Gerencie seus termos e fontes monitoradas.">
          Monitoramentos
        </Heading>
        <Action
          title="+ Novo alerta"
          onPress={() => router.push("/monitor/new")}
        />
        {!!error && <Text style={{ color: c.danger }}>{error}</Text>}
        {items.length === 0 && (
          <Text style={{ color: c.muted, marginTop: 20 }}>
            Nenhum monitoramento cadastrado.
          </Text>
        )}
        {items.map((m) => (
          <View key={m.id} style={s.card}>
            <Text style={{ color: c.text, fontSize: 18, fontWeight: "800" }}>
              {m.name}
            </Text>
            <Text
              style={{
                color: m.status === "ACTIVE" ? c.primary : c.muted,
                marginTop: 6,
              }}
            >
              {m.status === "ACTIVE" ? "● Ativo" : "○ Pausado"}
            </Text>
            <Text style={{ color: c.muted, marginVertical: 8 }}>
              Termos: {m.keywords.join(", ")}
            </Text>
            <Text style={{ color: c.muted }}>{m.sources.length} fonte(s)</Text>
            <Action
              secondary
              title={m.status === "ACTIVE" ? "Pausar" : "Ativar"}
              onPress={() => toggle(m)}
            />
            <Action secondary title="Excluir" onPress={() => remove(m)} />
          </View>
        ))}
      </ScrollView>
    </Page>
  );
}
