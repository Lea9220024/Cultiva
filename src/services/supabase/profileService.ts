import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import { UserProfile } from "../../types";

/**
 * ============================================================================
 * CULTIVA 3.0 — Profile Service
 * ============================================================================
 * Handles CRUD operations for public.profiles and avatar storage.
 * Completely decoupled from React components.
 */

export const profileService = {
  /**
   * Retrieves user profile by Supabase Auth UID
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured()) return null;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        // If profile doesn't exist yet, it's not a fatal error
        if (error.code === "PGRST116") {
          return null;
        }
        console.warn("[ProfileService] Error fetching profile:", error.message);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        displayName: data.display_name,
        avatarUrl: data.avatar_url,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (err: any) {
      console.warn("[ProfileService] Exception in getProfile:", err.message);
      return null;
    }
  },

  /**
   * Creates or updates a user profile record in public.profiles
   */
  async upsertProfile(profile: Partial<UserProfile> & { id: string }): Promise<UserProfile | null> {
    if (!isSupabaseConfigured()) return null;

    try {
      const payload: Record<string, any> = {
        id: profile.id,
        updated_at: new Date().toISOString(),
      };

      if (profile.displayName !== undefined) {
        payload.display_name = profile.displayName;
      }
      if (profile.avatarUrl !== undefined) {
        payload.avatar_url = profile.avatarUrl;
      }

      const { data, error } = await supabase
        .from("profiles")
        .upsert(payload, { onConflict: "id" })
        .select()
        .single();

      if (error) {
        console.error("[ProfileService] Error upserting profile:", error.message);
        throw new Error(error.message);
      }

      return {
        id: data.id,
        displayName: data.display_name,
        avatarUrl: data.avatar_url,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (err: any) {
      console.error("[ProfileService] Exception in upsertProfile:", err.message);
      throw err;
    }
  },

  /**
   * Uploads an avatar image to Supabase Storage in the 'avatars' or 'crop-media' bucket
   */
  async uploadAvatar(userId: string, file: File): Promise<string | null> {
    if (!isSupabaseConfigured()) return null;

    try {
      const fileExt = file.name.split(".").pop() || "jpg";
      const filePath = `avatars/${userId}/avatar_${Date.now()}.${fileExt}`;

      // Upload to crop-media bucket (folder isolation by user_id)
      const { error: uploadError } = await supabase.storage
        .from("crop-media")
        .upload(filePath, file, {
          upsert: true,
          cacheControl: "3600",
        });

      if (uploadError) {
        console.error("[ProfileService] Avatar upload error:", uploadError.message);
        throw new Error(uploadError.message);
      }

      // Create signed URL (valid for 1 year) or retrieve storage path
      const { data: signedData, error: signError } = await supabase.storage
        .from("crop-media")
        .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year

      const avatarUrl = signError || !signedData ? filePath : signedData.signedUrl;

      // Update profile with new avatar URL
      await this.upsertProfile({
        id: userId,
        avatarUrl,
      });

      return avatarUrl;
    } catch (err: any) {
      console.error("[ProfileService] Exception in uploadAvatar:", err.message);
      throw err;
    }
  },

  /**
   * Updates user password
   */
  async updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Supabase no está configurado." };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Error al actualizar contraseña" };
    }
  },
};