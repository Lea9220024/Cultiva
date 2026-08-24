import React, { useState, useRef, useEffect } from "react";
import { ContextInfoItem, OfficialSource } from "../../types";
import { getContextInfo } from "../../data/nutritionData";

interface ContextInfoCardProps {
  info?: ContextInfoItem;
  id?: string;
  children?: React.ReactNode;
  inlineLabel?: string;
  variant?: "badge" | "link" | "card" | "custom";
  className?: string;
}

export const ContextInfoCard: React.FC<ContextInfoCardProps> = ({
  info: propInfo,
  id,
  children,
  inlineLabel,
  variant = "badge",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const info = propInfo || (id ? getContextInfo(id) : undefined);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!info) {
    return <span>{children || inlineLabel || id}</span>;
  }

  const categoryColors = {
    nutriente: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    fuente_natural: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    mineral: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    fertilizante_generico: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    termino_tecnico: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  };

  const badgeColor = categoryColors[info.category] || categoryColors.nutriente;

  const triggerLabel = children || inlineLabel || info.name;

  return (
    <div
      ref={cardRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Interactive Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        aria-haspopup="dialog"
        aria-expanded={isOpen || isHovered}
        aria-label={`Información botánica sobre ${info.name}`}
        className={`inline-flex items-center gap-1.5 transition-all text-xs font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded-lg ${
          variant === "badge"
            ? `px-2.5 py-1 rounded-full border shadow-sm hover:scale-[1.02] active:scale-95 ${badgeColor}`
            : variant === "link"
            ? "text-emerald-600 dark:text-emerald-400 underline decoration-dotted underline-offset-4 hover:text-emerald-500 font-medium"
            : "text-zinc-800 dark:text-zinc-200 hover:text-emerald-500"
        }`}
      >
        <span>{info.icon}</span>
        <span>{triggerLabel}</span>
        <span className="text-[10px] opacity-70">ℹ️</span>
      </button>

      {/* Desktop Hover Floating Tooltip */}
      {isHovered && !isOpen && (
        <div className="hidden sm:block absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-zinc-900/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-700/60 rounded-xl shadow-2xl text-zinc-100 text-xs pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between gap-2 mb-1.5 pb-1.5 border-b border-zinc-800">
            <div className="flex items-center gap-1.5 font-semibold">
              <span>{info.icon}</span>
              <span>{info.name}</span>
            </div>
            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
              {info.badge}
            </span>
          </div>
          <p className="text-zinc-300 leading-relaxed mb-2">{info.whatIs}</p>
          <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <span>⚡ Función:</span>
            <span className="text-zinc-300 font-normal truncate">{info.purpose}</span>
          </div>
          <div className="mt-2 text-[10px] text-zinc-400 italic">Haz clic para ver ficha completa</div>
        </div>
      )}

      {/* Full Modal / Mobile Bottom Sheet for Tap or Explicit Click */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div
            className="w-full sm:max-w-lg max-h-[85vh] sm:max-h-[80vh] overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-t-2xl sm:rounded-2xl shadow-2xl p-5 sm:p-6 text-zinc-900 dark:text-zinc-100 flex flex-col gap-4 animate-in slide-in-from-bottom duration-250"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                  {info.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{info.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${badgeColor}`}>
                      {info.badge}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Sistema de Conocimiento Cultiva V2</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar ficha"
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="space-y-4 text-xs sm:text-sm">
              {/* Qué es */}
              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-200 flex items-center gap-1.5 mb-1 text-xs">
                  <span>📖</span> ¿Qué es?
                </h4>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">{info.whatIs}</p>
              </div>

              {/* Para qué sirve */}
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-1 text-xs">
                  <span>🌱</span> Función en la Planta
                </h4>
                <p className="text-emerald-900 dark:text-emerald-200/90 leading-relaxed">{info.purpose}</p>
              </div>

              {/* Dónde conseguirlo */}
              {info.whereToFind && (
                <div className="bg-amber-50/50 dark:bg-amber-950/20 p-3.5 rounded-xl border border-amber-100 dark:border-amber-900/30">
                  <h4 className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-1 text-xs">
                    <span>🛒</span> ¿Dónde conseguirlo?
                  </h4>
                  <p className="text-amber-900 dark:text-amber-200/90 leading-relaxed font-medium">
                    {info.whereToFind}
                  </p>
                  <p className="text-[10px] text-amber-700 dark:text-amber-400/80 mt-1 italic">
                    Disponible en viveros, tiendas de jardinería, agropecuarias, insumos agrícolas o tiendas especializadas.
                  </p>
                </div>
              )}

              {/* Contexto de uso y Precauciones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-200 flex items-center gap-1 mb-1 text-xs">
                    <span>⚙️</span> Aplicación
                  </h4>
                  <p className="text-zinc-600 dark:text-zinc-300 text-xs leading-relaxed">{info.usageContext}</p>
                </div>

                <div className="bg-rose-50/40 dark:bg-rose-950/20 p-3 rounded-xl border border-rose-100 dark:border-rose-900/30">
                  <h4 className="font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-1 mb-1 text-xs">
                    <span>⚠️</span> Precauciones
                  </h4>
                  <p className="text-rose-900 dark:text-rose-200/90 text-xs leading-relaxed">{info.precautions}</p>
                </div>
              </div>

              {/* Fuentes verificadas */}
              {info.sources && info.sources.length > 0 && (
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <h4 className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1">
                    <span>📚</span> Fuentes Bibliográficas y Científicas:
                  </h4>
                  <div className="space-y-1">
                    {info.sources.map((src, i) => (
                      <div key={i} className="text-[10px] text-zinc-600 dark:text-zinc-400 flex items-center justify-between gap-2">
                        <span className="font-medium truncate">{src.title} — {src.publisher}</span>
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 dark:text-emerald-400 hover:underline shrink-0"
                        >
                          Consultar ↗
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-all shadow-md shadow-emerald-600/20"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};