import React, { useState, useRef, useEffect } from "react";
import {
  Sprout,
  Sun,
  Moon,
  Search,
  Plus,
  Sparkles,
  ChevronDown,
  User,
  LogOut,
  Settings,
  Cloud,
  ShieldCheck,
} from "lucide-react";
import { useCultiva } from "../../context/CultivaContext";
import { useAuth } from "../../context/AuthContext";

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

  const {
    user,
    profile,
    isAuthenticated,
    setIsAuthModalOpen,
    signOut,
  } = useAuth();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = profile?.displayName || user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Cultivador";
  const initials = displayName.slice(0, 2).toUpperCase();

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

        {/* Action Controls & Auth User Pill */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* Quick Search trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center space-x-2 text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800/80 hover:text-zinc-700 dark:hover:text-zinc-200 px-3.5 py-2 rounded-full border border-zinc-200/80 dark:border-zinc-700/50 transition-colors"
            title="Buscar en Cultiva (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Buscar...</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-zinc-700 text-zinc-500 dark:text-zinc-300 rounded-full border border-zinc-200 dark:border-zinc-600 shadow-2xs">
              ⌘K
            </kbd>
          </button>

          {/* Bento Day / Night Segmented Toggle */}
          <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-full border border-zinc-200 dark:border-zinc-700 p-1">
            <button
              onClick={() => userPreferences.theme !== "light" && toggleTheme()}
              className={`px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-full transition-all flex items-center gap-1 ${
                userPreferences.theme === "light"
                  ? "bg-zinc-900 text-white shadow-2xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <Sun className="w-3 h-3" />
              <span className="hidden sm:inline">Día</span>
            </button>
            <button
              onClick={() => userPreferences.theme !== "dark" && toggleTheme()}
              className={`px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-full transition-all flex items-center gap-1 ${
                userPreferences.theme === "dark"
                  ? "bg-zinc-900 text-white shadow-2xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <Moon className="w-3 h-3" />
              <span className="hidden sm:inline">Noche</span>
            </button>
          </div>

          {/* User Auth Section */}
          {!isAuthenticated ? (
            <button
              onClick={() => setIsAuthModalOpen(true, "login")}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200/80 dark:border-emerald-800/60 transition-all cursor-pointer shadow-2xs"
              title="Iniciar sesión en Cultiva Cloud"
            >
              <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Ingresar</span>
            </button>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 pl-2.5 pr-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
              >
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 max-w-[100px] truncate hidden md:inline">
                  {displayName}
                </span>
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={displayName}
                    className="w-7 h-7 rounded-full object-cover border border-emerald-500/40"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shadow-xs">
                    {initials}
                  </div>
                )}
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {/* User Dropdown Popover */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {displayName}
                    </p>
                    <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Sesión activa</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentTab("settings");
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-left"
                  >
                    <Settings className="w-4 h-4 text-zinc-400" />
                    <span>Mi Perfil & Ajustes</span>
                  </button>

                  <button
                    onClick={async () => {
                      setIsUserMenuOpen(false);
                      await signOut();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer text-left mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Bento Round Add Button */}
          <button
            onClick={() => setIsQuickAddOpen(true)}
            aria-label="Nuevo registro rápido"
            className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer"
          >
            +
          </button>
        </div>
      </div>
    </header>
  );
};