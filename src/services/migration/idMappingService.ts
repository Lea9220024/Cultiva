// ============================================================================
// CULTIVA 3.0 — FASE 4: ID Mapping Service
// Persists local_id → cloud_uuid mapping for idempotent migrations.
// ============================================================================

import { IdMap, MIGRATION_MAP_KEY } from '../../types/migration';

function loadMap(): IdMap {
  try {
    const raw = localStorage.getItem(MIGRATION_MAP_KEY);
    if (!raw) return { crops: {}, plants: {}, userFertilizers: {}, photos: {} };
    return JSON.parse(raw) as IdMap;
  } catch {
    return { crops: {}, plants: {}, userFertilizers: {}, photos: {} };
  }
}

function saveMap(map: IdMap): void {
  localStorage.setItem(MIGRATION_MAP_KEY, JSON.stringify(map));
}

export function getCloudId(entity: keyof IdMap, localId: string): string | undefined {
  return loadMap()[entity][localId];
}

export function setCloudId(entity: keyof IdMap, localId: string, cloudId: string): void {
  const map = loadMap();
  map[entity][localId] = cloudId;
  saveMap(map);
}

export function hasBeenMigrated(entity: keyof IdMap, localId: string): boolean {
  return !!loadMap()[entity][localId];
}

export function getFullMap(): IdMap {
  return loadMap();
}

export function clearMap(): void {
  localStorage.removeItem(MIGRATION_MAP_KEY);
}
