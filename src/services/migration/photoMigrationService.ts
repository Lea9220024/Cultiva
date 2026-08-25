// ============================================================================
// CULTIVA 3.0 — FASE 4: Photo Migration Service
// Converts base64/URL images to Blob and uploads to Supabase Storage.
// NEVER deletes local photos on failure.
// ============================================================================

import { supabase } from '../../lib/supabase';
import { MigrationError } from '../../types/migration';
import type { Foto } from '../../types';

const BATCH_SIZE = 5;

export interface PhotoMigrationResult {
  photoId: string;
  cloudPhotoId: string;
  storagePath: string;
  success: boolean;
  error?: string;
}

/**
 * Converts a base64 data URL or raw base64 string to a Blob.
 */
function base64ToBlob(base64: string, mimeType = 'image/webp'): Blob | null {
  try {
    let base64Data = base64;
    if (base64.includes(',')) {
      const parts = base64.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      if (mimeMatch) mimeType = mimeMatch[1];
      base64Data = parts[1];
    }
    const byteChars = atob(base64Data);
    const byteNumbers = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteNumbers[i] = byteChars.charCodeAt(i);
    }
    return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
  } catch {
    return null;
  }
}

function isBase64(str: string): boolean {
  if (!str) return false;
  return str.startsWith('data:') || (str.length > 100 && !str.startsWith('http'));
}

async function uploadPhotoToStorage(
  userId: string,
  cloudCropId: string,
  foto: Foto,
  blob: Blob
): Promise<{ storagePath: string; publicUrl: string } | null> {
  const ext = blob.type.includes('png') ? 'png' : blob.type.includes('jpg') || blob.type.includes('jpeg') ? 'jpg' : 'webp';
  const storagePath = `crop-media/${userId}/${cloudCropId}/${foto.id}.${ext}`;

  // Check if already exists in storage
  const { data: existingList } = await supabase.storage.from('crop-media').list(`crop-media/${userId}/${cloudCropId}`);
  const alreadyExists = existingList?.some(f => f.name === `${foto.id}.${ext}`);
  if (alreadyExists) {
    const { data: urlData } = supabase.storage.from('crop-media').getPublicUrl(storagePath);
    return { storagePath, publicUrl: urlData?.publicUrl || '' };
  }

  const { error } = await supabase.storage
    .from('crop-media')
    .upload(storagePath, blob, { contentType: blob.type, upsert: false });

  if (error) return null;

  const { data: urlData } = supabase.storage.from('crop-media').getPublicUrl(storagePath);
  return { storagePath, publicUrl: urlData?.publicUrl || '' };
}

export async function migratePhotos(
  userId: string,
  fotos: Foto[],
  cropIdMap: Record<string, string>,
  plantIdMap: Record<string, string>,
  onProgress?: (done: number, total: number, errors: MigrationError[]) => void
): Promise<{ results: PhotoMigrationResult[]; errors: MigrationError[] }> {
  const results: PhotoMigrationResult[] = [];
  const errors: MigrationError[] = [];

  // Process in batches
  for (let i = 0; i < fotos.length; i += BATCH_SIZE) {
    const batch = fotos.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (foto) => {
        try {
          const cloudCropId = cropIdMap[foto.cultivoId];
          if (!cloudCropId) {
            errors.push({ entity: 'photos', localId: foto.id, message: `Cultivo ${foto.cultivoId} no encontrado en el mapa de IDs` });
            return;
          }

          let blob: Blob | null = null;
          if (isBase64(foto.image)) {
            blob = base64ToBlob(foto.image);
          } else if (foto.image.startsWith('http')) {
            // External URL — skip storage upload, just record the URL
            const { data: inserted, error: dbErr } = await supabase
              .from('photos')
              .insert({
                crop_id: cloudCropId,
                plant_id: foto.plantaId ? plantIdMap[foto.plantaId] || null : null,
                user_id: userId,
                date: foto.date,
                crop_day: foto.cropDay,
                stage: foto.stage,
                storage_path: foto.image,
                image_url: foto.image,
                notes: foto.notes || null,
                tags: foto.tags || [],
              })
              .select('id')
              .single();

            if (dbErr) {
              errors.push({ entity: 'photos', localId: foto.id, message: dbErr.message });
            } else if (inserted) {
              results.push({ photoId: foto.id, cloudPhotoId: inserted.id, storagePath: foto.image, success: true });
            }
            return;
          }

          if (!blob) {
            errors.push({ entity: 'photos', localId: foto.id, message: 'No se pudo convertir la imagen a Blob' });
            return;
          }

          const uploadResult = await uploadPhotoToStorage(userId, cloudCropId, foto, blob);
          if (!uploadResult) {
            errors.push({ entity: 'photos', localId: foto.id, message: 'Error al subir la imagen a Supabase Storage' });
            return;
          }

          const cloudPlantId = foto.plantaId ? (plantIdMap[foto.plantaId] || null) : null;

          const { data: inserted, error: dbErr } = await supabase
            .from('photos')
            .insert({
              crop_id: cloudCropId,
              plant_id: cloudPlantId,
              user_id: userId,
              date: foto.date,
              crop_day: foto.cropDay,
              stage: foto.stage,
              storage_path: uploadResult.storagePath,
              image_url: uploadResult.publicUrl,
              notes: foto.notes || null,
              tags: foto.tags || [],
            })
            .select('id')
            .single();

          if (dbErr) {
            errors.push({ entity: 'photos', localId: foto.id, message: dbErr.message });
          } else if (inserted) {
            results.push({
              photoId: foto.id,
              cloudPhotoId: inserted.id,
              storagePath: uploadResult.storagePath,
              success: true,
            });
          }
        } catch (err: any) {
          errors.push({ entity: 'photos', localId: foto.id, message: err?.message || 'Error desconocido' });
        }
      })
    );

    onProgress?.(Math.min(i + BATCH_SIZE, fotos.length), fotos.length, errors);
  }

  return { results, errors };
}
