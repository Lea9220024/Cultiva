import React from "react";
import {
  Sprout,
  Sun,
  Moon,
  Search,
  Plus,
  Sparkles,
  ChevronDown,
  Calendar,
} from "lucide-react";
import { useCultiva } from "../../context/CultivaContext";

export const Header: React.FC = () => {
  const {
    cultivos,
    activeCrop,
    setActiveCropId,
    userPreferences,
    toggleTheme,
    setIsQuickAddOpen,
    setIsSearchOpen,
    setCurrentTab,
  } = useCultiva();

  const todayFormatted = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const capitalizedDate = todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand & Crop Selector */}
        <div className="flex items-center space-x-3">
          <div
            onClick={() => setCurrentTab("dashboard")}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-sm shadow-emerald-600/30 group-hover:scale-105 transition-transform">
              C
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Cultiva
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                Bento
              </span>
            </div>
          </div>

          {/* Active Crop Dropdown Pill */}
          {cultivos.length > 0 && (
            <div className="relative group ml-2">
              <select
                aria-label="Seleccionar cultivo activo"
                value={activeCrop?.id || ""}
                onChange={(e) => setActiveCropId(e.target.value)}
                className="appearance-none text-xs font-semibold pl-3.5 pr-8 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                {cultivos.map((crop) => (
                  <option key={crop.id} value={crop.id}>
                    🌱 {crop.name} {crop.status === "archivado" ? "(Archivado)" : `(${crop.stage})`}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Global Search Bar & Bento Day/Night Pill + Round Action */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Quick Search trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center space-x-2 text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800/80 hover:text-zinc-700 dark:hover:text-zinc-200 px-3.5 py-2 rounded-full border border-zinc-200/80 dark:border-zinc-700/50 transition-colors"
            title="Buscar en Cultiva (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Buscar registros, plantas...</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-zinc-700 text-zinc-500 dark:text-zinc-300 rounded-full border border-zinc-200 dark:border-zinc-600 shadow-2xs">
              ⌘K
            </kbd>
          </button>

          {/* Bento Day / Night Segmented Toggle */}
          <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-full border border-zinc-200 dark:border-zinc-700 p-1">
            <button
              onClick={() => userPreferences.theme !== "light" && toggleTheme()}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all flex items-center gap-1 ${
                userPreferences.theme === "light"
                  ? "bg-zinc-900 text-white shadow-2xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <Sun className="w-3 h-3" />
              <span>Día</span>
            </button>
            <button
              onClick={() => userPreferences.theme !== "dark" && toggleTheme()}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all flex items-center gap-1 ${
                userPreferences.theme === "dark"
                  ? "bg-zinc-900 text-white shadow-2xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <Moon className="w-3 h-3" />
              <span>Noche</span>
            </button>
          </div>

          {/* Bento Round Add Button */}
          <button
            onClick={() => setIsQuickAddOpen(true)}
            aria-label="Nuevo registro rápido"
            className="w-10 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg shadow-emerald-200 dark:shadow-emerald-950/50 active:scale-95 transition-all cursor-pointer"
          >
            +
          </button>
        </div>
      </div>
    </header>
  );
};
