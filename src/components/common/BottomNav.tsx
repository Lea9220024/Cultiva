import React from "react";
import {
  Home,
  Sprout,
  FlaskConical,
  GraduationCap,
  BookOpen,
  Plus,
} from "lucide-react";
import { useCultiva, NavTab } from "../../context/CultivaContext";

export const BottomNav: React.FC = () => {
  const { currentTab, setCurrentTab, setIsQuickAddOpen } = useCultiva();

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Inicio", icon: <Home className="w-5 h-5" /> },
    { id: "crops", label: "Cultivo", icon: <Sprout className="w-5 h-5" /> },
    { id: "nutrition", label: "Nutrición", icon: <FlaskConical className="w-5 h-5" /> },
    { id: "encyclopedia", label: "Enciclopedia", icon: <GraduationCap className="w-5 h-5" /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 pb-safe">
      <div className="flex items-center justify-around h-16 relative px-2">
        {navItems.slice(0, 2).map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center h-full py-1 transition-colors ${
                isActive
                  ? "text-emerald-600 dark:text-emerald-400 font-bold"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <div className={`transition-transform duration-200 ${isActive ? "scale-110" : ""}`}>
                {item.icon}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
            </button>
          );
        })}

        {/* Center Floating Plus Button */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            onClick={() => setIsQuickAddOpen(true)}
            aria-label="Registro rápido"
            className="w-13 h-13 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/40 hover:scale-105 active:scale-95 transition-all border-4 border-white dark:border-zinc-900 cursor-pointer"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {navItems.slice(2).map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center h-full py-1 transition-colors ${
                isActive
                  ? "text-emerald-600 dark:text-emerald-400 font-bold"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <div className={`transition-transform duration-200 ${isActive ? "scale-110" : ""}`}>
                {item.icon}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
