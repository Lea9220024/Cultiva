// ============================================================================
// CULTIVA 3.0 — FASE 4: Migration Types
// ============================================================================

export type MigrationStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'completed_with_warnings'
  | 'failed'
  | 'cancelled';

export interface MigrationError {
  entity: string;
  localId?: string;
  message: string;
}

export interface MigrationProgress {
  currentStep: string;
  stepLabel: string;
  processed: number;
  total: number;
  percentComplete: number;
  errors: MigrationError[];
}

export interface MigratedCounts {
  crops: number;
  plants: number;
  diaryLogs: number;
  tasks: number;
  events: number;
  photos: number;
  fertilizationLogs: number;
  userFertilizers: number;
  preferences: boolean;
  learningProgress: boolean;
  achievements: number;
}

export interface MigrationResult {
  success: boolean;
  status: MigrationStatus;
  migrated: MigratedCounts;
  errors: MigrationError[];
  warnings: string[];
  durationMs: number;
  timestamp: string;
}

export interface LocalDataSummary {
  hasData: boolean;
  crops: number;
  plants: number;
  diaryLogs: number;
  tasks: number;
  events: number;
  photos: number;
  fertilizationLogs: number;
  userFertilizers: number;
  hasPreferences: boolean;
  hasLearningProgress: boolean;
  unlockedAchievements: number;
  totalRecords: number;
}

export interface BackupResult {
  success: boolean;
  backupKey: string;
  timestamp: string;
  error?: string;
}

export interface VerificationResult {
  entity: string;
  localCount: number;
  cloudCount: number;
  matches: boolean;
  note?: string;
}

export interface IdMap {
  crops: Record<string, string>;
  plants: Record<string, string>;
  userFertilizers: Record<string, string>;
  photos: Record<string, string>;
}

export const MIGRATION_MAP_KEY = 'cultiva_migration_map_v1';
export const MIGRATION_STATUS_KEY = 'cultiva_migration_status_v1';
export const BACKUP_KEY_PREFIX = 'cultiva_migration_backup_v1_';
