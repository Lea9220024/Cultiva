import React, { useRef } from "react";
import {
  Settings,
  ShieldCheck,
  Download,
  Upload,
  Trash2,
  Award,
  Sun,
  Moon,
  Database,
  FileSpreadsheet,
  RotateCcw,
  Sparkles,
  GraduationCap,
  FlaskConical,
  Check,
  HelpCircle,
} from "lucide-react";
import { useCultiva } from "../../context/CultivaContext";
import {
  exportToJSON,
  exportAllLogsToCSV,
  exportPlantsToCSV,
} from "../../utils/exportUtils";
import { ArticleLevel } from "../../types";
import { usePWA } from "../../hooks/usePWA";
import { Smartphone, CheckCircle2, RefreshCw } from "lucide-react";

export const SettingsView: React.FC = () => {
  const {
  cultivos,
  plantas,
  registros,
  fertilizaciones,
  tareas,
  fotos,
  achievements,
  learningProgress,
  userPreferences,
  toggleTheme,
  updateKnowledgeLevel,
  updateCultivationSystem,
  loadDemoData,
} = useCultiva();

const {
    isInstallable,
    isInstalled,
    isOnline,
    hasUpdate,
    installApp,
    applyUpdate,
  } = usePWA();

  const [cacheCleared, setCacheCleared] = React.useState(false);

  const handleClearCache = async () => {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      setCacheCleared(true);
      setTimeout(() => setCacheCleared(false), 3000);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    exportToJSON({
      cultivos,
      plantas,
      registros,
      fertilizaciones,
      tareas,
      fotos,
      learningProgress,
      userPreferences,
      exportedAt: new Date().toISOString(),
    });
  };

  const handleExportLogsCSV = () => {
    exportAllLogsToCSV(registros);
  };

  const handleExportPlantsCSV = () => {
    exportPlantsToCSV(plantas);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        if (data.cultivos && data.plantas) {
          localStorage.setItem("cultiva_cultivos_v2", JSON.stringify(data.cultivos));
          localStorage.setItem("cultiva_plantas_v2", JSON.stringify(data.plantas));
          if (data.registros) localStorage.setItem("cultiva_registros_v2", JSON.stringify(data.registros));
          if (data.fertilizaciones) localStorage.setItem("cultiva_fertilizaciones_v2", JSON.stringify(data.fertilizaciones));
          if (data.tareas) localStorage.setItem("cultiva_tareas_v2", JSON.stringify(data.tareas));
          if (data.fotos) localStorage.setItem("cultiva_fotos_v2", JSON.stringify(data.fotos));
          if (data.learningProgress) localStorage.setItem("cultiva_learning_v2", JSON.stringify(data.learningProgress));
          window.location.reload();
        } else {
          alert("El archivo no posee una estructura válida de Cultiva V2.");
        }
      } catch (err) {
        alert("Error al procesar el archivo JSON.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          Ajustes, Preferencias y Datos V2
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500">
          Control de privacidad, nivel de conocimiento botánico, tablas de fertilización y copias de seguridad
        </p>
      </div>

      {/* Bento Grid Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Educational & Knowledge Level (V2) */}
        <div className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2.5 text-emerald-600 dark:text-emerald-400">
            <GraduationCap className="w-5 h-5" />
            <h2 className="text-sm font-bold uppercase tracking-wider font-mono">
              Nivel de Experiencia Botánica
            </h2>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Adapta la profundidad técnica de la Enciclopedia, las recomendaciones de riego y las sugerencias del Copiloto IA.
          </p>

          <div className="grid grid-cols-3 gap-2 pt-1">
            {(["Principiante", "Intermedio", "Avanzado"] as ArticleLevel[]).map((lvl) => {
              const isSelected = userPreferences.knowledgeLevel === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => updateKnowledgeLevel(lvl)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-2xs"
                      : "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100"
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-zinc-400 font-mono">
            📖 Artículos leídos: {learningProgress.readArticleIds.length} • Favoritos: {learningProgress.favoriteArticleIds.length}
          </div>
        </div>

        {/* 2. Cultivation System & Top Crop Default (V2) */}
        <div className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2.5 text-emerald-600 dark:text-emerald-400">
            <FlaskConical className="w-5 h-5" />
            <h2 className="text-sm font-bold uppercase tracking-wider font-mono">
              Sistema Nutricional Predeterminado
            </h2>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Define la tabla oficial Top Crop activa para sugerencias semanales y cálculos automáticos de mililitros.
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {(["Tierra", "Coco", "Hidroponia", "Auto"] as const).map((sys) => {
              const isSelected = userPreferences.cultivationSystem === sys;
              return (
                <button
                  key={sys}
                  onClick={() => updateCultivationSystem(sys)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-2xs"
                      : "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100"
                  }`}
                >
                  {sys}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Privacy Guarantee */}
        <div className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2.5 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
            <h2 className="text-sm font-bold uppercase tracking-wider font-mono">
              Arquitectura de Privacidad
            </h2>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Cultiva opera bajo el principio de <strong>soberanía de datos</strong>. Todas tus fotos, notas, riegos, dosis y pasaportes se almacenan <strong>localmente en tu navegador</strong>.
          </p>
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-[11px] text-zinc-500 font-mono">
            💾 {registros.length} bitácoras, {fertilizaciones.length} fertirriegos y {fotos.length} fotos guardadas localmente.
          </div>
        </div>

        {/* 4. Theme Preferences */}
        <div className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2.5 text-zinc-800 dark:text-zinc-200">
            {userPreferences.theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            <h2 className="text-sm font-bold uppercase tracking-wider font-mono">
              Tema y Apariencia
            </h2>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Alterna entre modo luminoso de alto contraste o modo noche oscuro para revisión bajo carpas.
          </p>
          <button
            onClick={toggleTheme}
            className="w-full py-2.5 px-4 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {userPreferences.theme === "dark" ? (
              <>
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Cambiar a Modo Día (Light)</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-zinc-600" />
                <span>Cambiar a Modo Noche (Dark)</span>
              </>
            )}
          </button>
        </div>

        {/* 5. Progressive Web App (PWA) & Android Installation (Spans 2 cols) */}
        <div className="md:col-span-2 p-6 sm:p-8 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>Aplicación Web Progresiva (PWA Android)</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    {isInstalled ? "🟢 Instalada" : "📲 Lista para Instalar"}
                  </span>
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Ejecuta Cultiva como una app nativa en tu teléfono Android con soporte offline completo
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isInstallable && !isInstalled && (
                <button
                  onClick={installApp}
                  className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Instalar en este Teléfono</span>
                </button>
              )}

              {hasUpdate && (
                <button
                  onClick={applyUpdate}
                  className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Actualizar Versión</span>
                </button>
              )}
            </div>
          </div>

          {/* Android Installation Instructions Guide */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-[11px] font-mono">1</span>
                <span>Abre en Chrome Android</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Navega a la URL de tu aplicación desde Google Chrome en tu smartphone.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-[11px] font-mono">2</span>
                <span>Toca el Menú ⋮ de Chrome</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Presiona los 3 puntos superiores y selecciona <strong>&quot;Instalar aplicación&quot;</strong> o <strong>&quot;Agregar a la pantalla principal&quot;</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-[11px] font-mono">3</span>
                <span>¡Listo! Acceso Instantáneo</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                El ícono de Cultiva aparecerá en tu cajón de apps de Android con pantalla completa y sin barra de navegador.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
            <div className="text-zinc-500 text-[11px] flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Service Worker activo (v2.1.0) • Almacenamiento local precacheado</span>
            </div>

            <button
              onClick={handleClearCache}
              className="text-[11px] font-semibold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 underline cursor-pointer"
            >
              {cacheCleared ? "✅ Caché eliminada" : "Vaciar Caché Offline"}
            </button>
          </div>
        </div>

        {/* 6. Export & Backup Section (Spans 2 cols) */}
        <div className="md:col-span-2 p-6 sm:p-8 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-500" />
              <span>Copias de Seguridad y Portabilidad de Datos V2</span>
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Exporta tu bitácora completa en formato JSON universal o CSV para hojas de cálculo
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={handleExportJSON}
              className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-left transition-colors cursor-pointer space-y-1"
            >
              <Download className="w-4 h-4 text-emerald-500 mb-2" />
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Exportar Backup JSON
              </div>
              <div className="text-[10px] text-zinc-500">
                Guarda todos los cultivos, cronologías, fertilizaciones y fotos.
              </div>
            </button>

            <button
              onClick={handleExportLogsCSV}
              className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-left transition-colors cursor-pointer space-y-1"
            >
              <FileSpreadsheet className="w-4 h-4 text-teal-500 mb-2" />
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Exportar Bitácora CSV
              </div>
              <div className="text-[10px] text-zinc-500">
                Tabla de registros cronológicos con temperaturas, humedad, pH y EC.
              </div>
            </button>

            <button
              onClick={handleExportPlantsCSV}
              className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-left transition-colors cursor-pointer space-y-1"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-500 mb-2" />
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Exportar Plantas CSV
              </div>
              <div className="text-[10px] text-zinc-500">
                Inventario de plantas con genética, alturas registradas y estados.
              </div>
            </button>
          </div>

          {/* Import Backup */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                Restaurar Copia de Seguridad
              </div>
              <div className="text-[11px] text-zinc-500">
                Carga un archivo JSON de Cultiva para reponer tu bitácora
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs flex items-center gap-2 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Importar Backup JSON</span>
            </button>
          </div>
        </div>

        {/* 6. Gamification & Badges Showcase */}
        <div className="md:col-span-2 p-6 sm:p-8 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Logros y Medallas del Cultivador</span>
              </h2>
              <p className="text-xs text-zinc-500">
                Hitos botánicos y de constancia desbloqueados
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/50">
              {achievements.filter((a) => a.unlocked).length} / {achievements.length} Desbloqueados
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={`p-3.5 rounded-2xl border flex items-center space-x-3 transition-all ${
                  ach.unlocked
                    ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60"
                    : "bg-zinc-50/60 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 opacity-60 grayscale"
                }`}
              >
                <div className="text-2xl">{ach.icon}</div>
                <div className="flex-1 overflow-hidden">
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    {ach.title}
                  </div>
                  <div className="text-[10px] text-zinc-500 leading-tight mt-0.5">
                    {ach.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Danger Zone / Reset */}
        <div className="md:col-span-2 p-6 rounded-[2rem] bg-rose-50/30 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-rose-800 dark:text-rose-300">
              Zona de Restauración y Demostración
            </div>
            <div className="text-[11px] text-zinc-500">
              Puedes recargar los datos botánicos de ejemplo o borrar todo para comenzar un cultivo nuevo.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm("¿Cargar datos botánicos de demostración?")) {
                  loadDemoData();
                }
              }}
              className="px-3.5 py-1.5 rounded-full bg-white dark:bg-zinc-800 hover:bg-zinc-100 text-zinc-800 dark:text-zinc-200 font-semibold text-xs border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 inline mr-1 text-emerald-500" />
              Cargar Demo
            </button>

            <button
              onClick={() => {
                if (confirm("¿Seguro que deseas eliminar TODOS los datos locales? Esta acción es irreversible.")) {
                  clearAllData();
                }
              }}
              className="px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3 inline mr-1" />
              Borrar Todo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
