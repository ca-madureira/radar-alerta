import React, { useState } from "react";
import { Alert, ScrollView } from "react-native";
import { router } from "expo-router";
import { supabase } from "../lib/supabase";
import { Page, Heading, Field, Action } from "../components/ui";
export default function ForgotPassword() {
  const [email, setEmail] = useState(""),
    [busy, setBusy] = useState(false);
  async function send() {
    try {
      setBusy(true);
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: "radaralertas://auth/callback" },
      );
      if (error) throw error;
      Alert.alert(
        "Verifique seu e-mail",
        "Se existir uma conta, você receberá instruções para redefinir sua senha.",
      );
      router.back();
    } catch (e: any) {
      Alert.alert("Erro", e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page>
      <ScrollView>
        <Heading sub="Enviaremos um link de recuperação para seu e-mail.">
          Recuperar senha
        </Heading>
        <Field
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Action
          title={busy ? "Enviando..." : "Enviar link"}
          disabled={busy}
          onPress={send}
        />
        <Action title="Voltar" secondary onPress={() => router.back()} />
      </ScrollView>
    </Page>
  );
}
