import React, { useState } from "react";
import {
  BookOpen,
  Plus,
  Filter,
  Search,
  Thermometer,
  Droplets,
  Sprout,
  Tag,
  Calendar,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { useCultiva } from "../../context/CultivaContext";
import { TagType, Registro } from "../../types";

export const DiaryView: React.FC = () => {
  const {
    activeCrop,
    activeCropLogs,
    activeCropPlants,
    deleteRegistro,
    setIsQuickAddOpen,
  } = useCultiva();

  const [selectedTag, setSelectedTag] = useState<string>("todas");
  const [selectedPlantId, setSelectedPlantId] = useState<string>("todas");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);

  const availableTags: { id: string; label: string }[] = [
    { id: "todas", label: "Todas las etiquetas" },
    { id: "riego", label: "💧 Riego" },
    { id: "ambiente", label: "🌡️ Ambiente" },
    { id: "crecimiento", label: "📏 Crecimiento" },
    { id: "observacion", label: "📝 Observación" },
    { id: "fotografia", label: "📸 Fotografía" },
    { id: "mantenimiento", label: "🛠️ Mantenimiento" },
    { id: "poda", label: "✂️ Poda" },
    { id: "fertilizacion", label: "🧪 Fertilización" },
    { id: "incidencia", label: "⚠️ Incidencia" },
  ];

  // Filtering
  const filteredLogs = activeCropLogs.filter((log) => {
    if (selectedTag !== "todas" && !log.tags.includes(selectedTag as TagType)) {
      return false;
    }
    if (selectedPlantId !== "todas" && log.plantaId !== selectedPlantId) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const notesMatch = log.notes.toLowerCase().includes(q);
      const tagsMatch = log.tags.some((t) => t.toLowerCase().includes(q));
      if (!notesMatch && !tagsMatch) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Diario de Cultivo
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            Bitácora cronológica de parámetros, eventos, riegos y observaciones
          </p>
        </div>

        <button
          onClick={() => setIsQuickAddOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Registro</span>
        </button>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="p-4 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search text */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar en notas o etiquetas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 text-xs rounded-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          {/* Plant filter dropdown */}
          <select
            value={selectedPlantId}
            onChange={(e) => setSelectedPlantId(e.target.value)}
            className="w-full px-3.5 py-2 text-xs rounded-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
          >
            <option value="todas">🌱 Todas las plantas / Todo el cultivo</option>
            {activeCropPlants.map((plant) => (
              <option key={plant.id} value={plant.id}>
                Planta: {plant.name}
              </option>
            ))}
          </select>

          {/* Tag filter dropdown */}
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="w-full px-3.5 py-2 text-xs rounded-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
          >
            {availableTags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Timeline */}
      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <BookOpen className="w-8 h-8 text-zinc-400 mx-auto" />
            <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
              No se encontraron registros para los filtros seleccionados
            </p>
            <button
              onClick={() => {
                setSelectedTag("todas");
                setSelectedPlantId("todas");
                setSearchTerm("");
              }}
              className="text-xs text-emerald-600 font-bold hover:underline"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const plantObj = activeCropPlants.find((p) => p.id === log.plantaId);

            return (
              <div
                key={log.id}
                className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all space-y-4"
              >
                {/* Log Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-xs text-zinc-500">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                        {log.date}
                      </span>
                      <span>•</span>
                      <span>{log.stage}</span>
                      {plantObj && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            🌱 {plantObj.name}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {log.tags.map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/30"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm("¿Eliminar este registro de la bitácora?")) {
                        deleteRegistro(log.id);
                      }
                    }}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Eliminar registro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Metrics Pill Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  {log.temperature !== undefined && (
                    <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                      <span className="text-zinc-400">🌡️ Temp</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">
                        {log.temperature}°C
                      </span>
                    </div>
                  )}
                  {log.humidity !== undefined && (
                    <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                      <span className="text-zinc-400">💧 Hum</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">
                        {log.humidity}%
                      </span>
                    </div>
                  )}
                  {log.ph !== undefined && (
                    <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                      <span className="text-zinc-400">🧪 pH</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">{log.ph}</span>
                    </div>
                  )}
                  {log.ec !== undefined && (
                    <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                      <span className="text-zinc-400">⚡ EC</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">
                        {log.ec} mS
                      </span>
                    </div>
                  )}
                  {log.heightCm !== undefined && (
                    <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                      <span className="text-zinc-400">📏 Altura</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {log.heightCm} cm
                      </span>
                    </div>
                  )}
                </div>

                {/* Watering details if any */}
                {log.watering?.performed && (
                  <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-blue-500" />
                      <span>Riego Aplicado</span>
                      {log.watering.amountLiters && (
                        <span className="font-mono">({log.watering.amountLiters} Litros)</span>
                      )}
                    </div>
                    {log.watering.nutrients && (
                      <div className="text-[11px] opacity-90">
                        Nutrientes: {log.watering.nutrients}
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                {log.notes && (
                  <div className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-line leading-relaxed">
                    {log.notes}
                  </div>
                )}

                {/* Attached Photo */}
                {log.photoUrl && (
                  <div className="pt-2">
                    <img
                      src={log.photoUrl}
                      alt="Foto del registro"
                      onClick={() => setSelectedImageModal(log.photoUrl!)}
                      className="max-h-60 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:opacity-95 transition-opacity"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Image Modal Lightbox */}
      {selectedImageModal && (
        <div
          onClick={() => setSelectedImageModal(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
        >
          <img
            src={selectedImageModal}
            alt="Ampliación"
            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
      )}
    </div>
  );
};
