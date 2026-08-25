// ============================================================================
// CULTIVA 3.0 — FASE 4: Migration Modal
// Botanic / Emerald / Bento / Dark-mode / Mobile-first
// ============================================================================

import React, { useState, useCallback, useEffect } from 'react';
import {
  Cloud,
  Leaf,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  ChevronRight,
  ShieldCheck,
  Sprout,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { inspectLocalData } from '../../services/migration/localDataInspector';
import { runMigration, requestCancelMigration } from '../../services/migration/migrationService';
import { verifyMigration } from '../../services/migration/migrationVerifier';
import type { LocalDataSummary, MigrationResult, VerificationResult, MigrationStatus } from '../../types/migration';

type ModalStep = 'detection' | 'confirmation' | 'migrating' | 'result';

interface StepProgress {
  step: string;
  label: string;
  processed: number;
  total: number;
  percentComplete: number;
}

const STEP_ORDER = [
  'backup', 'preferences', 'crops', 'plants', 'diary',
  'tasks', 'events', 'user_fertilizers', 'fertilization_logs', 'photos', 'learning',
];

function StepIcon({ stepKey, currentStep, processed, total }: {
  stepKey: string;
  currentStep: string;
  processed: number;
  total: number;
}) {
  const isDone = STEP_ORDER.indexOf(stepKey) < STEP_ORDER.indexOf(currentStep);
  const isCurrent = stepKey === currentStep;

  if (isDone) return <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />;
  if (isCurrent) return <Loader2 className="w-4 h-4 text-emerald-400 animate-spin flex-shrink-0" />;
  return <div className="w-4 h-4 rounded-full border border-zinc-600 flex-shrink-0" />;
}

const STEP_LABELS: Record<string, string> = {
  backup: 'Copia de seguridad',
  preferences: 'Preferencias',
  crops: 'Cultivos',
  plants: 'Plantas',
  diary: 'Diario',
  tasks: 'Tareas',
  events: 'Eventos',
  user_fertilizers: 'Fertilizantes propios',
  fertilization_logs: 'Fertilizaciones',
  photos: 'Fotos',
  learning: 'Progreso educativo',
};

function SummaryBadge({ count, label, icon }: { count: number; label: string; icon: string }) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
      <span className="text-base">{icon}</span>
      <div>
        <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{count}</div>
        <div className="text-[10px] text-zinc-500">{label}</div>
      </div>
    </div>
  );
}

