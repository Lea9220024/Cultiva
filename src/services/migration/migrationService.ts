// ============================================================================
// CULTIVA 3.0 — FASE 4: Migration Service (Main Coordinator)
// Orchestrates the full localStorage → Supabase migration.
// localStorage is NEVER cleared or modified.
// ============================================================================

import { supabase } from '../../lib/supabase';
import {
  MigrationResult,
  MigrationError,
  MigrationStatus,
  MigratedCounts,
  MIGRATION_STATUS_KEY,
} from '../../types/migration';
import { getRawLocalData } from './localDataInspector';
import { createBackup, verifyBackup } from './localBackupService';
import { getCloudId, setCloudId, hasBeenMigrated, getFullMap } from './idMappingService';
import { migratePhotos } from './photoMigrationService';
import type {
  Cultivo, Planta, Registro, Tarea, Evento,
  FertilizationLog, UserFertilizer, UserPreferences, UserLearningProgress, Achievement
} from '../../types';

const BATCH_SIZE = 50;

// Concurrency guard
let isMigrating = false;
let cancelRequested = false;

export function requestCancelMigration(): void {
  cancelRequested = true;
}

export function getIsMigrating(): boolean {
  return isMigrating;
}

function saveMigrationStatus(status: MigrationStatus): void {
  localStorage.setItem(MIGRATION_STATUS_KEY, status);
}

export function getMigrationStatus(): MigrationStatus {
  const raw = localStorage.getItem(MIGRATION_STATUS_KEY);
  if (!raw) return 'not_started';
  return raw as MigrationStatus;
}

type ProgressCallback = (step: string, label: string, processed: number, total: number, errors: MigrationError[]) => void;

// ─── Step helpers ──────────────────────────────────────────────────────────────

async function migratePreferences(
  userId: string,
  preferences: UserPreferences | null,
  warnings: string[]
): Promise<boolean> {
  if (!preferences) return false;
  try {
    const { data: existing } = await supabase
      .from('user_preferences')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      warnings.push('Ya existían preferencias en Cloud — no se sobrescribieron.');
      return true;
    }

    const { error } = await supabase.from('user_preferences').upsert({
      user_id: userId,
      theme: preferences.theme ?? 'dark',
      temp_unit: preferences.tempUnit ?? 'C',
      knowledge_level: preferences.knowledgeLevel ?? 'Principiante',
      cultivation_system: preferences.cultivationSystem ?? 'Tierra',
      notifications_enabled: preferences.notificationsEnabled ?? true,
      onboarding_completed: preferences.onboardingCompleted ?? true,
      show_advanced_content: preferences.showAdvancedContent ?? false,
      enable_educational_recommendations: preferences.enableEducationalRecommendations ?? true,
      preferred_sources_only: preferences.preferredSourcesOnly ?? false,
    }, { onConflict: 'user_id' });

    if (error) warnings.push(`Preferencias: ${error.message}`);
    return !error;
  } catch (err: any) {
    warnings.push(`Preferencias: ${err?.message}`);
    return false;
  }
}

async function migrateCultivos(
  userId: string,
  cultivos: Cultivo[],
  errors: MigrationError[],
  onProgress: (n: number) => void
): Promise<number> {
  let count = 0;
  for (const cultivo of cultivos) {
    if (cancelRequested) break;
    if (hasBeenMigrated('crops', cultivo.id)) { count++; onProgress(count); continue; }
    try {
      const { data, error } = await supabase
        .from('crops')
        .insert({
          user_id: userId,
          name: cultivo.name,
          start_date: cultivo.startDate,
          end_date: cultivo.endDate ?? null,
          status: cultivo.status,
          stage: cultivo.stage,
          method: cultivo.method,
          space: cultivo.space ?? null,
          image_url: cultivo.image && !cultivo.image.startsWith('data:') ? cultivo.image : null,
          dates: cultivo.dates ?? {},
          custom_stages: cultivo.customStages ?? [],
          genetic_name: cultivo.geneticName ?? null,
          genetic_type: cultivo.geneticType ?? null,
          genetic_origin: cultivo.geneticOrigin ?? null,
          notes: cultivo.notes ?? null,
          harvest_notes: cultivo.harvestNotes ?? null,
          yield_grams: cultivo.yieldGrams ?? null,
          rating: cultivo.rating ?? null,
        })
        .select('id')
        .single();

      if (error) {
        errors.push({ entity: 'crops', localId: cultivo.id, message: error.message });
      } else if (data) {
        setCloudId('crops', cultivo.id, data.id);
        count++;
      }
    } catch (err: any) {
      errors.push({ entity: 'crops', localId: cultivo.id, message: err?.message ?? 'Error desconocido' });
    }
    onProgress(count);
  }
  return count;
}

