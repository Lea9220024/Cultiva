import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { profileService } from "../services/supabase/profileService";
import { UserProfile } from "../types";
import { inspectLocalData } from "../services/migration/localDataInspector";
import { getMigrationStatus } from "../services/migration/migrationService";
import type { LocalDataSummary } from "../types/migration";

export type AuthModalMode = "login" | "register" | "forgot";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isConfigured: boolean;
  isAuthModalOpen: boolean;
  authModalMode: AuthModalMode;
  setIsAuthModalOpen: (open: boolean, mode?: AuthModalMode) => void;
  setAuthModalMode: (mode: AuthModalMode) => void;
  signUp: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile | null>;
  uploadAvatar: (file: File) => Promise<string | null>;
  refreshSession: () => Promise<void>;
  // Phase 4: Migration
  isMigrationPromptOpen: boolean;
  localDataSummary: LocalDataSummary | null;
  dismissMigrationPrompt: () => void;
  openMigrationPrompt: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Translates Supabase auth error messages to clear, friendly Spanish
 */
export function translateAuthError(error: any): string {
  if (!error) return "Ocurrió un error inesperado.";
  const msg = typeof error === "string" ? error : error.message || "";

  if (msg.includes("Invalid login credentials") || msg.includes("invalid_credentials")) {
    return "El email o la contraseña son incorrectos.";
  }
  if (msg.includes("User already registered") || msg.includes("user_already_exists")) {
    return "Ya existe una cuenta registrada con este correo electrónico.";
  }
  if (msg.includes("Password should be at least")) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }
  if (msg.includes("Email rate limit exceeded")) {
    return "Demasiados intentos. Por favor esperá unos minutos antes de volver a intentar.";
  }
  if (msg.includes("Email not confirmed")) {
    return "Por favor confirmá tu correo electrónico antes de ingresar.";
  }
  if (msg.includes("Invalid email") || msg.includes("Unable to validate email address")) {
    return "El formato de correo electrónico no es válido.";
  }
  if (msg.includes("Network request failed") || msg.includes("Failed to fetch")) {
    return "Error de conexión. Verificá tu acceso a internet.";
  }

  return msg || "No se pudo procesar la solicitud de autenticación.";
}

