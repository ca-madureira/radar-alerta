import { supabase } from "./supabase";
const base = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");
export async function api<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Faça login para continuar");
  if (!base) throw new Error("Configure EXPO_PUBLIC_API_URL");
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      ...options.headers,
    },
  });
  const text = await response.text();
  let result: any;
  try {
    result = JSON.parse(text);
  } catch {
    result = { error: text };
  }
  if (!response.ok) throw new Error(result.error || `Erro ${response.status}`);
  return result as T;
}
export type Monitor = {
  id: string;
  name: string;
  status: string;
  keywords: string[];
  excludeKeywords: string[];
  matchMode: string;
  sources: {
    id: string;
    url: string;
    checkedAt?: string;
    lastError?: string;
  }[];
};
export type Notification = {
  id: string;
  status: string;
  createdAt: string;
  detection: {
    title: string;
    snippet: string;
    url: string;
    createdAt: string;
    publishedAt?: string | null;
    sourceUpdatedAt?: string | null;
    dateConfidence?: string;
    eventType?: string;
  };
};
