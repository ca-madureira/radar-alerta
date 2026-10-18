import React, { useState, useEffect } from "react";
import { ScrollView, Text, Alert, Pressable, View } from "react-native";
import { router } from "expo-router";
import { api } from "../../lib/api";
import { Page, Heading, Field, Action } from "../../components/ui";
import { colors as c } from "../../lib/theme";
import { postgraduatePresets } from "../../lib/monitor-presets";
export default function NewMonitor() {
  const [catalog, setCatalog] = useState<
      { id: string; name: string; category: string }[]
    >([]),
    [selected, setSelected] = useState<string[]>([]),
    [webSearchAvailable, setWebSearchAvailable] = useState(false);
  useEffect(() => {
    api("/catalog")
      .then(setCatalog)
      .catch(() => {});
    api<{ capabilities?: { webSearch?: boolean } }>("/health")
      .then((health) => setWebSearchAvailable(Boolean(health.capabilities?.webSearch)))
      .catch(() => {});
  }, []);
  const [name, setName] = useState(""),
    [keywords, setKeywords] = useState(""),
    [exclude, setExclude] = useState(""),
    [urls, setUrls] = useState(""),
    [all, setAll] = useState(false),
    [busy, setBusy] = useState(false),
    [searchWeb, setSearchWeb] = useState(false),
    [period, setPeriod] = useState(0),
    [basis, setBasis] = useState<"PUBLISHED" | "UPDATED" | "DISCOVERED">(
      "DISCOVERED",
    ),
    [notifyUpdates, setNotifyUpdates] = useState(true),
    [requireDate, setRequireDate] = useState(true);
  const split = (v: string) =>
    v
      .split(/[\n,]/)
      .map((x) => x.trim())
      .filter(Boolean);
  async function save() {
    try {
      setBusy(true);
      await api("/monitors", {
        method: "POST",
        body: JSON.stringify({
          name,
          keywords: split(keywords),
          excludeKeywords: split(exclude),
          urls: split(urls),
          catalogIds: selected,
          searchWeb,
          temporal: {
            dateBasis: basis,
            lookbackDays: period,
            since: null,
            onlyNew: true,
            notifyUpdates,
            requireVerifiedDate: requireDate,
          },
          matchMode: all ? "ALL" : "ANY",
        }),
      });
      Alert.alert("Pronto", "Monitoramento cadastrado");
      router.replace("/(tabs)/monitors");
    } catch (e: any) {
      Alert.alert("Não foi possível salvar", e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page>
      <ScrollView>
        <Heading sub="Cadastre URLs públicas e palavras-chave.">
          Novo monitoramento
        </Heading>
        <Text style={{ color: c.muted, marginBottom: 8 }}>
          Exemplos de pós-graduação: acompanhe novas publicações e retificações.
          Confira no edital prazos, taxa de inscrição e encontros presenciais.
          A primeira coleta cria uma referência e não envia alertas antigos.
        </Text>
        {postgraduatePresets.map((preset) => (
          <Action key={preset.name} secondary title={preset.name} onPress={() => {
            setName(preset.name);
            setUrls(preset.url);
            setKeywords(preset.keywords);
            setExclude("");
            setSelected([]);
            setSearchWeb(false);
            setAll(false);
            setBasis("DISCOVERED");
            setPeriod(0);
            setNotifyUpdates(true);
            setRequireDate(true);
          }} />
        ))}
        <Field
          label="Nome"
          value={name}
          onChangeText={setName}
          placeholder="Ex.: Mestrado USP"
        />
        <Field
          label="Palavras-chave (separe por vírgulas)"
          value={keywords}
          onChangeText={setKeywords}
          multiline
          placeholder="inscrições abertas, edital, mestrado"
        />
        <Field
          label="Ignorar termos (opcional)"
          value={exclude}
          onChangeText={setExclude}
          placeholder="resultado final, encerradas"
        />
        <Field
          label="URLs para verificar (uma por linha)"
          value={urls}
          onChangeText={setUrls}
          multiline
          numberOfLines={4}
          autoCapitalize="none"
          placeholder="https://www.exemplo.edu.br/editais"
        />
        <Text style={{ color: c.text, fontWeight: "800", marginVertical: 10 }}>
          Ou escolha fontes públicas cadastradas
        </Text>
        {catalog.length === 0 && (
          <Text style={{ color: c.muted, marginBottom: 10 }}>
            Nenhuma fonte disponível no catálogo. Informe uma URL acima.
          </Text>
        )}
        {catalog.map((item) => (
          <Pressable
            key={item.id}
            onPress={() =>
              setSelected((v) =>
                v.includes(item.id)
                  ? v.filter((x) => x !== item.id)
                  : [...v, item.id],
              )
            }
            style={{
              padding: 12,
              backgroundColor: c.card,
              marginBottom: 7,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: c.text }}>
              {selected.includes(item.id) ? "☑" : "□"} {item.name} ·{" "}
              {item.category}
            </Text>
          </Pressable>
        ))}
        <Action
          secondary
          disabled={!webSearchAvailable}
          title={
            searchWeb
              ? "☑ Busca ampla na web ativada"
              : "□ Ativar busca ampla na web"
          }
          onPress={() => {
            if (!searchWeb && (urls.trim() || selected.length)) {
              Alert.alert("Escolha um modo", "Para busca web, remova as URLs e fontes. Você pode criar outro monitoramento para elas.");
              return;
            }
            setSearchWeb(!searchWeb);
          }}
        />
        {!webSearchAvailable && <Text style={{ color: c.muted, marginBottom: 8 }}>
          A busca ampla está indisponível. Monitorar URLs e fontes do catálogo funciona sem chave de busca.
        </Text>}
        <Text
          style={{
            color: c.text,
            fontWeight: "800",
            marginTop: 16,
            marginBottom: 8,
          }}
        >
          Novidades e datas
        </Text>
        <Text style={{ color: c.muted, marginBottom: 8 }}>
          Buscar publicações dos últimos{" "}
          {period === 0 ? "qualquer período" : period + " dias"}. Datas sem
          comprovação podem ser ignoradas.
        </Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 7,
            marginBottom: 12,
          }}
        >
          {[1, 7, 30, 90, 0].map((days) => (
            <Pressable
              key={days}
              onPress={() => setPeriod(days)}
              style={{
                padding: 10,
                borderRadius: 10,
                backgroundColor: period === days ? c.primary : c.card,
              }}
            >
              <Text style={{ color: period === days ? "#07110b" : c.text }}>
                {days === 0 ? "Todos" : days + "d"}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={{ color: c.muted, marginBottom: 8 }}>
          Qual data considerar?
        </Text>
        {(
          [
            ["PUBLISHED", "Publicação original"],
            ["UPDATED", "Última atualização"],
            ["DISCOVERED", "Primeira descoberta (não comprova publicação)"],
          ] as const
        ).map(([value, label]) => (
          <Pressable
            key={value}
            onPress={() => setBasis(value)}
            style={{
              padding: 11,
              backgroundColor: c.card,
              marginBottom: 6,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: c.text }}>
              {basis === value ? "◉" : "○"} {label}
            </Text>
          </Pressable>
        ))}
        <Action
          secondary
          title={
            notifyUpdates
              ? "☑ Avisar atualizações importantes"
              : "□ Avisar atualizações importantes"
          }
          onPress={() => setNotifyUpdates(!notifyUpdates)}
        />
        <Action
          secondary
          title={
            requireDate
              ? "☑ Exigir data verificável"
              : "□ Permitir resultados sem data comprovada"
          }
          onPress={() => setRequireDate(!requireDate)}
        />
        <Text style={{ color: c.muted, marginBottom: 10 }}>
          Modo de busca: {all ? "TODOS os termos" : "QUALQUER termo"}
        </Text>
        <Action
          secondary
          title="Alternar modo de correspondência"
          onPress={() => setAll(!all)}
        />
        <Action
          title={busy ? "Salvando..." : "Salvar monitoramento"}
          disabled={busy}
          onPress={save}
        />
        <Action secondary title="Cancelar" onPress={() => router.back()} />
      </ScrollView>
    </Page>
  );
}
