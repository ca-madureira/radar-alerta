import React, { useEffect } from "react";
import { ActivityIndicator, View, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "../../lib/supabase";
export default function Callback() {
  const p = useLocalSearchParams<{
    token_hash?: string;
    type?: string;
    code?: string;
  }>();
  useEffect(() => {
    (async () => {
      try {
        if (p.token_hash) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: p.token_hash,
            type: "recovery",
          });
          if (error) throw error;
          router.replace("/reset-password");
          return;
        }
        if (p.code) {
          const { error } = await supabase.auth.exchangeCodeForSession(p.code);
          if (error) throw error;
          router.replace("/reset-password");
          return;
        }
        throw new Error("Link de recuperação inválido");
      } catch (e: any) {
        Alert.alert("Erro", e.message);
        router.replace("/auth");
      }
    })();
  }, [p.token_hash, p.code]);
  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <ActivityIndicator />
    </View>
  );
}
