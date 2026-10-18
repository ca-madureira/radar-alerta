import React, { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { supabase } from "../lib/supabase";
import { router } from "expo-router";
import { Page, Heading, Field, Action } from "../components/ui";
import { colors } from "../lib/theme";
export default function Auth() {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [register, setRegister] = useState(false),
    [busy, setBusy] = useState(false);
  async function submit() {
    try {
      setBusy(true);
      const r = register
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });
      if (r.error) throw r.error;
      if (register)
        Alert.alert(
          "Cadastro realizado",
          "Confira seu e-mail caso a confirmação esteja ativada.",
        );
    } catch (e: any) {
      Alert.alert("Erro", e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      >
        <Text
          style={{
            color: colors.primary,
            fontSize: 20,
            fontWeight: "900",
            marginBottom: 12,
          }}
        >
          ◉ RADAR
        </Text>
        <Heading sub="Suas oportunidades, no momento certo.">
          {register ? "Criar conta" : "Bem-vindo de volta"}
        </Heading>
        <Field
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Field
          label="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Action
          title={busy ? "Aguarde..." : register ? "Cadastrar" : "Entrar"}
          disabled={busy}
          onPress={submit}
        />
        <Action
          secondary
          title="Esqueci minha senha"
          onPress={() => router.push("/forgot-password")}
        />
        <Action
          secondary
          title={register ? "Já tenho uma conta" : "Criar minha conta"}
          onPress={() => setRegister(!register)}
        />
      </ScrollView>
    </Page>
  );
}
