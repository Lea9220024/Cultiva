import React, { useState } from "react";
import {
  X,
  Sprout,
  Ruler,
  TrendingUp,
  Camera,
  FileText,
  Trash2,
  Edit2,
  Check,
  Calendar,
  Layers,
} from "lucide-react";
import { useCultiva } from "../../context/CultivaContext";
import { Stage } from "../../types";

interface Props {
  plantId: string;
  onClose: () => void;
}

export const PlantProfileModal: React.FC<Props> = ({ plantId, onClose }) => {
  const {
    plantas,
    updatePlanta,
    deletePlanta,
    registros,
    fotos,
    setIsQuickAddOpen,
  } = useCultiva();

  const plant = plantas.find((p) => p.id === plantId);

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(plant?.name || "");
  const [newHeight, setNewHeight] = useState(plant?.heightCm ? plant.heightCm.toString() : "");

  if (!plant) return null;

  const plantLogs = registros.filter((r) => r.plantaId === plant.id);
  const plantPhotos = fotos.filter((f) => f.plantaId === plant.id);

  const handleSaveName = () => {
    if (nameVal.trim()) {
      updatePlanta(plant.id, { name: nameVal.trim() });
      setIsEditingName(false);
    }
  };

  const handleUpdateHeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHeight) {
      updatePlanta(plant.id, { heightCm: parseFloat(newHeight) });
    }
  };

  const handleStageChange = (newStage: Stage) => {
    updatePlanta(plant.id, { stage: newStage });
  };

  const stagesList: Stage[] = [
    "Germinación",
    "Plántula",
    "Vegetativo",
    "Pre-floración",
    "Floración",
    "Secado",
    "Curado",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              {isEditingName ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={nameVal}
                    onChange={(e) => setNameVal(e.target.value)}
                    className="text-sm font-bold bg-white dark:bg-slate-800 border border-slate-300 rounded px-2 py-0.5"
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1 bg-emerald-600 text-white rounded"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                    {plant.name}
                  </h2>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <p className="text-xs text-slate-500">
                Ficha individual y seguimiento biométrico
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-700 dark:text-slate-300">
          {/* Main Visual & Key Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <img
              src={plant.image}
              alt={plant.name}
              className="w-full h-40 object-cover rounded-2xl border border-slate-200 dark:border-slate-700"
            />
            <div className="sm:col-span-2 space-y-3 flex flex-col justify-between">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">
                    Altura Actual
                  </span>
                  <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {plant.heightCm ? `${plant.heightCm} cm` : "Sin medir"}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">
                    Vigor / Estado
                  </span>
                  <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {plant.status}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">
                    Maceta / Sustrato
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {plant.potSize || "11L Geotextil"}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">
                    Incorporación
                  </span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {plant.dateAdded}
                  </span>
                </div>
              </div>

              {/* Quick Update Height Form */}
              <form onSubmit={handleUpdateHeight} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="0.5"
                    value={newHeight}
                    onChange={(e) => setNewHeight(e.target.value)}
                    placeholder="Registrar nueva altura (cm)..."
                    className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100 font-mono"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[11px] font-mono">
                    cm
                  </span>
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-sm"
                >
                  Actualizar
                </button>
              </form>
            </div>
          </div>

          {/* Change Stage Pill Selector */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Cambiar Etapa de Desarrollo
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {stagesList.map((st) => (
                <button
                  key={st}
                  onClick={() => handleStageChange(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    plant.stage === st
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Plant Photos Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" />
                Fotografías de esta Planta ({plantPhotos.length})
              </h3>
            </div>
            {plantPhotos.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center text-slate-400">
                Aún no hay fotos vinculadas directamente a esta planta.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {plantPhotos.map((f) => (
                  <div
                    key={f.id}
                    className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group"
                  >
                    <img
                      src={f.image}
                      alt="plant"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent text-[10px] text-white font-mono">
                      Día {f.cropDay}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Plant Diary Logs */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Historial de Registros ({plantLogs.length})
            </h3>
            {plantLogs.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center text-slate-400">
                No hay anotaciones asociadas a esta planta.
              </div>
            ) : (
              <div className="space-y-2">
                {plantLogs.map((l) => (
                  <div
                    key={l.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-1">
                      <span>{new Date(l.date).toLocaleDateString("es-ES")}</span>
                      {l.measurements?.heightCm && (
                        <span className="text-emerald-500 font-bold">
                          {l.measurements.heightCm} cm
                        </span>
                      )}
                    </div>
                    <p className="text-slate-800 dark:text-slate-200">{l.notes}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delete Action */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              onClick={() => {
                if (confirm("¿Seguro que deseas eliminar esta planta del cultivo?")) {
                  deletePlanta(plant.id);
                  onClose();
                }
              }}
              className="flex items-center space-x-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium px-3 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar Planta</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
