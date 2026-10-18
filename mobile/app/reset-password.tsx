import React, { useState } from "react";
import { Alert, ScrollView } from "react-native";
import { router } from "expo-router";
import { supabase } from "../lib/supabase";
import { Page, Heading, Field, Action } from "../components/ui";
export default function ResetPassword() {
  const [password, setPassword] = useState(""),
    [confirm, setConfirm] = useState(""),
    [busy, setBusy] = useState(false);
  async function save() {
    if (password.length < 8 || password !== confirm)
      return Alert.alert(
        "Verifique a senha",
        "Use pelo menos 8 caracteres e confirme a mesma senha.",
      );
    try {
      setBusy(true);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      Alert.alert("Senha atualizada", "Você já pode acessar sua conta.");
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert("Erro", e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page>
      <ScrollView>
        <Heading sub="Abra esta tela pelo link de recuperação recebido no e-mail.">
          Nova senha
        </Heading>
        <Field
          label="Nova senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Field
          label="Confirmar senha"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
        />
        <Action
          title={busy ? "Salvando..." : "Redefinir senha"}
          disabled={busy}
          onPress={save}
        />
      </ScrollView>
    </Page>
  );
}
