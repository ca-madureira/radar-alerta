import React, { useEffect, useState } from "react";
import { Stack, router, useSegments } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { colors } from "../lib/theme";
export default function Layout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (loading) return;
    const inAuth =
      segments[0] === "auth" ||
      segments[0] === "forgot-password" ||
      segments[0] === "reset-password";
    if (!session && !inAuth) router.replace("/auth");
    else if (session && segments[0] === "auth" && segments.length === 1)
      router.replace("/(tabs)");
  }, [session, loading, segments]);
  if (loading)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    />
  );
}
