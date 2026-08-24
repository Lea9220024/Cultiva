import React, { useState } from "react";
import {
  Library,
  BookOpen,
  Search,
  Plus,
  Tag,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useCultiva } from "../../context/CultivaContext";
import { BibliotecaItem } from "../../types";

export const LibraryView: React.FC = () => {
  const { biblioteca } = useCultiva();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");
  const [selectedArticle, setSelectedArticle] = useState<BibliotecaItem | null>(
    biblioteca[0] || null
  );

  const categories = [
    { id: "todas", label: "Todas las guías" },
    { id: "riego", label: "Riego y pH" },
    { id: "ambiente", label: "Ambiente y VPD" },
    { id: "poda", label: "Entrenamiento y Podas" },
    { id: "nutrientes", label: "Nutrición" },
    { id: "prevencion", label: "Prevención" },
  ];

  const filteredArticles = biblioteca.filter((art) => {
    if (selectedCategory !== "todas" && art.category !== selectedCategory) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = art.title.toLowerCase().includes(q);
      const matchContent = art.content.toLowerCase().includes(q);
      const matchTags = art.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchTags) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
          <Library className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          Biblioteca Técnica y Conocimiento
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500">
          Guías botánicas de referencia rápida para consultas agronómicas offline
        </p>
      </div>

      {/* Search and Categories Bar */}
      <div className="p-4 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por tema (ej. VPD, nitrógeno, pH, apical)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2.5 text-xs rounded-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Master Detail Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Articles List */}
        <div className="space-y-3 md:col-span-1">
          {filteredArticles.length === 0 ? (
            <div className="p-8 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400">
              No se encontraron artículos que coincidan con la búsqueda.
            </div>
          ) : (
            filteredArticles.map((art) => (
              <div
                key={art.id}
                onClick={() => setSelectedArticle(art)}
                className={`p-4 rounded-[1.5rem] border cursor-pointer transition-all ${
                  selectedArticle?.id === art.id
                    ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 shadow-2xs"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className="text-[10px] font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400">
                  {art.category}
                </div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                  {art.title}
                </h3>
                <p className="text-[11px] text-zinc-500 line-clamp-2 mt-1">
                  {art.summary}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {art.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[9px] px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-mono"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Article Reader */}
        <div className="md:col-span-2">
          {selectedArticle ? (
            <div className="p-6 sm:p-8 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-6">
              <div>
                <div className="flex items-center space-x-2 text-xs text-emerald-600 dark:text-emerald-400 font-mono uppercase font-bold">
                  <span>Guía Técnica</span>
                  <span>•</span>
                  <span>{selectedArticle.category}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                  {selectedArticle.title}
                </h2>
                <p className="text-xs text-zinc-500 mt-1 italic">
                  {selectedArticle.summary}
                </p>
              </div>

              <div className="prose prose-zinc dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-line text-zinc-800 dark:text-zinc-200">
                {selectedArticle.content}
              </div>

              <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-zinc-400" />
                  {selectedArticle.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="text-[10px] text-zinc-400 font-mono">
                  Base técnica verificada
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center text-zinc-400 text-xs">
              Selecciona una guía en el panel izquierdo para leerla.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
