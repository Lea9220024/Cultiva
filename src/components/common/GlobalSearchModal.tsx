import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  Sprout,
  FileText,
  CalendarCheck,
  Image as ImageIcon,
  Library,
  Tag,
  ArrowRight,
} from "lucide-react";
import { useCultiva } from "../../context/CultivaContext";

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    cultivos,
    plantas,
    registros,
    tareas,
    fotos,
    biblioteca,
    setCurrentTab,
    setSelectedPlantIdForModal,
  } = useCultiva();

  const [query, setQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  // Search in Crops
  const matchedCrops = cultivos.filter(
    (c) =>
      c.name.toLowerCase().includes(cleanQuery) ||
      c.description.toLowerCase().includes(cleanQuery) ||
      (c.geneticName && c.geneticName.toLowerCase().includes(cleanQuery))
  );

  // Search in Plants
  const matchedPlants = plantas.filter(
    (p) =>
      p.name.toLowerCase().includes(cleanQuery) ||
      (p.notes && p.notes.toLowerCase().includes(cleanQuery)) ||
      p.stage.toLowerCase().includes(cleanQuery)
  );

  // Search in Logs
  const matchedLogs = registros.filter(
    (l) =>
      (l.notes && l.notes.toLowerCase().includes(cleanQuery)) ||
      (l.tags && l.tags.some((t) => t.toLowerCase().includes(cleanQuery)))
  );

  // Search in Tasks
  const matchedTasks = tareas.filter(
    (t) =>
      t.title.toLowerCase().includes(cleanQuery) ||
      (t.notes && t.notes.toLowerCase().includes(cleanQuery))
  );

  // Search in Library
  const matchedLibrary = biblioteca.filter(
    (b) =>
      b.title.toLowerCase().includes(cleanQuery) ||
      b.content.toLowerCase().includes(cleanQuery) ||
      b.tags.some((t) => t.toLowerCase().includes(cleanQuery))
  );

  const totalResults =
    (filterCategory === "all" || filterCategory === "crops" ? matchedCrops.length : 0) +
    (filterCategory === "all" || filterCategory === "plants" ? matchedPlants.length : 0) +
    (filterCategory === "all" || filterCategory === "logs" ? matchedLogs.length : 0) +
    (filterCategory === "all" || filterCategory === "tasks" ? matchedTasks.length : 0) +
    (filterCategory === "all" || filterCategory === "library" ? matchedLibrary.length : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Box */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-3 bg-slate-50/50 dark:bg-slate-800/40">
          <Search className="w-5 h-5 text-emerald-500 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar cultivos, plantas, registros, tareas, biblioteca..."
            className="w-full bg-transparent border-none text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded font-mono"
          >
            ESC
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 py-2 gap-1.5 overflow-x-auto text-xs bg-slate-50/30 dark:bg-slate-800/20">
          {[
            { id: "all", label: "Todos" },
            { id: "crops", label: "Cultivos" },
            { id: "plants", label: "Plantas" },
            { id: "logs", label: "Diario / Registros" },
            { id: "tasks", label: "Tareas" },
            { id: "library", label: "Biblioteca" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
                filterCategory === cat.id
                  ? "bg-emerald-600 text-white font-semibold"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {cleanQuery === "" ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Escribe algo para buscar en toda tu bitácora de autocultivo...
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No se encontraron coincidencias para &quot;{query}&quot;
            </div>
          ) : (
            <div className="space-y-4">
              {/* Crops */}
              {(filterCategory === "all" || filterCategory === "crops") && matchedCrops.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1.5">
                    <Sprout className="w-3.5 h-3.5 text-emerald-500" />
                    Cultivos ({matchedCrops.length})
                  </div>
                  <div className="space-y-1.5">
                    {matchedCrops.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setCurrentTab("crops");
                        }}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center space-x-2.5">
                          <img src={c.image} alt={c.name} className="w-8 h-8 rounded-lg object-cover" />
                          <div>
                            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                              {c.name}
                            </div>
                            <div className="text-[11px] text-slate-500">{c.stage} • {c.method}</div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Plants */}
              {(filterCategory === "all" || filterCategory === "plants") && matchedPlants.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1.5">
                    <Sprout className="w-3.5 h-3.5 text-emerald-500" />
                    Plantas ({matchedPlants.length})
                  </div>
                  <div className="space-y-1.5">
                    {matchedPlants.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSelectedPlantIdForModal(p.id);
                          setCurrentTab("crops");
                        }}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center space-x-2.5">
                          <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                          <div>
                            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                              {p.name}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {p.stage} • {p.heightCm ? `${p.heightCm} cm` : "Sin altura"}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-semibold">
                          Ver Perfil
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Logs */}
              {(filterCategory === "all" || filterCategory === "logs") && matchedLogs.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-500" />
                    Entradas de Diario ({matchedLogs.length})
                  </div>
                  <div className="space-y-1.5">
                    {matchedLogs.map((l) => (
                      <div
                        key={l.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setCurrentTab("diary");
                        }}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-700 cursor-pointer"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                          <span>{new Date(l.date).toLocaleDateString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                          <div className="flex gap-1">
                            {l.tags.map((t) => (
                              <span key={t} className="px-1.5 py-0.2 rounded bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px]">
                                #{t}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-2">
                          {l.notes}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks */}
              {(filterCategory === "all" || filterCategory === "tasks") && matchedTasks.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1.5">
                    <CalendarCheck className="w-3.5 h-3.5 text-emerald-500" />
                    Tareas ({matchedTasks.length})
                  </div>
                  <div className="space-y-1.5">
                    {matchedTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setCurrentTab("tasks");
                        }}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <div className={`text-xs font-semibold ${t.completed ? "line-through text-slate-400" : "text-slate-900 dark:text-slate-100"}`}>
                            {t.title}
                          </div>
                          <div className="text-[11px] text-slate-500">Fecha: {t.date} {t.time || ""}</div>
                        </div>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {t.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Library */}
              {(filterCategory === "all" || filterCategory === "library") && matchedLibrary.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1.5">
                    <Library className="w-3.5 h-3.5 text-emerald-500" />
                    Biblioteca ({matchedLibrary.length})
                  </div>
                  <div className="space-y-1.5">
                    {matchedLibrary.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setCurrentTab("library");
                        }}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-700 cursor-pointer"
                      >
                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-0.5">
                          {b.title}
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">{b.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