export const MigrationModal: React.FC = () => {
  const { user, isMigrationPromptOpen, localDataSummary, dismissMigrationPrompt } = useAuth();
  const [step, setStep] = useState<ModalStep>('detection');
  const [progress, setProgress] = useState<StepProgress>({ step: '', label: '', processed: 0, total: 0, percentComplete: 0 });
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [verification, setVerification] = useState<VerificationResult[]>([]);

  useEffect(() => {
    if (isMigrationPromptOpen) setStep('detection');
  }, [isMigrationPromptOpen]);

  const handleStartMigration = useCallback(async () => {
    if (!user) return;
    setStep('migrating');

    const migResult = await runMigration(user.id, (stepKey, label, processed, total, _errors) => {
      const totalSteps = STEP_ORDER.length;
      const stepIdx = STEP_ORDER.indexOf(stepKey);
      const basePercent = (stepIdx / totalSteps) * 100;
      const stepPercent = total > 0 ? (processed / total) * (100 / totalSteps) : 0;
      setProgress({
        step: stepKey,
        label,
        processed,
        total,
        percentComplete: Math.min(Math.round(basePercent + stepPercent), 99),
      });
    });

    setResult(migResult);

    if (migResult.success || migResult.status === 'completed_with_warnings') {
      const verif = await verifyMigration(user.id);
      setVerification(verif);
      setProgress(p => ({ ...p, percentComplete: 100 }));
    }

    setStep('result');
  }, [user]);

  const handleDismiss = useCallback(() => {
    dismissMigrationPrompt();
  }, [dismissMigrationPrompt]);

  if (!isMigrationPromptOpen || !localDataSummary?.hasData) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden max-h-[90dvh] overflow-y-auto">

        {/* ── STEP: DETECTION ── */}
        {step === 'detection' && (
          <div className="p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/30">
                  <Sprout className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Encontramos tus datos
                  </h2>
                  <p className="text-xs text-zinc-500">Cultiva detectó información guardada localmente</p>
                </div>
              </div>
              <button onClick={handleDismiss} className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 cursor-pointer transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              Podemos sincronizar tu información con tu cuenta de{' '}
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Cultiva Cloud</span>{' '}
              para que nunca pierdas tu historial de cultivos.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {localDataSummary.crops > 0 && <SummaryBadge count={localDataSummary.crops} label="cultivos" icon="🌿" />}
              {localDataSummary.plants > 0 && <SummaryBadge count={localDataSummary.plants} label="plantas" icon="🪴" />}
              {localDataSummary.diaryLogs > 0 && <SummaryBadge count={localDataSummary.diaryLogs} label="registros" icon="📔" />}
              {localDataSummary.tasks > 0 && <SummaryBadge count={localDataSummary.tasks} label="tareas" icon="✅" />}
              {localDataSummary.photos > 0 && <SummaryBadge count={localDataSummary.photos} label="fotos" icon="📸" />}
              {localDataSummary.fertilizationLogs > 0 && <SummaryBadge count={localDataSummary.fertilizationLogs} label="fertilizaciones" icon="🧪" />}
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/50 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                Tus datos <strong>no serán eliminados</strong> del dispositivo. El proceso es seguro y reversible.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                onClick={() => setStep('confirmation')}
                className="flex-1 py-2.5 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 active:scale-95 transition-all cursor-pointer"
              >
                <Cloud className="w-4 h-4" />
                Migrar a Cultiva Cloud
              </button>
              <button
                onClick={handleDismiss}
                className="flex-1 py-2.5 px-4 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-sm active:scale-95 transition-all cursor-pointer"
              >
                Más tarde
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: CONFIRMATION ── */}
        {step === 'confirmation' && (
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-zinc-800 dark:bg-zinc-700 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Confirmar migración</h2>
                <p className="text-xs text-zinc-500">Antes de continuar, revisá los detalles</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {[
                { icon: '✓', text: 'Se creará una copia de seguridad local antes de comenzar.' },
                { icon: '✓', text: 'Tus datos originales en este dispositivo permanecerán intactos.' },
                { icon: '✓', text: 'Si algo falla, la migración se detiene sin borrar nada.' },
                { icon: '✓', text: 'Podés repetir el proceso más adelante sin duplicar registros.' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-zinc-700 dark:text-zinc-300">
                  <span className="text-emerald-500 font-bold flex-shrink-0 mt-0.5">{item.icon}</span>
                  <span className="leading-relaxed">{item.text}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                onClick={handleStartMigration}
                className="flex-1 py-2.5 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 active:scale-95 transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
                Confirmar y migrar
              </button>
              <button
                onClick={() => setStep('detection')}
                className="flex-1 py-2.5 px-4 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-sm active:scale-95 transition-all cursor-pointer"
              >
                Volver
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: MIGRATING ── */}
        {step === 'migrating' && (
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center animate-pulse">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Migrando tu Cultiva...</h2>
                <p className="text-xs text-zinc-500">{progress.label || 'Iniciando proceso...'}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-500">
                <span>Progreso</span>
                <span>{progress.percentComplete}%</span>
              </div>
              <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress.percentComplete}%` }}
                />
              </div>
            </div>

            {/* Step list */}
            <div className="space-y-2">
              {STEP_ORDER.map((stepKey) => {
                const isDone = STEP_ORDER.indexOf(stepKey) < STEP_ORDER.indexOf(progress.step);
                const isCurrent = stepKey === progress.step;
                return (
                  <div
                    key={stepKey}
                    className={`flex items-center gap-2.5 p-2 rounded-xl transition-all ${isCurrent ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40' : ''}`}
                  >
                    <StepIcon stepKey={stepKey} currentStep={progress.step} processed={progress.processed} total={progress.total} />
                    <span className={`text-xs ${isDone ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : isCurrent ? 'text-zinc-900 dark:text-zinc-100 font-semibold' : 'text-zinc-400'}`}>
                      {STEP_LABELS[stepKey]}
                    </span>
                    {isCurrent && progress.total > 0 && (
                      <span className="ml-auto text-[10px] text-zinc-500 font-mono">
                        {progress.processed}/{progress.total}
                      </span>
                    )}
                    {isDone && (
                      <span className="ml-auto text-[10px] text-emerald-500 font-mono">✓</span>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => requestCancelMigration()}
              className="w-full py-2 px-4 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 text-xs font-semibold active:scale-95 transition-all cursor-pointer"
            >
              Cancelar migración
            </button>
          </div>
        )}

        {/* ── STEP: RESULT ── */}
        {step === 'result' && result && (
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${result.success ? 'bg-emerald-600 shadow-lg shadow-emerald-600/30' : 'bg-amber-500 shadow-lg shadow-amber-500/30'}`}>
                {result.success
                  ? <CheckCircle2 className="w-6 h-6 text-white" />
                  : <AlertTriangle className="w-6 h-6 text-white" />
                }
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {result.status === 'completed' && '🌱 Cultiva Cloud está listo'}
                  {result.status === 'completed_with_warnings' && 'Migración completada con advertencias'}
                  {result.status === 'cancelled' && 'Migración cancelada'}
                  {result.status === 'failed' && 'No se pudo completar la migración'}
                </h2>
                <p className="text-xs text-zinc-500">
                  {Math.round(result.durationMs / 1000)}s · {new Date(result.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>

            {/* Migrated counts */}
            {(result.status === 'completed' || result.status === 'completed_with_warnings') && (
              <div className="grid grid-cols-2 gap-2">
                {result.migrated.crops > 0 && <SummaryBadge count={result.migrated.crops} label="cultivos migrados" icon="🌿" />}
                {result.migrated.plants > 0 && <SummaryBadge count={result.migrated.plants} label="plantas migradas" icon="🪴" />}
                {result.migrated.diaryLogs > 0 && <SummaryBadge count={result.migrated.diaryLogs} label="registros migrados" icon="📔" />}
                {result.migrated.tasks > 0 && <SummaryBadge count={result.migrated.tasks} label="tareas migradas" icon="✅" />}
                {result.migrated.photos > 0 && <SummaryBadge count={result.migrated.photos} label="fotos migradas" icon="📸" />}
                {result.migrated.fertilizationLogs > 0 && <SummaryBadge count={result.migrated.fertilizationLogs} label="fertilizaciones" icon="🧪" />}
              </div>
            )}

            {/* Verification */}
            {verification.length > 0 && (
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono mb-2">Verificación Cloud</p>
                {verification.map((v) => (
                  <div key={v.entity} className="flex items-center justify-between text-xs">
                    <span className="text-zinc-600 dark:text-zinc-400">{v.entity}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-zinc-500">{v.cloudCount}/{v.localCount}</span>
                      <span>{v.matches ? '✓' : '⚠️'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Errors */}
            {result.errors.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/50 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500 font-mono mb-1.5">Errores ({result.errors.length})</p>
                {result.errors.slice(0, 5).map((e, i) => (
                  <p key={i} className="text-[11px] text-rose-700 dark:text-rose-300">
                    <span className="font-mono font-bold">[{e.entity}]</span> {e.message}
                  </p>
                ))}
                {result.errors.length > 5 && (
                  <p className="text-[10px] text-rose-500">y {result.errors.length - 5} errores más...</p>
                )}
              </div>
            )}

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/50 space-y-1">
                {result.warnings.map((w, i) => (
                  <p key={i} className="text-[11px] text-amber-700 dark:text-amber-300">⚠ {w}</p>
                ))}
              </div>
            )}

            {/* Privacy note */}
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/50 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                Tus datos originales permanecen guardados en este dispositivo como respaldo.
              </p>
            </div>

            <button
              onClick={handleDismiss}
              className="w-full py-2.5 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 active:scale-95 transition-all cursor-pointer"
            >
              Continuar a Cultiva
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
