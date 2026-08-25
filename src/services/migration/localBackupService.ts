// ============================================================================
// CULTIVA 3.0 — FASE 4: Local Backup Service
// Creates snapshot of all cultiva_v2_* keys under a separate namespace.
// NEVER modifies or deletes original keys.
// ============================================================================

import { BackupResult, BACKUP_KEY_PREFIX } from '../../types/migration';

const ORIGINAL_KEYS = [
  'cultiva_v2_cultivos',
  'cultiva_v2_plantas',
  'cultiva_v2_registros',
  'cultiva_v2_fertilizations',
  'cultiva_v2_user_fertilizers',
  'cultiva_v2_tareas',
  'cultiva_v2_fotos',
  'cultiva_v2_eventos',
  'cultiva_v2_learning',
  'cultiva_v2_achievements',
  'cultiva_v2_preferences',
  // v1 legacy keys (read-only backup)
  'cultiva_v1_cultivos',
  'cultiva_v1_plantas',
  'cultiva_v1_registros',
  'cultiva_v1_tareas',
  'cultiva_v1_fotos',
  'cultiva_v1_eventos',
  'cultiva_v1_prefs',
];

export const BACKUP_INDEX_KEY = 'cultiva_migration_backup_index';

export function createBackup(): BackupResult {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupKey = BACKUP_KEY_PREFIX + timestamp;

  try {
    const snapshot: Record<string, string | null> = {};
    for (const key of ORIGINAL_KEYS) {
      snapshot[key] = localStorage.getItem(key);
    }

    const serialized = JSON.stringify(snapshot);
    localStorage.setItem(backupKey, serialized);

    // Track backup index
    const indexRaw = localStorage.getItem(BACKUP_INDEX_KEY);
    const index: string[] = indexRaw ? JSON.parse(indexRaw) : [];
    index.push(backupKey);
    localStorage.setItem(BACKUP_INDEX_KEY, JSON.stringify(index));

    return { success: true, backupKey, timestamp };
  } catch (err: any) {
    return {
      success: false,
      backupKey,
      timestamp,
      error: err?.message || 'Error desconocido al crear backup',
    };
  }
}

export function verifyBackup(backupKey: string): boolean {
  try {
    const raw = localStorage.getItem(backupKey);
    if (!raw) return false;
    const snapshot = JSON.parse(raw);
    return typeof snapshot === 'object' && snapshot !== null;
  } catch {
    return false;
  }
}

export function restoreBackup(backupKey: string): boolean {
  try {
    const raw = localStorage.getItem(backupKey);
    if (!raw) return false;
    const snapshot: Record<string, string | null> = JSON.parse(raw);
    for (const [key, value] of Object.entries(snapshot)) {
      if (value !== null) {
        localStorage.setItem(key, value);
      } else {
        localStorage.removeItem(key);
      }
    }
    return true;
  } catch {
    return false;
  }
}

export function listBackups(): string[] {
  try {
    const indexRaw = localStorage.getItem(BACKUP_INDEX_KEY);
    return indexRaw ? JSON.parse(indexRaw) : [];
  } catch {
    return [];
  }
}
