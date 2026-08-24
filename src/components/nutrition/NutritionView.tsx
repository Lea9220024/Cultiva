import React, { useState } from "react";
import {
  FlaskConical,
  Calendar as CalendarIcon,
  Calculator,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  Info,
  Droplets,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Bookmark,
  TrendingUp,
  ShieldAlert,
  Leaf,
  Trash2,
  Edit3,
  BookOpen,
  Package,
  HelpCircle,
} from "lucide-react";
import { useCultiva } from "../../context/CultivaContext";
import {
  NUTRIENTS,
  NATURAL_SOURCES,
  MINERAL_SOURCES,
  GENERIC_FERTILIZERS,
  DEFICIENCY_GUIDES,
  NUTRITION_SCHEDULES,
  getContextInfo,
  getNutrientById,
} from "../../data/nutritionData";
import { ContextInfoCard } from "../common/ContextInfoCard";
import { UserFertilizer, CultivationSystem, FertilizationLog, Nutrient, NaturalSource, DeficiencyGuide } from "../../types";

export const NutritionView: React.FC = () => {
  const {
    activeCrop,
    activeCropFertilizations,
    userFertilizers,
    addUserFertilizer,
    updateUserFertilizer,
    deleteUserFertilizer,
    addFertilizationLog,
    deleteFertilizationLog,
    userPreferences,
    updatePreferences,
  } = useCultiva();

  const [activeSubTab, setActiveSubTab] = useState<"tablas" | "biblioteca" | "mis_productos" | "calculadora" | "historial">("tablas");
  const [selectedSystem, setSelectedSystem] = useState<string>(
    userPreferences.cultivationSystem || "Tierra"
  );
  const [selectedWeek, setSelectedWeek] = useState<number>(3);

  // Library state
  const [libCategory, setLibCategory] = useState<"todos" | "macronutrientes" | "micronutrientes" | "naturales" | "minerales" | "deficiencias">("todos");
  const [libSearch, setLibSearch] = useState<string>("");

  // Mis Fertilizantes modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<Omit<UserFertilizer, "id" | "createdAt">>({
    name: "",
    brand: "",
    npk: "",
    form: "Líquido",
    targetPhase: "Vegetativo",
    nutrientsAdditional: "",
    manufacturerDose: "2 ml / L",
    manufacturerFrequency: "1 vez por semana",
    applicationMethod: "Riego a sustrato",
    notes: "",
  });

  // Decoupled Calculator State
  const [calcWaterVolume, setCalcWaterVolume] = useState<number>(2.0);
  const [calcItems, setCalcItems] = useState<{ id: string; name: string; dosePerLiter: number; unit: "ml/L" | "g/L" }[]>([
    { id: "item-1", name: "Abono Base Crecimiento", dosePerLiter: 2.0, unit: "ml/L" },
  ]);
  const [calcSelectedUserFertId, setCalcSelectedUserFertId] = useState<string>("");
  const [calcNotes, setCalcNotes] = useState<string>("");
  const [calcSuccessMsg, setCalcSuccessMsg] = useState<string | null>(null);

  const availableSchedules = NUTRITION_SCHEDULES;
  const currentSchedule = availableSchedules[selectedSystem] || availableSchedules.Tierra;
  const currentWeekData = currentSchedule.weeks.find((w) => w.weekNumber === selectedWeek) || currentSchedule.weeks[0];

  const handleSystemChange = (sys: string) => {
    setSelectedSystem(sys);
    updatePreferences({ cultivationSystem: sys as CultivationSystem });
  };

  // Mis Fertilizantes Actions
  const handleOpenNewProduct = () => {
    setEditingProductId(null);
    setProductForm({
      name: "",
      brand: "",
      npk: "",
      form: "Líquido",
      targetPhase: "Vegetativo",
      nutrientsAdditional: "",
      manufacturerDose: "2 ml / L",
      manufacturerFrequency: "1 vez por semana",
      applicationMethod: "Riego a sustrato",
      notes: "",
    });
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (prod: UserFertilizer) => {
    setEditingProductId(prod.id);
    setProductForm({
      name: prod.name,
      brand: prod.brand || "",
      npk: prod.npk || "",
      form: prod.form,
      targetPhase: prod.targetPhase,
      nutrientsAdditional: prod.nutrientsAdditional || "",
      manufacturerDose: prod.manufacturerDose || "2 ml / L",
      manufacturerFrequency: prod.manufacturerFrequency || "1 vez por semana",
      applicationMethod: prod.applicationMethod,
      notes: prod.notes || "",
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim()) return;

    if (editingProductId) {
      updateUserFertilizer(editingProductId, productForm);
    } else {
      addUserFertilizer(productForm);
    }
    setIsProductModalOpen(false);
  };

  // Calculator Actions
  const handleAddUserFertToCalc = (fertId: string) => {
    const fert = userFertilizers.find((f) => f.id === fertId);
    if (!fert) return;

    const parsedNum = parseFloat(fert.manufacturerDose || "2") || 2.0;
    const isGram = (fert.manufacturerDose || "").toLowerCase().includes("g");

    setCalcItems((prev) => [
      ...prev,
      {
        id: "calc-" + Date.now(),
        name: fert.name + " (" + (fert.brand || "Propio") + ")",
        dosePerLiter: parsedNum,
        unit: isGram ? "g/L" : "ml/L",
      },
    ]);
    setCalcSelectedUserFertId("");
  };

  const handleAddGenericToCalc = (name: string, defaultDose: number, unit: "ml/L" | "g/L" = "ml/L") => {
    setCalcItems((prev) => [
      ...prev,
      {
        id: "calc-" + Date.now(),
        name,
        dosePerLiter: defaultDose,
        unit,
      },
    ]);
  };

  const handleRemoveCalcItem = (id: string) => {
    setCalcItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateItemDose = (id: string, dose: number) => {
    setCalcItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, dosePerLiter: Math.max(0, dose) } : item))
    );
  };

  const handleLogFromCalculator = () => {
    if (!activeCrop) {
      alert("Debes tener un cultivo activo seleccionado para registrar la fertilización.");
      return;
    }
    if (calcItems.length === 0) {
      alert("Agrega al menos un producto a la mezcla.");
      return;
    }

    calcItems.forEach((item) => {
      const totalAmount = Math.round(item.dosePerLiter * calcWaterVolume * 10) / 10;
      addFertilizationLog({
        cultivoId: activeCrop.id,
        date: new Date().toISOString().split("T")[0],
        productId: item.id,
        productName: item.name,
        fertilizerType: "custom",
        volumeWaterLiters: calcWaterVolume,
        doseMlPerL: item.dosePerLiter,
        totalProductMl: totalAmount,
        stage: activeCrop.stage,
        notes: calcNotes ? "[Calculadora Cultiva V2] " + calcNotes : "[Calculadora Cultiva V2]",
      });
    });

    setCalcSuccessMsg("¡Fertirriego registrado exitosamente en el diario del cultivo!");
    setTimeout(() => setCalcSuccessMsg(null), 4000);
  };

  // Filter library items
  const filteredNutrients = NUTRIENTS.filter((n) => {
    const matchSearch = n.name.toLowerCase().includes(libSearch.toLowerCase()) || n.shortDescription.toLowerCase().includes(libSearch.toLowerCase());
    if (libCategory === "macronutrientes") return matchSearch && (n.category === "macronutriente_primario" || n.category === "macronutriente_secundario");
    if (libCategory === "micronutrientes") return matchSearch && n.category === "micronutriente";
    if (libCategory === "todos") return matchSearch;
    return false;
  });

  const filteredNaturalSources = NATURAL_SOURCES.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(libSearch.toLowerCase()) || s.description.toLowerCase().includes(libSearch.toLowerCase());
    return (libCategory === "todos" || libCategory === "naturales") && matchSearch;
  });

  const filteredMineralSources = MINERAL_SOURCES.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(libSearch.toLowerCase()) || m.description.toLowerCase().includes(libSearch.toLowerCase());
    return (libCategory === "todos" || libCategory === "minerales") && matchSearch;
  });

  const filteredDeficiencies = DEFICIENCY_GUIDES.filter((d) => {
    const matchSearch = d.nutrientName.toLowerCase().includes(libSearch.toLowerCase()) || d.visualDescription.toLowerCase().includes(libSearch.toLowerCase());
    return (libCategory === "todos" || libCategory === "deficiencias") && matchSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-900/30 p-5 sm:p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider">
              Cultiva V2 • Nutrición Botánica
            </span>
            <span className="text-xs text-zinc-400">Independiente de marcas</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-emerald-400" />
            Sistema de Nutrición y Fertilidad
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            Comprende los requerimientos bioquímicos de la planta por fase, fuentes naturales, minerales y gestiona tus propios fertilizantes sin recetas rígidas.
          </p>
        </div>

        {/* Quick SubTab Nav */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-800/80 border border-zinc-700/60 rounded-xl overflow-x-auto">
          <button
            onClick={() => setActiveSubTab("tablas")}
            className={"px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 " + (activeSubTab === "tablas" ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30" : "text-zinc-400 hover:text-zinc-200")}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            Tablas Semanales
          </button>
          <button
            onClick={() => setActiveSubTab("biblioteca")}
            className={"px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 " + (activeSubTab === "biblioteca" ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30" : "text-zinc-400 hover:text-zinc-200")}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Biblioteca
          </button>
          <button
            onClick={() => setActiveSubTab("mis_productos")}
            className={"px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 " + (activeSubTab === "mis_productos" ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30" : "text-zinc-400 hover:text-zinc-200")}
          >
            <Package className="w-3.5 h-3.5" />
            Mis Productos
          </button>
          <button
            onClick={() => setActiveSubTab("calculadora")}
            className={"px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 " + (activeSubTab === "calculadora" ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30" : "text-zinc-400 hover:text-zinc-200")}
          >
            <Calculator className="w-3.5 h-3.5" />
            Calculadora
          </button>
          <button
            onClick={() => setActiveSubTab("historial")}
            className={"px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 " + (activeSubTab === "historial" ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30" : "text-zinc-400 hover:text-zinc-200")}
          >
            <Layers className="w-3.5 h-3.5" />
            Historial ({activeCropFertilizations.length})
          </button>
        </div>
      </div>

      {/* 1. TABLAS */}
      {activeSubTab === "tablas" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 rounded-2xl shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-500" />
                  Medio de Cultivo y Estrategia
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Selecciona el sistema para adaptar la dinámica de asimilación y parámetros físico-químicos.
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {Object.keys(availableSchedules).map((sysKey) => (
                  <button
                    key={sysKey}
                    onClick={() => handleSystemChange(sysKey)}
                    className={"px-3 py-1.5 rounded-xl text-xs font-medium transition-all border " + (selectedSystem === sysKey ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold shadow-sm" : "bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700/50 hover:bg-zinc-100 dark:hover:bg-zinc-800")}
                  >
                    {sysKey === "Tierra" && "🪴 Tierra / Orgánico"}
                    {sysKey === "Coco" && "🥥 Fibra de Coco"}
                    {sysKey === "Hidroponia" && "💧 Hidroponía"}
                    {sysKey === "Living Soil" && "🪱 Living Soil"}
                    {sysKey === "Auto" && "⚡ Autoflorecientes"}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 block mb-1">
                  🌱 Dinámica del Sustrato:
                </span>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {currentSchedule.substrateConsiderations}
                </p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 block mb-1">
                  💧 Dinámica de Riego:
                </span>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {currentSchedule.irrigationDynamics}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {currentSchedule.weeks.map((w) => (
              <button
                key={w.weekNumber}
                onClick={() => setSelectedWeek(w.weekNumber)}
                className={"px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex flex-col items-center gap-0.5 border " + (selectedWeek === w.weekNumber ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20 scale-[1.02]" : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700")}
              >
                <span>Semana {w.weekNumber}</span>
                <span className="text-[10px] font-normal opacity-80">{w.phase}</span>
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 rounded-2xl shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Semana {currentWeekData.weekNumber} • {currentWeekData.phase}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Fotoperiodo: {currentWeekData.photoperiod || "18/6"}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                  {currentWeekData.stageName}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {currentWeekData.targetPhRange && (
                  <div className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-medium">
                    <span className="text-[10px] block opacity-75">pH Orientativo</span>
                    <span className="font-bold">{currentWeekData.targetPhRange}</span>
                  </div>
                )}
                {currentWeekData.targetEcRange && (
                  <div className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-medium">
                    <span className="text-[10px] block opacity-75">EC Máx Orientativa</span>
                    <span className="font-bold">{currentWeekData.targetEcRange}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-xl">
              <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-1 uppercase tracking-wider">
                <span>🎯</span> Objetivo Nutricional de la Semana
              </h4>
              <p className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-200/90 leading-relaxed font-medium">
                {currentWeekData.nutritionalObjective}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-3">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-200 flex items-center gap-1.5 uppercase tracking-wider">
                  <span>🧪</span> Nutrientes Clave para esta Fase
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Haz clic o posa el cursor sobre cada elemento para aprender su función biológica y fuentes:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {currentWeekData.relevantNutrients.map((nutId) => (
                    <ContextInfoCard key={nutId} id={nutId} variant="badge" />
                  ))}
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-3">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-200 flex items-center gap-1.5 uppercase tracking-wider">
                  <span>🌿</span> Opciones y Enmiendas Naturales
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Aportes orgánicos recomendados para nutrir la microbiología del suelo:
                </p>
                <div className="space-y-1.5 pt-1">
                  {currentWeekData.naturalOptions.length > 0 ? (
                    currentWeekData.naturalOptions.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                        <span className="text-emerald-500">•</span>
                        <span>{opt}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-400 italic">No requiere enmiendas adicionales en este medio.</p>
                  )}
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-3">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-200 flex items-center gap-1.5 uppercase tracking-wider">
                  <span>⚗️</span> Opciones Genéricas de Fertilizante
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Perfiles genéricos compatibles con esta etapa:
                </p>
                <div className="space-y-1.5 pt-1">
                  {currentWeekData.genericOptions.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                      <span className="text-purple-500">▶</span>
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-3">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-200 flex items-center gap-1.5 uppercase tracking-wider">
                  <span>💡</span> Notas Agronómicas
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {currentWeekData.educationalNotes}
                </p>
                {currentWeekData.warnings && (
                  <div className="mt-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{currentWeekData.warnings}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-100 dark:border-zinc-800">
              <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-zinc-400" />
                <span>Las tablas son orientativas. Ajusta siempre la dosis según el vigor de la planta y la etiqueta del fabricante.</span>
              </div>
              <button
                onClick={() => setActiveSubTab("calculadora")}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
              >
                <Calculator className="w-4 h-4" />
                Calcular Riego para esta Semana
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. BIBLIOTECA */}
      {activeSubTab === "biblioteca" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar nutriente, fuente, síntoma..."
                value={libSearch}
                onChange={(e) => setLibSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {[
                { id: "todos", label: "Todo" },
                { id: "macronutrientes", label: "Macronutrientes" },
                { id: "micronutrientes", label: "Micronutrientes" },
                { id: "naturales", label: "Enmiendas Naturales" },
                { id: "minerales", label: "Fuentes Minerales" },
                { id: "deficiencias", label: "Diagnóstico" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setLibCategory(tab.id as any)}
                  className={"px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap " + (libCategory === tab.id ? "bg-emerald-600 text-white shadow-sm" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-200")}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {(libCategory === "todos" || libCategory === "macronutrientes" || libCategory === "micronutrientes") && filteredNutrients.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                Elementos y Nutrientes Esenciales ({filteredNutrients.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNutrients.map((n) => (
                  <div
                    key={n.id}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 rounded-2xl shadow-sm hover:border-emerald-500/30 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-sm border border-emerald-500/20">
                            {n.symbol}
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{n.name}</h4>
                            <span className="text-[10px] text-zinc-400 capitalize">
                              {n.category.replace(/_/g, " ")}
                            </span>
                          </div>
                        </div>
                        <ContextInfoCard id={n.id} variant="badge" inlineLabel="Ficha" />
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed mb-3">
                        {n.shortDescription}
                      </p>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1 mb-3">
                        <div>
                          <strong className="text-zinc-700 dark:text-zinc-300">Fuentes habituales:</strong>{" "}
                          {n.commonSources.join(", ")}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400">
                      <span>Etapas: {n.relevantStages.join(", ")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(libCategory === "todos" || libCategory === "naturales") && filteredNaturalSources.length > 0 && (
            <div className="space-y-3 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Fuentes Naturales y Enmiendas Orgánicas ({filteredNaturalSources.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNaturalSources.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 rounded-2xl shadow-sm hover:border-amber-500/30 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{s.name}</h4>
                        <ContextInfoCard id={s.id} variant="badge" inlineLabel="Ver Ficha" />
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed mb-3">
                        {s.description}
                      </p>
                      <div className="text-[11px] text-amber-700 dark:text-amber-300/90 font-medium mb-2">
                        🛒 Dónde conseguirlo: {s.whereToFindIt}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400">
                      <span>Aporta: {s.nutrientsProvided.join(" • ")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(libCategory === "todos" || libCategory === "deficiencias") && filteredDeficiencies.length > 0 && (
            <div className="space-y-3 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                Guías de Diagnóstico Multifactorial ({filteredDeficiencies.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDeficiencies.map((d) => (
                  <div
                    key={d.id}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          Posible Carencia / Bloqueo: {d.nutrientName}
                        </h4>
                        <span className="text-[10px] text-zinc-400">Ubicación: {d.symptomLocation}</span>
                      </div>
                      <ContextInfoCard id={d.nutrientId} variant="badge" inlineLabel="Ficha Nutriente" />
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {d.visualDescription}
                    </p>

                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-1.5">
                      <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 block">
                        🔍 Posibles causas raíz (no saltar a conclusiones):
                      </span>
                      <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400 list-disc list-inside">
                        {d.potentialCauses.map((cause, idx) => (
                          <li key={idx}>{cause}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{d.cautiousAdvice}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. MIS PRODUCTOS */}
      {activeSubTab === "mis_productos" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-500" />
                Mis Fertilizantes y Enmiendas Registradas
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
                Registra los productos comerciales, enmiendas o abonos que posees en tu cultivo. La app respetará estrictamente las indicaciones de dosis de la etiqueta.
              </p>
            </div>

            <button
              onClick={handleOpenNewProduct}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              Registrar Nuevo Producto
            </button>
          </div>

          {userFertilizers.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-2xl text-center space-y-3">
              <Package className="w-10 h-10 text-zinc-400 mx-auto opacity-50" />
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Aún no tienes productos registrados</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Registra tus abonos líquidos, sales minerales o enmiendas orgánicas para usarlos directamente en la calculadora de mezclas.
              </p>
              <button
                onClick={handleOpenNewProduct}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-medium"
              >
                + Agregar mi primer producto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userFertilizers.map((fert) => (
                <div
                  key={fert.id}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          {fert.form} • {fert.targetPhase}
                        </span>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1">{fert.name}</h4>
                        {fert.brand && (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{fert.brand}</p>
                        )}
                      </div>
                      {fert.npk && (
                        <span className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                          NPK {fert.npk}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                      <div>
                        <strong className="text-zinc-800 dark:text-zinc-200">Dosis de Etiqueta:</strong>{" "}
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">{fert.manufacturerDose || "Según fabricante"}</span>
                      </div>
                      <div>
                        <strong className="text-zinc-800 dark:text-zinc-200">Frecuencia:</strong> {fert.manufacturerFrequency || "Según respuesta"}
                      </div>
                      <div>
                        <strong className="text-zinc-800 dark:text-zinc-200">Método:</strong> {fert.applicationMethod}
                      </div>
                      {fert.nutrientsAdditional && (
                        <div className="pt-1 text-[11px] text-zinc-500">
                          <strong>Adicional:</strong> {fert.nutrientsAdditional}
                        </div>
                      )}
                    </div>

                    {fert.notes && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">
                        "{fert.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      onClick={() => {
                        handleAddUserFertToCalc(fert.id);
                        setActiveSubTab("calculadora");
                      }}
                      className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      Usar en Calculadora
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditProduct(fert)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("¿Eliminar " + fert.name + "?")) deleteUserFertilizer(fert.id);
                        }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isProductModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-900 dark:text-zinc-100 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <Package className="w-5 h-5 text-emerald-500" />
                    {editingProductId ? "Editar Producto" : "Registrar Fertilizante o Enmienda"}
                  </h3>
                  <button onClick={() => setIsProductModalOpen(false)} className="text-zinc-400 hover:text-zinc-100">
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveProduct} className="space-y-4 text-xs sm:text-sm">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Nombre del Producto *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Bio Crecimiento Plus, Sales de Epsom..."
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Marca (Opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Propio / Comercial"
                        value={productForm.brand}
                        onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        NPK (Si aplica)
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. 4-1-2"
                        value={productForm.npk}
                        onChange={(e) => setProductForm({ ...productForm, npk: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Forma
                      </label>
                      <select
                        value={productForm.form}
                        onChange={(e) => setProductForm({ ...productForm, form: e.target.value as any })}
                        className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                      >
                        <option value="Líquido">Líquido</option>
                        <option value="Polvo hidrosoluble">Polvo hidrosoluble</option>
                        <option value="Granulado">Granulado</option>
                        <option value="Enmienda sólida">Enmienda sólida</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Fase de Uso
                      </label>
                      <select
                        value={productForm.targetPhase}
                        onChange={(e) => setProductForm({ ...productForm, targetPhase: e.target.value as any })}
                        className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                      >
                        <option value="Vegetativo">Vegetativo</option>
                        <option value="Floración">Floración</option>
                        <option value="Todo el ciclo">Todo el ciclo</option>
                        <option value="Enraizamiento">Enraizamiento</option>
                        <option value="Corrector">Corrector de carencias</option>
                        <option value="Maduración">Maduración</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Dosis en Etiqueta (Ej. 2 ml/L)
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. 2 ml / L"
                        value={productForm.manufacturerDose}
                        onChange={(e) => setProductForm({ ...productForm, manufacturerDose: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Frecuencia sugerida
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. 1 vez por semana"
                        value={productForm.manufacturerFrequency}
                        onChange={(e) => setProductForm({ ...productForm, manufacturerFrequency: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Método de Aplicación
                    </label>
                    <select
                      value={productForm.applicationMethod}
                      onChange={(e) => setProductForm({ ...productForm, applicationMethod: e.target.value as any })}
                      className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="Riego a sustrato">Riego a sustrato</option>
                      <option value="Foliar">Foliar (Pulverizado)</option>
                      <option value="Mezcla en sustrato">Mezcla previa en sustrato</option>
                      <option value="Hidropónico">Solución hidropónica</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Notas de la Etiqueta / Advertencias
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ej. Agitar bien antes de usar. No mezclar puro con calcio..."
                      value={productForm.notes}
                      onChange={(e) => setProductForm({ ...productForm, notes: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsProductModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                    >
                      Guardar Producto
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. CALCULADORA */}
      {activeSubTab === "calculadora" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 rounded-2xl shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-emerald-500" />
                  Calculadora Matemática de Mezclas de Riego
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
                  Calcula la cantidad exacta en ml o gramos totales requeridos para el volumen de agua ingresado según las dosis de etiqueta.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/80 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Volumen de Agua:</span>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="200"
                  value={calcWaterVolume}
                  onChange={(e) => setCalcWaterVolume(Math.max(0.5, parseFloat(e.target.value) || 1))}
                  className="w-16 p-1 text-center font-bold text-sm bg-white dark:bg-zinc-900 rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-zinc-500">Litros</span>
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-emerald-500" />
                Agregar Producto a la Mezcla
              </h3>

              <div className="flex flex-wrap gap-2 items-center">
                {userFertilizers.length > 0 && (
                  <select
                    value={calcSelectedUserFertId}
                    onChange={(e) => {
                      if (e.target.value) handleAddUserFertToCalc(e.target.value);
                    }}
                    className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="">+ Seleccionar de Mis Productos...</option>
                    {userFertilizers.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.brand || "Propio"}) — {f.manufacturerDose || "Dosis libre"}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  type="button"
                  onClick={() => handleAddGenericToCalc("Base Crecimiento Genérico", 2.0, "ml/L")}
                  className="px-3 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-700 text-xs font-medium hover:bg-emerald-600 hover:text-white transition-all"
                >
                  + Base Crecimiento (2 ml/L)
                </button>
                <button
                  type="button"
                  onClick={() => handleAddGenericToCalc("Base Floración Genérica", 3.0, "ml/L")}
                  className="px-3 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-700 text-xs font-medium hover:bg-emerald-600 hover:text-white transition-all"
                >
                  + Base Floración (3 ml/L)
                </button>
                <button
                  type="button"
                  onClick={() => handleAddGenericToCalc("Corrector Cal-Mag", 1.0, "ml/L")}
                  className="px-3 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-700 text-xs font-medium hover:bg-emerald-600 hover:text-white transition-all"
                >
                  + Cal-Mag (1 ml/L)
                </button>
                <button
                  type="button"
                  onClick={() => handleAddGenericToCalc("Sales de Epsom (Magnesio)", 1.0, "g/L")}
                  className="px-3 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-700 text-xs font-medium hover:bg-emerald-600 hover:text-white transition-all"
                >
                  + Sales de Epsom (1 g/L)
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Componentes de la Solución Nutritiva ({calcItems.length})
              </h3>

              {calcItems.length === 0 ? (
                <p className="text-xs text-zinc-400 italic">No hay productos en la mezcla actual.</p>
              ) : (
                <div className="space-y-2">
                  {calcItems.map((item) => {
                    const totalAmt = Math.round(item.dosePerLiter * calcWaterVolume * 10) / 10;
                    return (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">{item.name}</span>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                            <span>Dosis:</span>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={item.dosePerLiter}
                              onChange={(e) => handleUpdateItemDose(item.id, parseFloat(e.target.value) || 0)}
                              className="w-14 p-1 text-center font-bold bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 rounded text-xs text-zinc-900 dark:text-zinc-100"
                            />
                            <span>{item.unit}</span>
                          </div>

                          <div className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                            Total: {totalAmt} {item.unit.startsWith("g") ? "gramos" : "ml"}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveCalcItem(item.id)}
                            className="text-zinc-400 hover:text-rose-500 p-1"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Notas para la Bitácora (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Riego semanal con 20% de drenaje, pH ajustado a 6.4..."
                  value={calcNotes}
                  onChange={(e) => setCalcNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {calcSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{calcSuccessMsg}</span>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleLogFromCalculator}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Registrar Fertirriego en Bitácora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. HISTORIAL */}
      {activeSubTab === "historial" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-500" />
                Historial Cronológico de Fertirriegos
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Registros preservados del cultivo activo, incluyendo productos personalizados y registros comerciales históricos.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {activeCropFertilizations.length} aplicaciones
            </span>
          </div>

          {activeCropFertilizations.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-2xl text-center space-y-2">
              <FlaskConical className="w-8 h-8 text-zinc-400 mx-auto opacity-50" />
              <p className="text-xs text-zinc-400">No hay fertilizaciones registradas para este cultivo.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {activeCropFertilizations.map((log) => {
                const isHistorical = log.fertilizerType === "historical_top_crop" || !log.fertilizerType;
                return (
                  <div
                    key={log.id}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{log.productName}</span>
                        {isHistorical ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-medium">
                            Registro Histórico / Comercial
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                            {log.fertilizerType === "natural" ? "Enmienda Natural" : "Producto Propio"}
                          </span>
                        )}
                        <span className="text-xs text-zinc-400">• {log.date}</span>
                      </div>

                      <p className="text-xs text-zinc-600 dark:text-zinc-300">
                        <strong>Dosis:</strong> {log.doseMlPerL} ml/L en <strong>{log.volumeWaterLiters} Litros</strong> de agua (Total: <strong>{log.totalProductMl} ml</strong>)
                      </p>
                      {log.notes && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">"{log.notes}"</p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (confirm("¿Eliminar este registro de fertilización?")) {
                          deleteFertilizationLog(log.id);
                        }
                      }}
                      className="p-2 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 self-end sm:self-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};