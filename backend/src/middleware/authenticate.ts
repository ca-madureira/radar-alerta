import { createClient } from "@supabase/supabase-js";
const url = process.env.SUPABASE_URL!;
const anon = process.env.SUPABASE_ANON_KEY!;
export async function authenticate(header?: string): Promise<string> {
  const token = header?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) throw Object.assign(new Error("Token ausente"), { status: 401 });
  const client = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user)
    throw Object.assign(new Error("Token inválido"), { status: 401 });
  return data.user.id;
}
