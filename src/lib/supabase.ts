/// <reference types="vite/client" />
import { createClient, SupabaseClient } from "@supabase/supabase-js";

declare global {
  interface Window {
    __CULTIVA_CONFIG__?: {
      supabaseUrl?: string;
      supabasePublicKey?: string;
    };
  }
}

const runtimeConfig = typeof window !== "undefined" ? window.__CULTIVA_CONFIG__ : undefined;
const env = typeof import.meta !== "undefined" ? import.meta.env : undefined;

const supabaseUrl = runtimeConfig?.supabaseUrl || (env?.VITE_SUPABASE_URL as string | undefined);
const supabaseAnonKey = runtimeConfig?.supabasePublicKey || (env?.VITE_SUPABASE_ANON_KEY as string | undefined);

export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.trim() !== "" &&
    supabaseAnonKey.trim() !== "" &&
    !supabaseUrl.includes("YOUR_SUPABASE_PROJECT_URL") &&
    !supabaseAnonKey.includes("YOUR_SUPABASE_ANON_KEY")
  );
}

const fallbackUrl = "https://placeholder-cultiva-project.supabase.co";
const fallbackKey = "placeholder-key";

export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured() ? supabaseUrl! : fallbackUrl,
  isSupabaseConfigured() ? supabaseAnonKey! : fallbackKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export function getSupabaseClient(): SupabaseClient | null {
  return isSupabaseConfigured() ? supabase : null;
}
