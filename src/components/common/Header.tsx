import React from "react";
import {
  Sprout,
  Sun,
  Moon,
  Search,
  Plus,
  Settings,
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
  } = useCultiva();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[4.5rem] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setCurrentTab("dashboard")}
            className="flex items-center gap-2.5 shrink-0"
            aria-label="Ir al inicio de Cultiva"
          >
            <span className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-sm shadow-emerald-600/30">
              <Sprout className="w-5 h-5" />
            </span>
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Cultiva</span>
          </button>

          {cultivos.length > 0 && (
            <div className="relative min-w-0">
              <select
                aria-label="Seleccionar cultivo activo"
                value={activeCrop?.id || ""}
                onChange={(event) => setActiveCropId(event.target.value)}
                className="max-w-[9rem] sm:max-w-[14rem] appearance-none text-xs font-semibold pl-3 pr-7 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                {cultivos.map((crop) => (
                  <option key={crop.id} value={crop.id}>{crop.name}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500">⌄</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            aria-label="Buscar en Cultiva"
            title="Buscar"
            className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={userPreferences.theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
            title={userPreferences.theme === "dark" ? "Tema oscuro" : "Tema claro"}
            className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {userPreferences.theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab("settings")}
            aria-label="Abrir ajustes"
            title="Ajustes"
            className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsQuickAddOpen(true)}
            aria-label="Nuevo registro rápido"
            title="Nuevo registro"
            className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
