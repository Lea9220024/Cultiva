/// <reference types="vite/client" />
import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * ============================================================================
 * CULTIVA 3.0 — Supabase Client Configuration
 * ============================================================================
 * Centralized Supabase client for Cultiva.
 * Reads public URL and Anon Key from Vite environment variables:
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_ANON_KEY
 *
 * Designed with safe fallback:
 * If credentials are not provided or invalid, the client does NOT crash the app,
 * allowing Cultiva to run seamlessly in 100% offline / localStorage mode.
 */

const supabaseUrl: string | undefined = typeof import.meta !== "undefined" && import.meta.env
  ? (import.meta.env.VITE_SUPABASE_URL as string | undefined)
  : undefined;

const supabaseAnonKey: string | undefined = typeof import.meta !== "undefined" && import.meta.env
  ? (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)
  : undefined;

/**
 * Checks if Supabase credentials are configured in the active environment.
 */
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

// Fallback placeholder URL/Key to avoid initialization exceptions when unconfigured
const fallbackUrl = "https://placeholder-cultiva-project.supabase.co";
const fallbackKey = "placeholder-anon-key";

/**
 * Singleton Supabase client instance
 */
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

/**
 * Safe accessor for Supabase client that returns null if not configured
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  return supabase;
}