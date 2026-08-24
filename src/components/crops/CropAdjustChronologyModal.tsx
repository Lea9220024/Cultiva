import React, { useState } from "react";
import { X, Clock, ArrowRight, Check, AlertTriangle, Sparkles, RefreshCw } from "lucide-react";
import { useCultiva } from "../../context/CultivaContext";
import { compareChronologyChange } from "../../utils/dateCalculations";

export const CropAdjustChronologyModal: React.FC = () => {
  const {
    activeCrop,
    isAdjustChronologyOpen,
    setIsAdjustChronologyOpen,
    adjustCropChronology,
  } = useCultiva();

  const [newStartDate, setNewStartDate] = useState(
    activeCrop?.dates?.startDate || activeCrop?.startDate || ""
  );
  const [reason, setReason] = useState("");

  if (!isAdjustChronologyOpen || !activeCrop) return null;

  const currentStartDate = activeCrop.dates?.startDate || activeCrop.startDate;
  const comparison = compareChronologyChange(activeCrop, { startDate: newStartDate || currentStartDate });

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStartDate) {
      alert("Por favor selecciona una fecha válida.");
      return;
    }
    adjustCropChronology(activeCrop.id, newStartDate, reason);
    setIsAdjustChronologyOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                ⚙️ Ajustar Cronología
              </h2>
              <p className="text-xs text-zinc-500">
                Corrección de fecha de inicio sin perder registros
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAdjustChronologyOpen(false)}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input prompt */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
            “Mi cultivo realmente comenzó el…”
          </label>
          <input
            type="date"
            required
            value={newStartDate}
            onChange={(e) => setNewStartDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
          <input
            type="text"
            placeholder="Motivo (opcional, ej. 'Ajuste por germinación tardía')..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 mt-2"
          />
        </div>

        {/* BEFORE vs AFTER Preview Box */}
        <div className="p-4 rounded-[1.5rem] bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 space-y-3">
          <div className="text-[11px] font-mono uppercase font-bold text-zinc-400 text-center tracking-wider">
            Vista Previa de Recálculo
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* ANTES */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
              <div className="text-[10px] font-bold uppercase text-zinc-400 font-mono">
                ANTES
              </div>
              <div className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                Día {comparison.before.currentDay}
              </div>
              <div className="text-xs text-zinc-500">
                Inicio: <span className="font-mono">{comparison.before.startDate}</span>
              </div>
              {comparison.before.floweringDays > 0 && (
                <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                  Floración: {comparison.before.floweringDays} días
                </div>
              )}
            </div>

            {/* DESPUÉS */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 space-y-1.5">
              <div className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 font-mono">
                DESPUÉS
              </div>
              <div className="text-base font-bold text-emerald-700 dark:text-emerald-300">
                Día {comparison.after.currentDay}
              </div>
              <div className="text-xs text-emerald-800 dark:text-emerald-300">
                Inicio: <span className="font-mono">{comparison.after.startDate}</span>
              </div>
              {comparison.after.floweringDays > 0 && (
                <div className="text-xs text-purple-600 dark:text-purple-300 font-semibold">
                  Floración: {comparison.after.floweringDays} días
                </div>
              )}
            </div>
          </div>

          <div className="text-center text-[11px] text-zinc-500 font-mono pt-1">
            Diferencia de tiempo calculada:{" "}
            <span className="font-bold text-zinc-800 dark:text-zinc-200">
              {comparison.dayDifference > 0 ? `+${comparison.dayDifference}` : comparison.dayDifference} días
            </span>
          </div>
        </div>

        {/* Exact Warning requirement */}
        <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            «Este cambio actualizará los cálculos derivados del cultivo, pero no modificará las fechas originales de tus registros.»
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setIsAdjustChronologyOpen(false)}
            className="px-5 py-2.5 rounded-full text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Aplicar cambios</span>
          </button>
        </div>
      </div>
    </div>
  );
};
