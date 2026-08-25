// ============================================================================
// CULTIVA 3.0 — FASE 4: Local Data Inspector
// Read-only service — NEVER modifies localStorage
// ============================================================================

import { LocalDataSummary } from '../../types/migration';
import type { Cultivo, Planta, Registro, Tarea, Foto, Evento, FertilizationLog, UserFertilizer, Achievement, UserPreferences, UserLearningProgress } from '../../types';

const KEYS = {
  CULTIVOS: 'cultiva_v2_cultivos',
  PLANTAS: 'cultiva_v2_plantas',
  REGISTROS: 'cultiva_v2_registros',
  FERTILIZATIONS: 'cultiva_v2_fertilizations',
  USER_FERTILIZERS: 'cultiva_v2_user_fertilizers',
  TAREAS: 'cultiva_v2_tareas',
  FOTOS: 'cultiva_v2_fotos',
  EVENTOS: 'cultiva_v2_eventos',
  LEARNING: 'cultiva_v2_learning',
  ACHIEVEMENTS: 'cultiva_v2_achievements',
  PREFERENCES: 'cultiva_v2_preferences',
};

function safeParseArray<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeParseObject<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function inspectLocalData(): LocalDataSummary {
  const cultivos = safeParseArray<Cultivo>(KEYS.CULTIVOS);
  const plantas = safeParseArray<Planta>(KEYS.PLANTAS);
  const registros = safeParseArray<Registro>(KEYS.REGISTROS);
  const tareas = safeParseArray<Tarea>(KEYS.TAREAS);
  const fotos = safeParseArray<Foto>(KEYS.FOTOS);
  const eventos = safeParseArray<Evento>(KEYS.EVENTOS);
  const fertilizationLogs = safeParseArray<FertilizationLog>(KEYS.FERTILIZATIONS);
  const userFertilizers = safeParseArray<UserFertilizer>(KEYS.USER_FERTILIZERS);
  const achievements = safeParseArray<Achievement>(KEYS.ACHIEVEMENTS);
  const preferences = safeParseObject<UserPreferences>(KEYS.PREFERENCES);
  const learning = safeParseObject<UserLearningProgress>(KEYS.LEARNING);

  const unlockedAchievements = achievements.filter(a => a.unlocked).length;

  const totalRecords =
    cultivos.length +
    plantas.length +
    registros.length +
    tareas.length +
    fotos.length +
    eventos.length +
    fertilizationLogs.length +
    userFertilizers.length;

  const hasData = totalRecords > 0 || !!preferences || !!learning;

  return {
    hasData,
    crops: cultivos.length,
    plants: plantas.length,
    diaryLogs: registros.length,
    tasks: tareas.length,
    events: eventos.length,
    photos: fotos.length,
    fertilizationLogs: fertilizationLogs.length,
    userFertilizers: userFertilizers.length,
    hasPreferences: !!preferences,
    hasLearningProgress: !!learning,
    unlockedAchievements,
    totalRecords,
  };
}

export function getRawLocalData() {
  return {
    cultivos: safeParseArray<Cultivo>(KEYS.CULTIVOS),
    plantas: safeParseArray<Planta>(KEYS.PLANTAS),
    registros: safeParseArray<Registro>(KEYS.REGISTROS),
    tareas: safeParseArray<Tarea>(KEYS.TAREAS),
    fotos: safeParseArray<Foto>(KEYS.FOTOS),
    eventos: safeParseArray<Evento>(KEYS.EVENTOS),
    fertilizationLogs: safeParseArray<FertilizationLog>(KEYS.FERTILIZATIONS),
    userFertilizers: safeParseArray<UserFertilizer>(KEYS.USER_FERTILIZERS),
    achievements: safeParseArray<Achievement>(KEYS.ACHIEVEMENTS),
    preferences: safeParseObject<UserPreferences>(KEYS.PREFERENCES),
    learning: safeParseObject<UserLearningProgress>(KEYS.LEARNING),
  };
}
