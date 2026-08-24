import React, { useState } from "react";
import { X, Layers, Plus, Trash2, ArrowUp, ArrowDown, Check, Sparkles } from "lucide-react";
import { useCultiva } from "../../context/CultivaContext";
import { CustomStage } from "../../types";

const DEFAULT_STAGE_PRESETS: string[] = [
  "Germinación / Semilla",
  "Plántula",
  "Vegetativo Temprano",
  "Vegetativo",
  "Transición",
  "Floración Temprana",
  "Engorde Floral (Pico)",
  "Lavado de Raíces",
  "Cosecha",
  "Secado",
  "Curado",
];

export const CropCustomStagesModal: React.FC = () => {
  const {
    activeCrop,
    isCustomStagesOpen,
    setIsCustomStagesOpen,
    updateCropStages,
  } = useCultiva();

  const [stages, setStages] = useState<CustomStage[]>(() => {
    if (activeCrop?.customStages && activeCrop.customStages.length > 0) {
      return activeCrop.customStages;
    }
    return [
      { id: "stg-1", name: "Germinación", durationDays: 7, order: 1 },
      { id: "stg-2", name: "Plántula", durationDays: 14, order: 2 },
      { id: "stg-3", name: "Vegetativo", durationDays: 30, order: 3, isCurrent: true },
      { id: "stg-4", name: "Floración", durationDays: 60, order: 4 },
      { id: "stg-5", name: "Lavado de Raíces", durationDays: 7, order: 5 },
      { id: "stg-6", name: "Secado", durationDays: 12, order: 6 },
      { id: "stg-7", name: "Curado", durationDays: 30, order: 7 },
    ];
  });

  const [newStageName, setNewStageName] = useState("");
  const [newStageDuration, setNewStageDuration] = useState(14);

  if (!isCustomStagesOpen || !activeCrop) return null;

  const handleAddStage = () => {
    if (!newStageName.trim()) return;
    const newStage: CustomStage = {
      id: "stg-" + Date.now(),
      name: newStageName.trim(),
      durationDays: Number(newStageDuration) || 14,
      order: stages.length + 1,
    };
    setStages([...stages, newStage]);
    setNewStageName("");
  };

  const handleDeleteStage = (id: string) => {
    setStages(stages.filter((s) => s.id !== id));
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const newArr = [...stages];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newArr.length) return;
    const temp = newArr[index];
    newArr[index] = newArr[targetIdx];
    newArr[targetIdx] = temp;
    // update order numbers
    newArr.forEach((s, idx) => {
      s.order = idx + 1;
    });
    setStages(newArr);
  };

  const handleSetCurrent = (id: string) => {
    setStages(
      stages.map((s) => ({
        ...s,
        isCurrent: s.id === id,
      }))
    );
  };

  const handleUpdateDuration = (id: string, duration: number) => {
    setStages(
      stages.map((s) => (s.id === id ? { ...s, durationDays: Math.max(1, duration) } : s))
    );
  };

  const handleUpdateName = (id: string, name: string) => {
    setStages(stages.map((s) => (s.id === id ? { ...s, name } : s)));
  };

  const handleSave = () => {
    updateCropStages(activeCrop.id, stages);
    setIsCustomStagesOpen(false);
  };

  const totalCycleDays = stages.reduce((acc, s) => acc + (s.durationDays || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Personalización de Etapas
              </h2>
              <p className="text-xs text-zinc-500">
                Crea, renombra, reordena y ajusta la duración de cada fase
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCustomStagesOpen(false)}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total cycle banner */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 text-xs">
          <span className="text-zinc-600 dark:text-zinc-400">
            Total estimado del ciclo:
          </span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
            {totalCycleDays} días ({Math.round(totalCycleDays / 7)} semanas)
          </span>
        </div>

        {/* Stages list */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {stages.map((stage, index) => (
            <div
              key={stage.id}
              className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                stage.isCurrent
                  ? "bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700"
                  : "bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700/80"
              }`}
            >
              {/* Order buttons */}
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => handleMove(index, "up")}
                  className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-30 cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5 text-zinc-500" />
                </button>
                <button
                  type="button"
                  disabled={index === stages.length - 1}
                  onClick={() => handleMove(index, "down")}
                  className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-30 cursor-pointer"
                >
                  <ArrowDown className="w-3.5 h-3.5 text-zinc-500" />
                </button>
              </div>

              {/* Stage Name input */}
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={stage.name}
                  onChange={(e) => handleUpdateName(stage.id, e.target.value)}
                  className="w-full px-2.5 py-1 text-xs font-semibold bg-transparent border-b border-dashed border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Duration input */}
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  value={stage.durationDays}
                  onChange={(e) => handleUpdateDuration(stage.id, parseInt(e.target.value) || 1)}
                  className="w-14 px-2 py-1 text-xs text-center rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-mono"
                />
                <span className="text-[10px] text-zinc-500">días</span>
              </div>

              {/* Current Stage Toggle */}
              <button
                type="button"
                onClick={() => handleSetCurrent(stage.id)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                  stage.isCurrent
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
                }`}
              >
                {stage.isCurrent ? "Actual" : "Fijar"}
              </button>

              {/* Delete */}
              <button
                type="button"
                onClick={() => handleDeleteStage(stage.id)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add new stage */}
        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-dashed border-zinc-300 dark:border-zinc-700 space-y-2.5">
          <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            ➕ Agregar nueva etapa personalizada
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Nombre (ej. 'Lavado final')..."
              value={newStageName}
              onChange={(e) => setNewStageName(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
            <input
              type="number"
              min={1}
              value={newStageDuration}
              onChange={(e) => setNewStageDuration(parseInt(e.target.value) || 14)}
              className="w-16 px-2 py-1.5 text-xs text-center rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-mono"
            />
            <button
              type="button"
              onClick={handleAddStage}
              className="px-4 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs hover:bg-zinc-800 dark:hover:bg-white transition-colors cursor-pointer"
            >
              Agregar
            </button>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {DEFAULT_STAGE_PRESETS.slice(0, 5).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setNewStageName(preset)}
                className="px-2 py-0.5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-[10px] text-zinc-600 dark:text-zinc-300 hover:border-emerald-500 cursor-pointer"
              >
                + {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setIsCustomStagesOpen(false)}
            className="px-5 py-2.5 rounded-full text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Guardar Etapas</span>
          </button>
        </div>
      </div>
    </div>
  );
};