async function migratePlantas(
  userId: string,
  plantas: Planta[],
  errors: MigrationError[],
  onProgress: (n: number) => void
): Promise<number> {
  let count = 0;
  for (const planta of plantas) {
    if (cancelRequested) break;
    if (hasBeenMigrated('plants', planta.id)) { count++; onProgress(count); continue; }
    const cloudCropId = getCloudId('crops', planta.cultivoId);
    if (!cloudCropId) {
      errors.push({ entity: 'plants', localId: planta.id, message: `Cultivo ${planta.cultivoId} no migrado aún` });
      onProgress(count);
      continue;
    }
    try {
      const { data, error } = await supabase
        .from('plants')
        .insert({
          crop_id: cloudCropId,
          user_id: userId,
          name: planta.name,
          date_added: planta.dateAdded,
          stage: planta.stage,
          status: planta.status,
          image_url: planta.image && !planta.image.startsWith('data:') ? planta.image : null,
          height_cm: planta.heightCm ?? null,
          pot_size: planta.potSize ?? null,
          notes: planta.notes ?? null,
        })
        .select('id')
        .single();

      if (error) {
        errors.push({ entity: 'plants', localId: planta.id, message: error.message });
      } else if (data) {
        setCloudId('plants', planta.id, data.id);
        count++;
      }
    } catch (err: any) {
      errors.push({ entity: 'plants', localId: planta.id, message: err?.message ?? 'Error desconocido' });
    }
    onProgress(count);
  }
  return count;
}

async function migrateRegistros(
  userId: string,
  registros: Registro[],
  errors: MigrationError[],
  onProgress: (n: number) => void
): Promise<number> {
  let count = 0;
  for (let i = 0; i < registros.length; i += BATCH_SIZE) {
    if (cancelRequested) break;
    const batch = registros.slice(i, i + BATCH_SIZE);
    const rows = batch
      .filter(r => getCloudId('crops', r.cultivoId))
      .map(r => ({
        crop_id: getCloudId('crops', r.cultivoId)!,
        plant_id: r.plantaId ? getCloudId('plants', r.plantaId) ?? null : null,
        user_id: userId,
        date: r.date,
        temperature: r.temperature ?? null,
        humidity: r.humidity ?? null,
        ph: r.ph ?? null,
        ec: r.ec ?? null,
        height_cm: r.heightCm ?? null,
        measurements: r.measurements ?? {},
        watering: r.watering ?? {},
        notes: r.notes ?? null,
        photo_url: r.photoUrl && !r.photoUrl.startsWith('data:') ? r.photoUrl : null,
        images: (r.images ?? []).filter((img: string) => !img.startsWith('data:')),
        tags: r.tags ?? [],
      }));

    if (rows.length > 0) {
      const { error } = await supabase.from('diary_logs').insert(rows);
      if (error) {
        errors.push({ entity: 'diary_logs', message: `Batch ${i}: ${error.message}` });
      } else {
        count += rows.length;
      }
    }
    onProgress(count);
  }
  return count;
}

