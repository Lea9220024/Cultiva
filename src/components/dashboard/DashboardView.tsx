import React, { useState, useMemo } from "react";
import {
  Thermometer,
  Droplets,
  Calendar,
  Camera,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Sprout,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  FlaskConical,
  GraduationCap,
  Bookmark,
  CalendarCheck,
  Settings2,
  Compass,
} from "lucide-react";
import { useCultiva } from "../../context/CultivaContext";
import { CropPassportModal } from "../crops/CropPassportModal";
import { CropDateSettingsModal } from "../crops/CropDateSettingsModal";
import { CropAdjustChronologyModal } from "../crops/CropAdjustChronologyModal";
import { CropCustomStagesModal } from "../crops/CropCustomStagesModal";
import { calculateCropChronology, calculatePlantAge } from "../../utils/dateCalculations";
import { TOP_CROP_SCHEDULES } from "../../data/topCropData";
import { ENCYCLOPEDIA_ARTICLES } from "../../data/encyclopediaData";

export const DashboardView: React.FC = () => {
  const {
    activeCrop,
    activeCropPlants,
    activeCropLogs,
    activeCropFertilizations,
    activeCropTasks,
    activeCropPhotos,
    learningProgress,
    alerts,
    toggleTarea,
    setIsQuickAddOpen,
    setCurrentTab,
    setSelectedPlantIdForModal,
    setIsDateSettingsOpen,
    setIsAdjustChronologyOpen,
    setIsCustomStagesOpen,
    userPreferences,
  } = useCultiva();

  const [isPassportOpen, setIsPassportOpen] = useState(false);

  // V2 Dynamic Chronology derived from dates engine
  const chrono = useMemo(() => {
    if (!activeCrop) return null;
    return calculateCropChronology(activeCrop);
  }, [activeCrop]);

  // Derived Indicators from real user logs
  const latestLog = activeCropLogs[0] || null;
  const latestTempNum = latestLog?.temperature !== undefined ? latestLog.temperature : 24.5;
  const latestHumidityNum = latestLog?.humidity !== undefined ? latestLog.humidity : 62;

  // Real VPD approximation (kPa) based on air temp & RH (assuming leaf temp = air temp - 1.5°C under LED)
  const vpdKpa = useMemo(() => {
    const T = latestTempNum;
    const RH = latestHumidityNum;
    // Saturation vapor pressure at leaf temp (T - 1.5)
    const Tleaf = T - 1.5;
    const vpsatLeaf = 0.61078 * Math.exp((17.27 * Tleaf) / (Tleaf + 237.3));
    // Actual vapor pressure in air
    const vpsatAir = 0.61078 * Math.exp((17.27 * T) / (T + 237.3));
    const vpair = vpsatAir * (RH / 100);
    const vpd = Math.max(0.2, vpsatLeaf - vpair);
    return vpd.toFixed(2);
  }, [latestTempNum, latestHumidityNum]);

  // Nutrition status
  const currentSystem = userPreferences.cultivationSystem || "Tierra";
  const systemSchedule = TOP_CROP_SCHEDULES[currentSystem] || TOP_CROP_SCHEDULES.Tierra;
  // Calculate approximate week from total days
  const currentWeekNumber = Math.min(
    systemSchedule.weeks.length,
    Math.max(1, Math.ceil((chrono?.currentDay || 20) / 7))
  );
  const currentWeekData = systemSchedule.weeks.find((w) => w.weekNumber === currentWeekNumber) || systemSchedule.weeks[0];

  // Contextual learning article for active stage
  const recommendedArticle = useMemo(() => {
    const stage = activeCrop?.stage || "Vegetativo";
    return (
      ENCYCLOPEDIA_ARTICLES.find(
        (a) =>
          a.stageRelation?.some((s) => s.toLowerCase() === stage.toLowerCase()) &&
          !learningProgress.readArticleIds.includes(a.id)
      ) || ENCYCLOPEDIA_ARTICLES[0]
    );
  }, [activeCrop?.stage, learningProgress.readArticleIds]);

  // Last watering & fertilizing
  const lastFertLog = activeCropFertilizations[0] || null;

  // Pending tasks
  const pendingTasks = activeCropTasks.filter((t) => !t.completed);

  // Date formatting
  const todayFormatted = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const capitalizedDate = todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

  if (!activeCrop || !chrono) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-[2rem] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <Sprout className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            No tenés ningún cultivo activo aún
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-sm mx-auto mt-1">
            Comenzá creando tu primer cultivo para dar inicio al seguimiento botánico, tablas de fertilización y cronología.
          </p>
        </div>
        <button
          onClick={() => setIsQuickAddOpen(true, "planta")}
          className="py-3 px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Primer Cultivo</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header of the Bento Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Panel de Control V2
            </h1>
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {userPreferences.knowledgeLevel || "Principiante"}
            </span>
          </div>
          <p className="text-zinc-500 text-xs sm:text-sm">{capitalizedDate}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdjustChronologyOpen(true)}
            className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>⚙️ Ajustar Cronología</span>
          </button>

          <button
            onClick={() => setIsQuickAddOpen(true, "registro")}
            className="text-xs font-bold px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registro Rápido</span>
          </button>
        </div>
      </div>

      {/* Smart Alerts Notice (If any) */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((al) => (
            <div
              key={al.id}
              className={`p-4 rounded-[1.5rem] border flex items-start justify-between gap-3 shadow-2xs ${
                al.type === "urgent"
                  ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200"
                  : al.type === "warning"
                  ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200"
                  : "bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-200"
              }`}
            >
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs sm:text-sm font-bold">{al.title}</div>
                  <div className="text-xs opacity-90 mt-0.5 leading-relaxed">{al.message}</div>
                </div>
              </div>
              {al.actionPath && (
                <button
                  onClick={() => setCurrentTab(al.actionPath as any)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/80 dark:bg-zinc-800 border border-current shadow-2xs shrink-0 self-center hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Ver
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* BENTO GRID (Modular Container) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. MAIN FEATURE CROP BENTO CARD (2 cols x 2 rows on large) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-emerald-600 dark:text-emerald-400 font-bold text-xs tracking-widest uppercase mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Cultivo Activo
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                {activeCrop.name}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                {activeCrop.method} • {activeCrop.space}
              </p>
            </div>

            <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {chrono.currentStageName}
            </span>
          </div>

          {/* Progress bar to harvest */}
          <div className="my-4 space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-zinc-500">Progreso del ciclo ({chrono.progressPercent}%)</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {chrono.daysToHarvest !== null ? `${chrono.daysToHarvest} días a cosecha` : "Etapa en curso"}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${chrono.progressPercent}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full py-2">
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80">
              <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-tighter">
                Día de Ciclo
              </p>
              <p className="text-xl sm:text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
                Día {chrono.currentDay}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80">
              <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-tighter">
                En {chrono.currentStageName}
              </p>
              <p className="text-xl sm:text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">
                {chrono.currentStageDays} d
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80">
              <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-tighter">
                Plantas
              </p>
              <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {activeCropPlants.length < 10 ? `0${activeCropPlants.length}` : activeCropPlants.length}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDateSettingsOpen(true)}
                className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 flex items-center gap-1 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Fechas</span>
              </button>
              <span className="text-zinc-300">•</span>
              <button
                onClick={() => setIsCustomStagesOpen(true)}
                className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 flex items-center gap-1 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Etapas</span>
              </button>
            </div>

            <button
              onClick={() => setIsPassportOpen(true)}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Ver Pasaporte</span>
              <span>➔</span>
            </button>
          </div>
        </div>

        {/* 2. TEMPERATURE & VPD SQUARE BENTO CARD */}
        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-orange-50 dark:bg-orange-950/40 rounded-2xl flex items-center justify-center text-xl shadow-2xs">
              🌡️
            </div>
            <span className="text-orange-500 font-mono text-xs font-bold bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-full">
              {latestLog?.temperature ? `${latestTempNum}°C` : "24.2°C"}
            </span>
          </div>
          <div className="mt-2 space-y-1">
            <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
              VPD: {vpdKpa} <span className="text-xs text-zinc-400 font-normal">kPa</span>
            </div>
            <p className="text-zinc-400 text-[11px] font-medium uppercase tracking-wider">
              {Number(vpdKpa) >= 0.8 && Number(vpdKpa) <= 1.2
                ? "🟢 Transpiración Óptima"
                : "🟡 En observación"}
            </p>
          </div>
        </div>

        {/* 3. HUMIDITY & WATERING SQUARE BENTO CARD */}
        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/40 rounded-2xl flex items-center justify-center text-xl shadow-2xs">
              💧
            </div>
            <span className="text-blue-500 font-mono text-xs font-bold bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full">
              {latestHumidityNum}% HR
            </span>
          </div>
          <div className="mt-2 space-y-1">
            <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">
              {lastFertLog ? `${lastFertLog.productName} (${lastFertLog.doseMlPerL} ml/L)` : "Solo agua"}
            </div>
            <p className="text-zinc-400 text-[11px] font-medium uppercase tracking-wider">
              Último fertirriego: {lastFertLog ? lastFertLog.date : "Reciente"}
            </p>
          </div>
        </div>

        {/* 4. TOP CROP NUTRITION BENTO CARD (1 col x 2 rows) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-1 row-span-2 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  Nutrición {currentSystem}
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                Semana {currentWeekNumber}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 space-y-2">
              <div className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
                {currentWeekData.phase}
              </div>
              <div className="space-y-1">
                {currentWeekData.dosages.slice(0, 3).map((d) => (
                  <div key={d.productId} className="flex justify-between text-xs">
                    <span className="text-zinc-600 dark:text-zinc-400 truncate max-w-[110px]">
                      {d.productName}
                    </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {d.doseMlPerL} ml/L
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              onClick={() => setCurrentTab("nutrition")}
              className="w-full py-2.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Ver Tabla Completa</span>
            </button>
          </div>
        </div>

        {/* 5. EDUCATIONAL LEARNING BENTO CARD (2 cols span) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Aprendizaje Botánico • Sugerencia para {activeCrop.stage}
              </h3>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">
              {learningProgress.readArticleIds.length} / {ENCYCLOPEDIA_ARTICLES.length} leídos
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs">{recommendedArticle.categoryIcon}</span>
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {recommendedArticle.title}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                {recommendedArticle.summary}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-zinc-400 font-mono">
              ⏱️ {recommendedArticle.readTimeMinutes} min de lectura
            </span>
            <button
              onClick={() => setCurrentTab("encyclopedia")}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Abrir en Enciclopedia</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 6. TASKS BENTO CARD */}
        <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <span>📅</span>
                <span>Tareas ({pendingTasks.length})</span>
              </h3>
              <button
                onClick={() => setIsQuickAddOpen(true, "tarea")}
                className="text-[11px] text-emerald-600 font-bold hover:underline cursor-pointer"
              >
                + Nueva
              </button>
            </div>

            <div className="space-y-2">
              {activeCropTasks.slice(0, 2).map((task) => (
                <div
                  key={task.id}
                  className={`flex items-start gap-2.5 text-xs ${
                    task.completed ? "opacity-40" : ""
                  }`}
                >
                  <button
                    onClick={() => toggleTarea(task.id)}
                    className="mt-0.5 shrink-0 cursor-pointer"
                  >
                    {task.completed ? (
                      <div className="w-4 h-4 bg-emerald-500 rounded flex items-center justify-center text-white text-[9px] font-bold">
                        ✓
                      </div>
                    ) : (
                      <div className="w-4 h-4 border border-zinc-400 rounded hover:border-emerald-500"></div>
                    )}
                  </button>
                  <span className={`truncate ${task.completed ? "line-through text-zinc-400" : "text-zinc-800 dark:text-zinc-200"}`}>
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setCurrentTab("tasks")}
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:underline"
            >
              Ver todas las tareas ➔
            </button>
          </div>
        </div>
      </div>

      {/* ACTIVE PLANTS BENTO SECTION */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>🌱</span>
              <span>Plantas del Cultivo ({activeCropPlants.length})</span>
            </h2>
            <p className="text-xs text-zinc-500">
              Selecciona un ejemplar para ver su expediente y fotografías
            </p>
          </div>
          <button
            onClick={() => setCurrentTab("crops")}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Ver Inventario Completo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeCropPlants.map((plant, index) => {
            const plantLogs = activeCropLogs.filter((l) => l.plantaId === plant.id);
            const plantPhotos = activeCropPhotos.filter((p) => p.plantaId === plant.id);
            const plantAge = calculatePlantAge(plant, activeCrop);

            return (
              <div
                key={plant.id}
                onClick={() => setSelectedPlantIdForModal(plant.id)}
                className="p-5 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs hover:border-emerald-500 cursor-pointer transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="flex space-x-3.5 items-start">
                  <img
                    src={plant.image}
                    alt={plant.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0 group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">
                        #{index + 1}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-semibold">
                        {plant.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate mt-0.5">
                      {plant.name}
                    </h3>
                    <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                      Día en planta: <strong className="text-emerald-600 dark:text-emerald-400">{plantAge.plantDayNumber}</strong>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-center font-mono">
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 p-1.5 rounded-xl">
                    <span className="text-[9px] uppercase text-zinc-400 block">Altura</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {plant.heightCm ? `${plant.heightCm} cm` : "—"}
                    </span>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 p-1.5 rounded-xl">
                    <span className="text-[9px] uppercase text-zinc-400 block">Fotos</span>
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      {plantPhotos.length}
                    </span>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 p-1.5 rounded-xl">
                    <span className="text-[9px] uppercase text-zinc-400 block">Registros</span>
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      {plantLogs.length}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Date Settings Modal */}
      <CropDateSettingsModal />

      {/* Adjust Chronology Modal */}
      <CropAdjustChronologyModal />

      {/* Custom Stages Modal */}
      <CropCustomStagesModal />

      {/* Passport Modal */}
      {isPassportOpen && (
        <CropPassportModal
          crop={activeCrop}
          plants={activeCropPlants}
          logs={activeCropLogs}
          photos={activeCropPhotos}
          onClose={() => setIsPassportOpen(false)}
        />
      )}
    </div>
  );
};
