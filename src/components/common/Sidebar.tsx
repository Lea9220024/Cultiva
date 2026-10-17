import React from "react";
import { useCultiva, NavTab } from "../../context/CultivaContext";

export const Sidebar: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    activeCropPlants,
    activeCropLogs,
    activeCropFertilizations,
    learningProgress,
  } = useCultiva();

  const mainNav: { id: NavTab; label: string; icon: string; badge?: string | number }[] = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "crops", label: "Cultivos & Plantas", icon: "🌱", badge: activeCropPlants.length },
    { id: "diary", label: "Diario de Cultivo", icon: "📖", badge: activeCropLogs.length },
    { id: "nutrition", label: "Nutrición Top Crop", icon: "🧪", badge: activeCropFertilizations.length },
    { id: "encyclopedia", label: "Enciclopedia", icon: "📚", badge: `${learningProgress.readArticleIds.length}/11` },
    { id: "tasks", label: "Tareas & Calendario", icon: "📅" },
    { id: "photos", label: "Galería & Evolución", icon: "🖼️" },
  ];

  const secondaryNav: { id: NavTab; label: string; icon: string }[] = [
    { id: "settings", label: "Ajustes & Parámetros", icon: "⚙️" },
  ];

  return (
    <aside className="hidden md:flex md:w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex-col p-5 justify-between h-[calc(100vh-4.5rem)] sticky top-18 select-none overflow-y-auto">
      <div className="space-y-5">
        {/* Navigation List */}
        <nav className="space-y-1">
          {mainNav.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-medium text-xs transition-colors cursor-pointer ${
                  isActive
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold shadow-2xs"
                    : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Secondary section */}
        <div className="pt-2 space-y-1 border-t border-zinc-100 dark:border-zinc-800">
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
            Configuración
          </div>
          {secondaryNav.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-2xl font-medium text-xs transition-colors cursor-pointer ${
                  isActive
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold"
                    : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

    </aside>
  );
};
