import { isSupabaseConfigured, getSupabaseClient } from "../../lib/supabase";

export interface SupabaseHealthStatus {
  isConfigured: boolean;
  isConnected: boolean;
  latencyMs?: number;
  message: string;
}

/**
 * Checks the availability and connectivity to Supabase Cloud without throwing exceptions.
 */
export async function checkSupabaseStatus(): Promise<SupabaseHealthStatus> {
  const isConfigured = isSupabaseConfigured();

  if (!isConfigured) {
    return {
      isConfigured: false,
      isConnected: false,
      message: "Supabase no está configurado. Operando en modo local (localStorage).",
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      isConfigured: false,
      isConnected: false,
      message: "Cliente Supabase no inicializado.",
    };
  }

  try {
    const startTime = performance.now();
    // Lightweight auth session check to test connectivity
    const { error } = await client.auth.getSession();
    const latencyMs = Math.round(performance.now() - startTime);

    if (error) {
      return {
        isConfigured: true,
        isConnected: false,
        latencyMs,
        message: "Error de conexión con Supabase: " + error.message,
      };
    }

    return {
      isConfigured: true,
      isConnected: true,
      latencyMs,
      message: "Conexión exitosa con Supabase Cloud (" + latencyMs + "ms).",
    };
  } catch (err: any) {
    return {
      isConfigured: true,
      isConnected: false,
      message: "Excepción al conectar con Supabase: " + (err.message || "Error desconocido"),
    };
  }
}