import React from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { colors as c } from "../lib/theme";
export function Page({ children }: { children: React.ReactNode }) {
  return <View style={s.page}>{children}</View>;
}
export function Heading({ children, sub }: { children: string; sub?: string }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={s.heading}>{children}</Text>
      {sub && <Text style={s.muted}>{sub}</Text>}
    </View>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput placeholderTextColor={c.muted} style={s.input} {...props} />
    </View>
  );
}
export function Action({
  title,
  onPress,
  secondary,
  disabled,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        s.button,
        secondary && {
          backgroundColor: c.card,
          borderWidth: 1,
          borderColor: c.line,
        },
        disabled && { opacity: 0.5 },
      ]}
    >
      <Text
        style={{
          color: secondary ? c.text : c.bg,
          fontWeight: "800",
          textAlign: "center",
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
export const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: c.bg, padding: 20 },
  heading: { color: c.text, fontSize: 29, fontWeight: "800", marginBottom: 6 },
  muted: { color: c.muted, lineHeight: 21 },
  label: { color: c.text, marginBottom: 7, fontWeight: "600" },
  input: {
    backgroundColor: c.card,
    color: c.text,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
  },
  button: {
    backgroundColor: c.primary,
    padding: 16,
    borderRadius: 12,
    marginVertical: 6,
  },
  card: {
    backgroundColor: c.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.line,
    padding: 16,
    marginBottom: 12,
  },
});
