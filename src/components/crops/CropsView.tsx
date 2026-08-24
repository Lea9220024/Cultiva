import React, { useState } from "react";
import {
  Sprout,
  Plus,
  ArrowRightLeft,
  FileCheck2,
  Calendar,
  Layers,
  Archive,
  RotateCcw,
  CheckCircle2,
  Trash2,
  MoreVertical,
  ChevronRight,
  Sparkles,
  Clock,
  Settings2,
} from "lucide-react";
import { useCultiva } from "../../context/CultivaContext";
import { Cultivo, Planta } from "../../types";
import { CropPassportModal } from "./CropPassportModal";
import { CropCompareModal } from "./CropCompareModal";
import { PlantProfileModal } from "../plants/PlantProfileModal";
import { CropDateSettingsModal } from "./CropDateSettingsModal";
import { CropAdjustChronologyModal } from "./CropAdjustChronologyModal";
import { CropCustomStagesModal } from "./CropCustomStagesModal";
import { calculateCropChronology, calculatePlantAge } from "../../utils/dateCalculations";

export const CropsView: React.FC = () => {
  const {
    cultivos,
    activeCrop,
    setActiveCropId,
    activeCropPlants,
    activeCropLogs,
    activeCropPhotos,
    plantas,
    registros,
    fotos,
    setIsQuickAddOpen,
    updateCultivo,
    deleteCultivo,
    selectedPlantIdForModal,
    setSelectedPlantIdForModal,
    setIsDateSettingsOpen,
    setIsAdjustChronologyOpen,
    setIsCustomStagesOpen,
  } = useCultiva();

  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [passportCrop, setPassportCrop] = useState<Cultivo | null>(null);
  const [filterStatus, setFilterStatus] = useState<"todos" | "activo" | "archivado">("todos");

  const filteredCrops = cultivos.filter((c) => {
    if (filterStatus === "todos") return true;
    return c.status === filterStatus;
  });

  const handleToggleArchive = (crop: Cultivo) => {
    const newStatus = crop.status === "activo" ? "archivado" : "activo";
    updateCultivo(crop.id, { status: newStatus });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <Sprout className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Gestión de Cultivos y Plantas V2
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            Administra tus ciclos de cultivo, cronología avanzada, etapas y expedientes de plantas
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Compare Button */}
          {cultivos.length >= 2 && (
            <button
              onClick={() => setIsCompareOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-teal-500" />
              <span>Comparar Cultivos</span>
            </button>
          )}

          {/* New Crop Modal */}
          <button
            onClick={() => setIsQuickAddOpen(true, "planta")}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Cultivo / Planta</span>
          </button>
        </div>
      </div>

      {/* Active Crop Quick Management Tools Banner */}
      {activeCrop && (
        <div className="p-4 sm:p-5 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
              🌱
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Cultivo Activo: {activeCrop.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {activeCrop.stage}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Fecha inicio: {activeCrop.dates?.startDate || activeCrop.startDate} • {calculateCropChronology(activeCrop).currentDay} días en curso
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsDateSettingsOpen(true)}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              <span>Configuración Fechas</span>
            </button>

            <button
              onClick={() => setIsAdjustChronologyOpen(true)}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-200 dark:border-emerald-800/60 transition-colors cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>⚙️ Ajustar Cronología</span>
            </button>

            <button
              onClick={() => setIsCustomStagesOpen(true)}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-purple-500" />
              <span>Etapas</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-2 text-xs">
        {[
          { id: "todos", label: "Todos los Cultivos", count: cultivos.length },
          { id: "activo", label: "Activos", count: cultivos.filter((c) => c.status === "activo").length },
          { id: "archivado", label: "Archivados", count: cultivos.filter((c) => c.status === "archivado").length },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterStatus(f.id as any)}
            className={`pb-3 px-2 font-semibold flex items-center gap-1.5 transition-colors border-b-2 cursor-pointer ${
              filterStatus === f.id
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
            }`}
          >
            <span>{f.label}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Cultivos Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCrops.map((crop) => {
          const isActive = crop.id === activeCrop?.id;
          const cropPlants = plantas.filter((p) => p.cultivoId === crop.id);
          const chrono = calculateCropChronology(crop);

          return (
            <div
              key={crop.id}
              className={`rounded-[2rem] overflow-hidden bg-white dark:bg-zinc-900 border transition-all shadow-sm flex flex-col justify-between ${
                isActive
                  ? "border-emerald-500 ring-2 ring-emerald-500/20"
                  : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
              }`}
            >
              {/* Top Banner Image */}
              <div className="relative h-40 w-full">
                <img
                  src={crop.image}
                  alt={crop.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Status Badges */}
                <div className="absolute top-4 left-4 flex gap-1.5">
                  {isActive && (
                    <span className="px-3 py-1 rounded-full bg-emerald-500 text-zinc-950 font-mono text-[10px] font-bold tracking-wide shadow-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-950 animate-pulse"></span>
                      EN CURSO
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white font-mono text-[10px]">
                    {crop.stage}
                  </span>
                </div>

                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h3 className="font-bold text-base truncate">{crop.name}</h3>
                  <div className="text-xs text-zinc-300 flex items-center gap-2">
                    <span>🌱 Día {chrono.currentDay}</span>
                    <span>•</span>
                    <span>{cropPlants.length} plantas</span>
                  </div>
                </div>
              </div>

              {/* Card Meta details */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between text-xs">
                <div className="space-y-1.5 text-zinc-600 dark:text-zinc-400">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Método:</span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">{crop.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Genética:</span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[160px]">
                      {crop.geneticName || "Variedad Botánica"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Inicio de cultivo:</span>
                    <span className="font-mono text-zinc-800 dark:text-zinc-200">
                      {crop.dates?.startDate || crop.startDate}
                    </span>
                  </div>
                  {chrono.daysToHarvest !== null && (
                    <div className="flex justify-between text-amber-600 dark:text-amber-400 font-semibold">
                      <span>Aproximado a cosecha:</span>
                      <span className="font-mono">{chrono.daysToHarvest} días</span>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {!isActive && crop.status === "activo" && (
                      <button
                        onClick={() => setActiveCropId(crop.id)}
                        className="px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 font-semibold text-[11px] transition-colors cursor-pointer"
                      >
                        Activar
                      </button>
                    )}

                    <button
                      onClick={() => setPassportCrop(crop)}
                      className="px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                      title="Ver e imprimir Pasaporte"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Pasaporte</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleArchive(crop)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                      title={crop.status === "activo" ? "Archivar cultivo" : "Reactivar cultivo"}
                    >
                      {crop.status === "activo" ? (
                        <Archive className="w-4 h-4" />
                      ) : (
                        <RotateCcw className="w-4 h-4 text-emerald-500" />
                      )}
                    </button>

                    {cultivos.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar definitivamente el cultivo "${crop.name}" y sus registros?`)) {
                            deleteCultivo(crop.id);
                          }
                        }}
                        className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                        title="Eliminar cultivo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ACTIVE CROP PLANTS DETAILED SECTION */}
      {activeCrop && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-500" />
                Plantas del Cultivo Activo ({activeCrop.name})
              </h2>
              <p className="text-xs text-zinc-500">
                Selecciona una planta para abrir su expediente individual, actualizar mediciones o revisar fotos
              </p>
            </div>
            <button
              onClick={() => setIsQuickAddOpen(true, "planta")}
              className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Agregar Planta</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeCropPlants.map((plant, index) => {
              const plantLogs = activeCropLogs.filter((l) => l.plantaId === plant.id);
              const plantPhotos = activeCropPhotos.filter((p) => p.plantaId === plant.id);
              const plantAge = calculatePlantAge(plant, activeCrop);

              return (
                <div
                  key={plant.id}
                  onClick={() => setSelectedPlantIdForModal(plant.id)}
                  className="p-5 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs hover:border-emerald-500 cursor-pointer transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="flex space-x-3.5 items-start">
                    <img
                      src={plant.image}
                      alt={plant.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0 group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">
                          Ejemplar #{index + 1}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-semibold">
                          {plant.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate mt-0.5">
                        {plant.name}
                      </h3>
                      <div className="text-[11px] text-zinc-500 font-mono mt-1">
                        Día en planta: <strong className="text-emerald-600 dark:text-emerald-400">{plantAge.plantDayNumber}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-center font-mono">
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-xl">
                      <span className="text-[9px] uppercase text-zinc-400 block">Altura</span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {plant.heightCm ? `${plant.heightCm} cm` : "—"}
                      </span>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-xl">
                      <span className="text-[9px] uppercase text-zinc-400 block">Fotos</span>
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        {plantPhotos.length}
                      </span>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-xl">
                      <span className="text-[9px] uppercase text-zinc-400 block">Registros</span>
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        {plantLogs.length}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Date Settings Modal */}
      <CropDateSettingsModal />

      {/* Adjust Chronology Modal */}
      <CropAdjustChronologyModal />

      {/* Custom Stages Modal */}
      <CropCustomStagesModal />

      {/* Passport Modal */}
      {passportCrop && (
        <CropPassportModal
          crop={passportCrop}
          plants={plantas.filter((p) => p.cultivoId === passportCrop.id)}
          logs={registros.filter((l) => l.cultivoId === passportCrop.id)}
          photos={fotos.filter((f) => f.cultivoId === passportCrop.id)}
          onClose={() => setPassportCrop(null)}
        />
      )}

      {/* Compare Modal */}
      {isCompareOpen && <CropCompareModal onClose={() => setIsCompareOpen(false)} />}

      {/* Plant Profile Modal */}
      {selectedPlantIdForModal && (
        <PlantProfileModal
          plantId={selectedPlantIdForModal}
          onClose={() => setSelectedPlantIdForModal(null)}
        />
      )}
    </div>
  );
};
