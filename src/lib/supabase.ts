import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

// --- Singleton Supabase Client (important for Next.js dev) ---
declare global {
  // eslint-disable-next-line no-var
  var __supabase__: ReturnType<typeof createClient<Database>> | undefined;
}

export const supabase =
  globalThis.__supabase__ ??
  createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,      // simpan session di browser
      autoRefreshToken: true,    // ✅ aktifkan auto refresh token
      detectSessionInUrl: true,  // ✅ WAJIB untuk email verification & reset password
    },
  });

// Simpan instance di global (DEV only)
if (process.env.NODE_ENV !== "production") {
  globalThis.__supabase__ = supabase;
}