const MIGRATION_DISMISSED_KEY = "cultiva_migration_dismissed_v1";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpenState] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>("login");

  // Phase 4: Migration detection state
  const [isMigrationPromptOpen, setIsMigrationPromptOpen] = useState(false);
  const [localDataSummary, setLocalDataSummary] = useState<LocalDataSummary | null>(null);

  const isConfigured = isSupabaseConfigured();

  const setIsAuthModalOpen = (open: boolean, mode?: AuthModalMode) => {
    if (mode) setAuthModalMode(mode);
    setIsAuthModalOpenState(open);
  };

  /**
   * Phase 4: After a user authenticates, detect local data and prompt migration.
   * NEVER starts migration automatically. NEVER modifies localStorage.
   */
  const checkForLocalDataMigration = (authUser: User) => {
    try {
      const migrationStatus = getMigrationStatus();
      // Don't prompt if already completed, in progress, or user dismissed
      if (migrationStatus === "completed" || migrationStatus === "in_progress") return;

      const dismissed = localStorage.getItem(MIGRATION_DISMISSED_KEY);
      if (dismissed === authUser.id) return;

      const summary = inspectLocalData();
      if (summary.hasData && summary.totalRecords > 0) {
        setLocalDataSummary(summary);
        // Small delay so the auth modal closes first
        setTimeout(() => setIsMigrationPromptOpen(true), 800);
      }
    } catch (err) {
      console.warn("[AuthContext] Migration check error:", err);
    }
  };

  const dismissMigrationPrompt = () => {
    setIsMigrationPromptOpen(false);
    if (user) {
      // Remember the dismissal for this user so we don't nag on every login.
      // We do NOT remove local data. This is purely UI state.
      localStorage.setItem(MIGRATION_DISMISSED_KEY, user.id);
    }
  };

  const openMigrationPrompt = () => {
    const summary = inspectLocalData();
    setLocalDataSummary(summary);
    setIsMigrationPromptOpen(true);
  };

  // Helper to load profile data safely
  const loadProfile = async (userId: string, authUser?: User) => {
    try {
      const p = await profileService.getProfile(userId);
      if (p) {
        setProfile(p);
      } else {
        // Create initial fallback profile from auth metadata
        const fallbackName = authUser?.user_metadata?.display_name || authUser?.email?.split("@")[0] || "Cultivador";
        const newProfile = await profileService.upsertProfile({
          id: userId,
          displayName: fallbackName,
          avatarUrl: authUser?.user_metadata?.avatar_url,
        });
        setProfile(newProfile || { id: userId, displayName: fallbackName });
      }
    } catch (err) {
      console.warn("[AuthContext] Failed to load profile:", err);
    }
  };

  // Bootstrap session on initialization
  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function initSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn("[AuthContext] getSession error:", error.message);
        }
        if (isMounted) {
          const currentSession = data?.session || null;
          setSession(currentSession);
          setUser(currentSession?.user || null);

          if (currentSession?.user) {
            await loadProfile(currentSession.user.id, currentSession.user);
            // Phase 4: Check for local data to migrate
            checkForLocalDataMigration(currentSession.user);
          }
        }
      } catch (err) {
        console.warn("[AuthContext] Session init error:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initSession();

    // Listen to real-time auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;
        setSession(newSession);
        setUser(newSession?.user || null);

        if (newSession?.user) {
          await loadProfile(newSession.user.id, newSession.user);
          // Phase 4: Only prompt on explicit sign-in events, not on token refresh
          if (event === "SIGNED_IN") {
            checkForLocalDataMigration(newSession.user);
          }
        } else {
          setProfile(null);
          setIsMigrationPromptOpen(false);
        }
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [isConfigured]);

  const signUp = async (email: string, password: string, displayName: string) => {
    if (!isConfigured) {
      return { success: false, error: "Supabase Cloud no está configurado en las variables de entorno." };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: displayName.trim() || "Cultivador",
          },
        },
      });

      if (error) {
        return { success: false, error: translateAuthError(error) };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        await profileService.upsertProfile({
          id: data.user.id,
          displayName: displayName.trim() || "Cultivador",
        });
        await loadProfile(data.user.id, data.user);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: translateAuthError(err) };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isConfigured) {
      return { success: false, error: "Supabase Cloud no está configurado en las variables de entorno." };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { success: false, error: translateAuthError(error) };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        await loadProfile(data.user.id, data.user);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: translateAuthError(err) };
    }
  };

  const signOut = async () => {
    if (!isConfigured) {
      setUser(null);
      setSession(null);
      setProfile(null);
      return;
    }

    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsMigrationPromptOpen(false);
    } catch (err) {
      console.warn("[AuthContext] signOut error:", err);
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsMigrationPromptOpen(false);
    }
  };

  const resetPassword = async (email: string) => {
    if (!isConfigured) {
      return { success: false, error: "Supabase Cloud no está configurado." };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });

      if (error) {
        return { success: false, error: translateAuthError(error) };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: translateAuthError(err) };
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<UserProfile | null> => {
    if (!user) return null;

    try {
      const updated = await profileService.upsertProfile({
        id: user.id,
        ...updates,
      });
      if (updated) {
        setProfile(updated);
      }
      return updated;
    } catch (err) {
      console.error("[AuthContext] updateProfile error:", err);
      throw err;
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      const avatarUrl = await profileService.uploadAvatar(user.id, file);
      if (avatarUrl && profile) {
        setProfile({ ...profile, avatarUrl });
      }
      return avatarUrl;
    } catch (err) {
      console.error("[AuthContext] uploadAvatar error:", err);
      throw err;
    }
  };

  const refreshSession = async () => {
    if (!isConfigured) return;
    try {
      const { data } = await supabase.auth.refreshSession();
      setSession(data.session);
      setUser(data.session?.user || null);
      if (data.session?.user) {
        await loadProfile(data.session.user.id, data.session.user);
      }
    } catch (err) {
      console.warn("[AuthContext] refreshSession error:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isAuthenticated: Boolean(user && session),
        isConfigured,
        isAuthModalOpen,
        authModalMode,
        setIsAuthModalOpen,
        setAuthModalMode,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updateProfile,
        uploadAvatar,
        refreshSession,
        // Phase 4: Migration
        isMigrationPromptOpen,
        localDataSummary,
        dismissMigrationPrompt,
        openMigrationPrompt,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
