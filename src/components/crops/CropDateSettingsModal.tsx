import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, Check, AlertCircle, Sparkles, RefreshCw } from "lucide-react";
import { useCultiva } from "../../context/CultivaContext";
import { CultivoDates } from "../../types";
import { calculateCropChronology } from "../../utils/dateCalculations";

export const CropDateSettingsModal: React.FC = () => {
  const { activeCrop, isDateSettingsOpen, setIsDateSettingsOpen, updateCropDates } = useCultiva();

  const [dates, setDates] = useState<CultivoDates>({
    startDate: "",
    germinationDate: "",
    plantAddedDate: "",
    vegetativeStartDate: "",
    floweringStartDate: "",
    estimatedHarvestDate: "",
    realHarvestDate: "",
    curingStartDate: "",
    curingEndDate: "",
  });

  useEffect(() => {
    if (activeCrop) {
      setDates({
        startDate: activeCrop.dates?.startDate || activeCrop.startDate || "",
        germinationDate: activeCrop.dates?.germinationDate || "",
        plantAddedDate: activeCrop.dates?.plantAddedDate || "",
        vegetativeStartDate: activeCrop.dates?.vegetativeStartDate || "",
        floweringStartDate: activeCrop.dates?.floweringStartDate || "",
        estimatedHarvestDate: activeCrop.dates?.estimatedHarvestDate || "",
        realHarvestDate: activeCrop.dates?.realHarvestDate || "",
        curingStartDate: activeCrop.dates?.curingStartDate || "",
        curingEndDate: activeCrop.dates?.curingEndDate || "",
      });
    }
  }, [activeCrop, isDateSettingsOpen]);

  if (!isDateSettingsOpen || !activeCrop) return null;

  // Real-time preview of calculations with current modal state
  const tempCrop = {
    ...activeCrop,
    startDate: dates.startDate || activeCrop.startDate,
    dates,
  };
  const stats = calculateCropChronology(tempCrop);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dates.startDate) {
      alert("La fecha de inicio del cultivo es obligatoria.");
      return;
    }
    updateCropDates(activeCrop.id, dates);
    setIsDateSettingsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Gestión Avanzada de Fechas
              </h2>
              <p className="text-xs text-zinc-500">
                Cultivo: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{activeCrop.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsDateSettingsOpen(false)}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Calculation Preview Banner */}
        <div className="p-4 rounded-[1.5rem] bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-2 rounded-xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
            <div className="text-[10px] font-mono text-zinc-400 uppercase">Edad Total</div>
            <div className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400">
              Día {stats.currentDay}
            </div>
          </div>
          <div className="p-2 rounded-xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
            <div className="text-[10px] font-mono text-zinc-400 uppercase">Vegetativo</div>
            <div className="text-sm sm:text-base font-bold text-zinc-800 dark:text-zinc-200">
              {stats.vegetativeDays} días
            </div>
          </div>
          <div className="p-2 rounded-xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
            <div className="text-[10px] font-mono text-zinc-400 uppercase">Floración</div>
            <div className="text-sm sm:text-base font-bold text-purple-600 dark:text-purple-400">
              {stats.floweringDays} días
            </div>
          </div>
          <div className="p-2 rounded-xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
            <div className="text-[10px] font-mono text-zinc-400 uppercase">A Cosecha</div>
            <div className="text-sm sm:text-base font-bold text-amber-600 dark:text-amber-400">
              {stats.daysToHarvest !== null ? `${stats.daysToHarvest} d` : "N/D"}
            </div>
          </div>
        </div>

        {/* Date Inputs Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* 1. Fecha de inicio */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                <span>🌱 Fecha de inicio del cultivo *</span>
              </label>
              <input
                type="date"
                required
                value={dates.startDate}
                onChange={(e) => setDates({ ...dates, startDate: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            {/* 2. Fecha de germinación */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                🌱 Fecha de germinación
              </label>
              <input
                type="date"
                value={dates.germinationDate || ""}
                onChange={(e) => setDates({ ...dates, germinationDate: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            {/* 3. Fecha de incorporación de la planta */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                🪴 Fecha de incorporación de la planta
              </label>
              <input
                type="date"
                value={dates.plantAddedDate || ""}
                onChange={(e) => setDates({ ...dates, plantAddedDate: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            {/* 4. Fecha de inicio de crecimiento */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                🌿 Fecha de inicio de crecimiento (vegetativo)
              </label>
              <input
                type="date"
                value={dates.vegetativeStartDate || ""}
                onChange={(e) => setDates({ ...dates, vegetativeStartDate: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            {/* 5. Fecha de inicio de floración */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                🌸 Fecha de inicio de floración (12/12)
              </label>
              <input
                type="date"
                value={dates.floweringStartDate || ""}
                onChange={(e) => setDates({ ...dates, floweringStartDate: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            {/* 6. Fecha estimada de cosecha */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                📅 Fecha estimada de cosecha
              </label>
              <input
                type="date"
                value={dates.estimatedHarvestDate || ""}
                onChange={(e) => setDates({ ...dates, estimatedHarvestDate: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            {/* 7. Fecha real de cosecha */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                ✂️ Fecha real de cosecha
              </label>
              <input
                type="date"
                value={dates.realHarvestDate || ""}
                onChange={(e) => setDates({ ...dates, realHarvestDate: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            {/* 8. Fecha de inicio de curado */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                🏺 Fecha de inicio de curado
              </label>
              <input
                type="date"
                value={dates.curingStartDate || ""}
                onChange={(e) => setDates({ ...dates, curingStartDate: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            {/* 9. Fecha de finalización del curado */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                ✨ Fecha de finalización del curado
              </label>
              <input
                type="date"
                value={dates.curingEndDate || ""}
                onChange={(e) => setDates({ ...dates, curingEndDate: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
          </div>

          {/* Recalculation Notice */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              <strong>Recálculo automático:</strong> Al guardar, la aplicación recalculará la edad del cultivo, duración de etapas y días restantes. <em>Tus registros históricos conservarán su fecha original sin alteración.</em>
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsDateSettingsOpen(false)}
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Fechas y Recalcular</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
