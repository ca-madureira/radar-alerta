import React, { useCallback, useState } from "react";
import { ScrollView, Text, View, RefreshControl } from "react-native";
import { useFocusEffect, router } from "expo-router";
import { api } from "../../lib/api";
import { Page, Heading, Action, s } from "../../components/ui";
import { colors as c } from "../../lib/theme";
export default function Home() {
  const [plan, setPlan] = useState<any>(null),
    [impact, setImpact] = useState<any>(null),
    [error, setError] = useState("");
  const load = async () => {
    try {
      setError("");
      const [p, i] = await Promise.all([api("/me/plan"), api("/me/impact")]);
      setPlan(p);
      setImpact(i);
    } catch (e: any) {
      setError(e.message);
    }
  };
  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );
  return (
    <Page>
      <ScrollView
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}
      >
        <Heading sub="Acompanhe oportunidades sem pesquisar todos os dias.">
          Seu radar
        </Heading>
        <View style={s.card}>
          <Text style={{ color: c.muted }}>Plano atual</Text>
          <Text style={{ fontSize: 25, color: c.primary, fontWeight: "800" }}>
            {plan?.name || plan?.id || "Carregando..."}
          </Text>
          <Text style={{ color: c.muted }}>
            Até {plan?.maxMonitors ?? "—"} monitoramentos • Verificação a cada{" "}
            {plan?.intervalMinutes ?? "—"} min
          </Text>
        </View>
        <View style={s.card}>
          <Text style={{ color: c.muted }}>Alertas úteis confirmados</Text>
          <Text style={{ color: c.text, fontSize: 32, fontWeight: "900" }}>
            {impact?.helpfulAlerts ?? 0}
          </Text>
          <Text style={{ color: c.muted }}>
            Economia informada: R${" "}
            {Number(impact?.reportedSavings || 0).toFixed(2)}
          </Text>
        </View>
        {!!error && <Text style={{ color: c.danger }}>{error}</Text>}
        <Action
          title="+ Criar monitoramento"
          onPress={() => router.push("/monitor/new")}
        />
        <Action
          secondary
          title="Ver notificações"
          onPress={() => router.push("/(tabs)/notifications")}
        />
      </ScrollView>
    </Page>
  );
}