async function migrateTareas(
  userId: string,
  tareas: Tarea[],
  errors: MigrationError[],
  onProgress: (n: number) => void
): Promise<number> {
  let count = 0;
  for (let i = 0; i < tareas.length; i += BATCH_SIZE) {
    if (cancelRequested) break;
    const batch = tareas.slice(i, i + BATCH_SIZE);
    const rows = batch
      .filter(t => getCloudId('crops', t.cultivoId))
      .map(t => ({
        crop_id: getCloudId('crops', t.cultivoId)!,
        plant_id: t.plantaId ? getCloudId('plants', t.plantaId) ?? null : null,
        user_id: userId,
        title: t.title,
        date: t.date,
        time: t.time ?? null,
        repeat: t.repeat,
        priority: t.priority,
        completed: t.completed,
        completed_at: t.completedAt ?? null,
        notes: t.notes ?? null,
        is_nutrition_task: t.isNutritionTask ?? false,
      }));

    if (rows.length > 0) {
      const { error } = await supabase.from('tasks').insert(rows);
      if (error) {
        errors.push({ entity: 'tasks', message: `Batch ${i}: ${error.message}` });
      } else {
        count += rows.length;
      }
    }
    onProgress(count);
  }
  return count;
}

async function migrateEventos(
  userId: string,
  eventos: Evento[],
  errors: MigrationError[],
  onProgress: (n: number) => void
): Promise<number> {
  let count = 0;
  for (let i = 0; i < eventos.length; i += BATCH_SIZE) {
    if (cancelRequested) break;
    const batch = eventos.slice(i, i + BATCH_SIZE);
    const rows = batch
      .filter(e => getCloudId('crops', e.cultivoId))
      .map(e => ({
        crop_id: getCloudId('crops', e.cultivoId)!,
        plant_id: e.plantaId ? getCloudId('plants', e.plantaId) ?? null : null,
        user_id: userId,
        date: e.date,
        title: e.title,
        description: e.description ?? null,
        type: e.type,
      }));

    if (rows.length > 0) {
      const { error } = await supabase.from('events').insert(rows);
      if (error) {
        errors.push({ entity: 'events', message: `Batch ${i}: ${error.message}` });
      } else {
        count += rows.length;
      }
    }
    onProgress(count);
  }
  return count;
}

async function migrateUserFertilizers(
  userId: string,
  fertilizers: UserFertilizer[],
  errors: MigrationError[],
  onProgress: (n: number) => void
): Promise<number> {
  let count = 0;
  for (const fert of fertilizers) {
    if (cancelRequested) break;
    if (hasBeenMigrated('userFertilizers', fert.id)) { count++; onProgress(count); continue; }
    try {
      const { data, error } = await supabase
        .from('user_fertilizers')
        .insert({
          user_id: userId,
          name: fert.name,
          brand: fert.brand ?? null,
          npk: fert.npk ?? null,
          form: fert.form,
          target_phase: fert.targetPhase,
          nutrients_additional: fert.nutrientsAdditional ?? null,
          manufacturer_dose: fert.manufacturerDose ?? null,
          manufacturer_frequency: fert.manufacturerFrequency ?? null,
          application_method: fert.applicationMethod,
          notes: fert.notes ?? null,
          image_url: fert.image && !fert.image.startsWith('data:') ? fert.image : null,
        })
        .select('id')
        .single();

      if (error) {
        errors.push({ entity: 'user_fertilizers', localId: fert.id, message: error.message });
      } else if (data) {
        setCloudId('userFertilizers', fert.id, data.id);
        count++;
      }
    } catch (err: any) {
      errors.push({ entity: 'user_fertilizers', localId: fert.id, message: err?.message ?? 'Error desconocido' });
    }
    onProgress(count);
  }
  return count;
}

async function migrateFertilizationLogs(
  userId: string,
  logs: FertilizationLog[],
  errors: MigrationError[],
  onProgress: (n: number) => void
): Promise<number> {
  let count = 0;
  for (let i = 0; i < logs.length; i += BATCH_SIZE) {
    if (cancelRequested) break;
    const batch = logs.slice(i, i + BATCH_SIZE);
    const rows = batch
      .filter(l => getCloudId('crops', l.cultivoId))
      .map(l => ({
        crop_id: getCloudId('crops', l.cultivoId)!,
        plant_id: l.plantaId ? getCloudId('plants', l.plantaId) ?? null : null,
        user_id: userId,
        date: l.date,
        product_id: l.productId,
        product_name: l.productName,
        fertilizer_type: l.fertilizerType ?? 'generic',
        volume_water_liters: l.volumeWaterLiters,
        dose_ml_per_l: l.doseMlPerL,
        total_product_ml: l.totalProductMl,
        stage: l.stage,
        npk: l.npk ?? null,
        notes: l.notes ?? null,
        photo_url: l.photoUrl && !l.photoUrl.startsWith('data:') ? l.photoUrl : null,
        warning_notice: l.warningNotice ?? null,
      }));

    if (rows.length > 0) {
      const { error } = await supabase.from('fertilization_logs').insert(rows);
      if (error) {
        errors.push({ entity: 'fertilization_logs', message: `Batch ${i}: ${error.message}` });
      } else {
        count += rows.length;
      }
    }
    onProgress(count);
  }
  return count;
}

