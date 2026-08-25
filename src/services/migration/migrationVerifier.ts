// ============================================================================
// CULTIVA 3.0 — FASE 4: Migration Verifier
// Compares local record counts vs Supabase counts post-migration.
// ============================================================================

import { supabase } from '../../lib/supabase';
import { VerificationResult } from '../../types/migration';
import { inspectLocalData } from './localDataInspector';

async function countCloudTable(tableName: string, userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from(tableName)
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    if (error) return -1;
    return count ?? 0;
  } catch {
    return -1;
  }
}

export async function verifyMigration(userId: string): Promise<VerificationResult[]> {
  const local = inspectLocalData();
  const results: VerificationResult[] = [];

  const checks: Array<{ entity: string; localCount: number; table: string }> = [
    { entity: 'Cultivos', localCount: local.crops, table: 'crops' },
    { entity: 'Plantas', localCount: local.plants, table: 'plants' },
    { entity: 'Registros de Diario', localCount: local.diaryLogs, table: 'diary_logs' },
    { entity: 'Tareas', localCount: local.tasks, table: 'tasks' },
    { entity: 'Eventos', localCount: local.events, table: 'events' },
    { entity: 'Fertilizaciones', localCount: local.fertilizationLogs, table: 'fertilization_logs' },
    { entity: 'Fertilizantes propios', localCount: local.userFertilizers, table: 'user_fertilizers' },
    { entity: 'Fotos', localCount: local.photos, table: 'photos' },
  ];

  for (const check of checks) {
    const cloudCount = await countCloudTable(check.table, userId);
    results.push({
      entity: check.entity,
      localCount: check.localCount,
      cloudCount,
      matches: cloudCount >= check.localCount,
      note: cloudCount < 0 ? 'No se pudo consultar la tabla cloud' : undefined,
    });
  }

  return results;
}
