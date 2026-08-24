import React, { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Plus,
  Play,
  Pause,
  ArrowRightLeft,
  Calendar,
  Sprout,
  Filter,
  Trash2,
  Maximize2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCultiva } from "../../context/CultivaContext";
import { Foto } from "../../types";

export const PhotoGalleryView: React.FC = () => {
  const {
    activeCrop,
    activeCropPhotos,
    activeCropPlants,
    deleteFoto,
    setIsQuickAddOpen,
  } = useCultiva();

  const [selectedPlantFilter, setSelectedPlantFilter] = useState<string>("todas");
  const [activeMode, setActiveMode] = useState<"gallery" | "compare" | "timelapse">("gallery");

  // Compare mode states
  const [photoAIndex, setPhotoAIndex] = useState<number>(0);
  const [photoBIndex, setPhotoBIndex] = useState<number>(1);

  // Timelapse mode states
  const [timelapseIndex, setTimelapseIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Filtered photos
  const filteredPhotos = activeCropPhotos
    .filter((f) => {
      if (selectedPlantFilter !== "todas" && f.plantaId !== selectedPlantFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => a.cropDay - b.cropDay);

  // Time-lapse loop
  useEffect(() => {
    let interval: any = null;
    if (isPlaying && filteredPhotos.length > 1) {
      interval = setInterval(() => {
        setTimelapseIndex((prev) => (prev + 1) % filteredPhotos.length);
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [isPlaying, filteredPhotos.length]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header & Modes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <ImageIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Diario Fotográfico y Time-Lapse
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            Registro visual cronológico, comparador antes/después y animación de evolución
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex p-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold">
            <button
              onClick={() => setActiveMode("gallery")}
              className={`px-3.5 py-1.5 rounded-full transition-colors ${
                activeMode === "gallery"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              🖼️ Galería
            </button>
            <button
              onClick={() => setActiveMode("compare")}
              className={`px-3.5 py-1.5 rounded-full transition-colors ${
                activeMode === "compare"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              ⚖️ Antes / Después
            </button>
            <button
              onClick={() => setActiveMode("timelapse")}
              className={`px-3.5 py-1.5 rounded-full transition-colors ${
                activeMode === "timelapse"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              ▶️ Time-Lapse
            </button>
          </div>

          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Subir Foto</span>
          </button>
        </div>
      </div>

      {/* Plant Filter dropdown */}
      <div className="flex items-center justify-between p-4 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
        <div className="flex items-center space-x-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          <Filter className="w-4 h-4 text-emerald-500" />
          <span>Filtrar por planta:</span>
        </div>
        <select
          value={selectedPlantFilter}
          onChange={(e) => {
            setSelectedPlantFilter(e.target.value);
            setTimelapseIndex(0);
          }}
          className="text-xs rounded-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3.5 py-1.5 text-zinc-900 dark:text-zinc-100 focus:outline-none"
        >
          <option value="todas">🌱 Todo el cultivo ({activeCropPhotos.length} fotos)</option>
          {activeCropPlants.map((p) => {
            const count = activeCropPhotos.filter((f) => f.plantaId === p.id).length;
            return (
              <option key={p.id} value={p.id}>
                {p.name} ({count} fotos)
              </option>
            );
          })}
        </select>
      </div>

      {/* 1. GALLERY MODE */}
      {activeMode === "gallery" && (
        <div className="space-y-4">
          {filteredPhotos.length === 0 ? (
            <div className="text-center py-16 p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400 text-xs space-y-3">
              <ImageIcon className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-700" />
              <div>No hay fotos cargadas aún en este cultivo o para la planta seleccionada.</div>
              <button
                onClick={() => setIsQuickAddOpen(true)}
                className="px-4 py-2 rounded-full bg-emerald-600 text-white font-semibold text-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Subir primera foto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPhotos.map((photo) => {
                const plantObj = activeCropPlants.find((p) => p.id === photo.plantaId);
                return (
                  <div
                    key={photo.id}
                    className="group rounded-[2rem] overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs hover:border-emerald-500 transition-all flex flex-col justify-between"
                  >
                    <div className="relative aspect-4/3 overflow-hidden bg-zinc-950">
                      <img
                        src={photo.image}
                        alt="Cultivo"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono font-bold">
                        Día {photo.cropDay}
                      </div>
                      <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-emerald-600/80 backdrop-blur-xs text-white text-[10px] font-mono">
                        {photo.stage}
                      </div>
                    </div>

                    <div className="p-4 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {plantObj ? plantObj.name : "Foto general"}
                        </span>
                        <button
                          onClick={() => {
                            if (confirm("¿Eliminar esta fotografía?")) {
                              deleteFoto(photo.id);
                            }
                          }}
                          className="text-zinc-400 hover:text-rose-600 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2">
                        {photo.notes || "Sin observaciones"}
                      </p>
                      <div className="text-[10px] text-zinc-400 font-mono pt-1">
                        {photo.date}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. ANTES / DESPUÉS COMPARATOR */}
      {activeMode === "compare" && (
        <div className="p-6 sm:p-8 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Comparador Dual Antes / Después
              </h2>
              <p className="text-xs text-zinc-500">
                Selecciona dos momentos para evaluar la respuesta a nutrientes, podas o crecimiento
              </p>
            </div>

            {/* Selectors */}
            <div className="flex gap-2">
              <select
                value={photoAIndex}
                onChange={(e) => setPhotoAIndex(parseInt(e.target.value))}
                className="text-xs rounded-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-zinc-900 dark:text-zinc-100"
              >
                {filteredPhotos.map((f, idx) => (
                  <option key={f.id} value={idx}>
                    Foto A: Día {f.cropDay} ({f.date})
                  </option>
                ))}
              </select>
              <select
                value={photoBIndex}
                onChange={(e) => setPhotoBIndex(parseInt(e.target.value))}
                className="text-xs rounded-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-zinc-900 dark:text-zinc-100"
              >
                {filteredPhotos.map((f, idx) => (
                  <option key={f.id} value={idx}>
                    Foto B: Día {f.cropDay} ({f.date})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredPhotos.length >= 2 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Photo A */}
                <div className="rounded-[1.5rem] overflow-hidden border border-zinc-200 dark:border-zinc-800 space-y-2 p-3 bg-zinc-50 dark:bg-zinc-800/40">
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono uppercase">
                    Estado Anterior — Día {filteredPhotos[photoAIndex]?.cropDay} ({filteredPhotos[photoAIndex]?.date})
                  </div>
                  <img
                    src={filteredPhotos[photoAIndex]?.image}
                    alt="Antes"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 italic">
                    &quot;{filteredPhotos[photoAIndex]?.notes}&quot;
                  </p>
                </div>

                {/* Photo B */}
                <div className="rounded-[1.5rem] overflow-hidden border border-zinc-200 dark:border-zinc-800 space-y-2 p-3 bg-zinc-50 dark:bg-zinc-800/40">
                  <div className="text-xs font-bold text-teal-600 dark:text-teal-400 font-mono uppercase">
                    Estado Posterior — Día {filteredPhotos[photoBIndex]?.cropDay} ({filteredPhotos[photoBIndex]?.date})
                  </div>
                  <img
                    src={filteredPhotos[photoBIndex]?.image}
                    alt="Después"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 italic">
                    &quot;{filteredPhotos[photoBIndex]?.notes}&quot;
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-zinc-400 text-xs">
              Se requieren al menos 2 fotografías para realizar la comparación.
            </div>
          )}
        </div>
      )}

      {/* 3. TIME-LAPSE MODE */}
      {activeMode === "timelapse" && (
        <div className="p-6 sm:p-8 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Reproductor Time-Lapse de Evolución
            </h2>
            <p className="text-xs text-zinc-500">
              Observa el desarrollo continuo fotograma por fotograma
            </p>
          </div>

          {filteredPhotos.length > 0 ? (
            <div className="max-w-2xl mx-auto space-y-4">
              {/* Player Stage */}
              <div className="relative aspect-4/3 rounded-[2rem] overflow-hidden bg-zinc-950 shadow-xl border border-zinc-800 flex items-center justify-center">
                <img
                  src={filteredPhotos[timelapseIndex]?.image}
                  alt="Time-lapse frame"
                  className="w-full h-full object-cover transition-opacity duration-300"
                />

                {/* Day Overlay Pill */}
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-white font-mono text-xs font-bold border border-white/20">
                  🌱 Día {filteredPhotos[timelapseIndex]?.cropDay} • {filteredPhotos[timelapseIndex]?.stage}
                </div>

                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-black/60 backdrop-blur-md text-white text-xs space-y-0.5">
                  <div className="font-mono text-[11px] text-emerald-400">
                    Fecha: {filteredPhotos[timelapseIndex]?.date}
                  </div>
                  <div className="text-[11px] text-zinc-200 truncate">
                    {filteredPhotos[timelapseIndex]?.notes || "Seguimiento botánico continuo"}
                  </div>
                </div>
              </div>

              {/* Scrubber & Controls */}
              <div className="space-y-3 p-4 rounded-[1.5rem] bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                {/* Timeline slider */}
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, filteredPhotos.length - 1)}
                  value={timelapseIndex}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setTimelapseIndex(parseInt(e.target.value));
                  }}
                  className="w-full accent-emerald-600 cursor-pointer"
                />

                {/* Buttons */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setTimelapseIndex((prev) => Math.max(0, prev - 1));
                    }}
                    className="p-2 rounded-full bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/30"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4" /> Pausar
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" /> Reproducir Evolución
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setTimelapseIndex((prev) => Math.min(filteredPhotos.length - 1, prev + 1));
                    }}
                    className="p-2 rounded-full bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-zinc-400 text-xs">
              No hay fotos suficientes para generar la secuencia time-lapse.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