async function migrateLearningProgress(
  userId: string,
  learning: UserLearningProgress | null,
  warnings: string[]
): Promise<boolean> {
  if (!learning) return false;
  try {
    const { error } = await supabase.from('user_learning_progress').upsert({
      user_id: userId,
      current_level: learning.currentLevel ?? 'Principiante',
      read_article_ids: learning.readArticleIds ?? [],
      completed_categories: learning.completedCategories ?? [],
      favorite_article_ids: learning.favoriteArticleIds ?? [],
      favorite_product_ids: learning.favoriteProductIds ?? [],
      favorite_source_ids: learning.favoriteSourceIds ?? [],
      favorite_log_ids: learning.favoriteLogIds ?? [],
      pending_article_ids: learning.pendingArticleIds ?? [],
    }, { onConflict: 'user_id' });

    if (error) warnings.push(`Progreso educativo: ${error.message}`);
    return !error;
  } catch (err: any) {
    warnings.push(`Progreso educativo: ${err?.message}`);
    return false;
  }
}

// ─── Main coordinator ──────────────────────────────────────────────────────────

export async function runMigration(
  userId: string,
  onProgress?: ProgressCallback
): Promise<MigrationResult> {
  if (isMigrating) {
    return {
      success: false,
      status: 'failed',
      migrated: { crops: 0, plants: 0, diaryLogs: 0, tasks: 0, events: 0, photos: 0, fertilizationLogs: 0, userFertilizers: 0, preferences: false, learningProgress: false, achievements: 0 },
      errors: [{ entity: 'system', message: 'Ya hay una migración en curso.' }],
      warnings: [],
      durationMs: 0,
      timestamp: new Date().toISOString(),
    };
  }

  isMigrating = true;
  cancelRequested = false;
  saveMigrationStatus('in_progress');
  const startTime = Date.now();
  const errors: MigrationError[] = [];
  const warnings: string[] = [];
  const migrated: MigratedCounts = {
    crops: 0, plants: 0, diaryLogs: 0, tasks: 0, events: 0,
    photos: 0, fertilizationLogs: 0, userFertilizers: 0,
    preferences: false, learningProgress: false, achievements: 0,
  };

  const report = (...args: Parameters<ProgressCallback>) => onProgress?.(...args);

  try {
    // STEP 0: Backup
    report('backup', 'Creando copia de seguridad...', 0, 1, []);
    const backup = createBackup();
    if (!backup.success || !verifyBackup(backup.backupKey)) {
      isMigrating = false;
      saveMigrationStatus('failed');
      return {
        success: false,
        status: 'failed',
        migrated,
        errors: [{ entity: 'backup', message: 'No pudimos crear una copia de seguridad. Tus datos no fueron modificados.' }],
        warnings: [],
        durationMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };
    }

    // Load all local data (read-only)
    const data = getRawLocalData();

    // STEP 1: Preferences
    report('preferences', 'Sincronizando preferencias...', 0, 1, errors);
    migrated.preferences = await migratePreferences(userId, data.preferences, warnings);
    if (cancelRequested) throw new Error('CANCELLED');

    // STEP 2: Cultivos
    const totalCrops = data.cultivos.length;
    report('crops', 'Migrando cultivos...', 0, totalCrops, errors);
    migrated.crops = await migrateCultivos(userId, data.cultivos, errors, (n) => {
      report('crops', 'Migrando cultivos...', n, totalCrops, errors);
    });
    if (cancelRequested) throw new Error('CANCELLED');

    // STEP 3: Plantas
    const totalPlants = data.plantas.length;
    report('plants', 'Migrando plantas...', 0, totalPlants, errors);
    migrated.plants = await migratePlantas(userId, data.plantas, errors, (n) => {
      report('plants', 'Migrando plantas...', n, totalPlants, errors);
    });
    if (cancelRequested) throw new Error('CANCELLED');

    // STEP 4: Diario
    const totalLogs = data.registros.length;
    report('diary', 'Migrando registros de diario...', 0, totalLogs, errors);
    migrated.diaryLogs = await migrateRegistros(userId, data.registros, errors, (n) => {
      report('diary', 'Migrando registros de diario...', n, totalLogs, errors);
    });
    if (cancelRequested) throw new Error('CANCELLED');

    // STEP 5: Tareas
    const totalTasks = data.tareas.length;
    report('tasks', 'Migrando tareas...', 0, totalTasks, errors);
    migrated.tasks = await migrateTareas(userId, data.tareas, errors, (n) => {
      report('tasks', 'Migrando tareas...', n, totalTasks, errors);
    });
    if (cancelRequested) throw new Error('CANCELLED');

    // STEP 6: Eventos
    const totalEvents = data.eventos.length;
    report('events', 'Migrando eventos...', 0, totalEvents, errors);
    migrated.events = await migrateEventos(userId, data.eventos, errors, (n) => {
      report('events', 'Migrando eventos...', n, totalEvents, errors);
    });
    if (cancelRequested) throw new Error('CANCELLED');

    // STEP 7: Fertilizantes propios
    const totalFerts = data.userFertilizers.length;
    report('user_fertilizers', 'Migrando fertilizantes propios...', 0, totalFerts, errors);
    migrated.userFertilizers = await migrateUserFertilizers(userId, data.userFertilizers, errors, (n) => {
      report('user_fertilizers', 'Migrando fertilizantes propios...', n, totalFerts, errors);
    });
    if (cancelRequested) throw new Error('CANCELLED');

    // STEP 8: Fertilizaciones
    const totalFertLogs = data.fertilizationLogs.length;
    report('fertilization_logs', 'Migrando registros de fertilización...', 0, totalFertLogs, errors);
    migrated.fertilizationLogs = await migrateFertilizationLogs(userId, data.fertilizationLogs, errors, (n) => {
      report('fertilization_logs', 'Migrando registros de fertilización...', n, totalFertLogs, errors);
    });
    if (cancelRequested) throw new Error('CANCELLED');

    // STEP 9: Fotos
    const fullMap = getFullMap();

    const totalPhotos = data.fotos.length;
    report('photos', 'Migrando fotos...', 0, totalPhotos, errors);
    const photoResult = await migratePhotos(
      userId,
      data.fotos,
      fullMap.crops,
      fullMap.plants,
      (done, total, photoErrors) => {
        photoErrors.forEach(e => { if (!errors.find(x => x.localId === e.localId)) errors.push(e); });
        report('photos', 'Migrando fotos...', done, total, errors);
      }
    );
    migrated.photos = photoResult.results.length;
    if (cancelRequested) throw new Error('CANCELLED');

    // STEP 10: Learning progress
    report('learning', 'Sincronizando progreso educativo...', 0, 1, errors);
    migrated.learningProgress = await migrateLearningProgress(userId, data.learning, warnings);

    // Determine final status
    const finalStatus: MigrationStatus = errors.length > 0
      ? 'completed_with_warnings'
      : warnings.length > 0
        ? 'completed_with_warnings'
        : 'completed';

    saveMigrationStatus(finalStatus);

    return {
      success: true,
      status: finalStatus,
      migrated,
      errors,
      warnings,
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    if (err?.message === 'CANCELLED') {
      saveMigrationStatus('cancelled');
      return {
        success: false,
        status: 'cancelled',
        migrated,
        errors: [{ entity: 'system', message: 'Migración cancelada por el usuario.' }],
        warnings,
        durationMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };
    }

    saveMigrationStatus('failed');
    return {
      success: false,
      status: 'failed',
      migrated,
      errors: [...errors, { entity: 'system', message: err?.message ?? 'Error inesperado' }],
      warnings,
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  } finally {
    isMigrating = false;
  }
}
