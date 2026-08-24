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
} from "lucide-react";
import { useCultiva } from "../../context/CultivaContext";
import {
  TOP_CROP_PRODUCTS,
  TOP_CROP_SCHEDULES,
  checkProductCombinationConflict,
  getRecommendedDoseForWeek,
} from "../../data/topCropData";
import { FertilizerProduct, CultivationSystem, FertilizationLog } from "../../types";

export const NutritionView: React.FC = () => {
  const {
    activeCrop,
    activeCropFertilizations,
    addFertilizationLog,
    deleteFertilizationLog,
    learningProgress,
    toggleFavoriteProduct,
    userPreferences,
    updatePreferences,
    setIsQuickAddOpen,
  } = useCultiva();

  const [activeSubTab, setActiveSubTab] = useState<"tablas" | "productos" | "calculadora" | "historial">("tablas");
  const [selectedSystem, setSelectedSystem] = useState<CultivationSystem>(
    userPreferences.cultivationSystem || "Tierra"
  );
  const [selectedWeek, setSelectedWeek] = useState<number>(3);
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>("todos");
  const [selectedProductForModal, setSelectedProductForModal] = useState<FertilizerProduct | null>(null);

  // Calculator State
  const [calcWaterVolume, setCalcWaterVolume] = useState<number>(2.0);
  const [calcSelectedProductIds, setCalcSelectedProductIds] = useState<string[]>(["top_veg"]);
  const [calcNotes, setCalcNotes] = useState<string>("");
  const [calcLoggedSuccess, setCalcLoggedSuccess] = useState<boolean>(false);

  const currentSchedule = TOP_CROP_SCHEDULES[selectedSystem] || TOP_CROP_SCHEDULES.Tierra;
  const currentWeekData = currentSchedule.weeks.find((w) => w.weekNumber === selectedWeek) || currentSchedule.weeks[0];

  // Conflict Detection for current calculator selections
  const activeConflicts = checkProductCombinationConflict(calcSelectedProductIds);

  const filteredProducts = TOP_CROP_PRODUCTS.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      prod.description.toLowerCase().includes(productSearch.toLowerCase()) ||
      prod.keyBenefit.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory =
      productCategoryFilter === "todos" || prod.category === productCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSystemChange = (sys: CultivationSystem) => {
    setSelectedSystem(sys);
    updatePreferences({ cultivationSystem: sys });
  };

  const handleToggleProductInCalc = (prodId: string) => {
    if (calcSelectedProductIds.includes(prodId)) {
      setCalcSelectedProductIds(calcSelectedProductIds.filter((id) => id !== prodId));
    } else {
      setCalcSelectedProductIds([...calcSelectedProductIds, prodId]);
    }
  };

  const handleLogFromCalculator = () => {
    if (!activeCrop) {
      alert("Debes tener un cultivo activo seleccionado.");
      return;
    }
    if (calcSelectedProductIds.length === 0) {
      alert("Selecciona al menos un producto.");
      return;
    }

    calcSelectedProductIds.forEach((prodId) => {
      const prod = TOP_CROP_PRODUCTS.find((p) => p.id === prodId);
      if (!prod) return;
      const dose = prod.defaultDoseMlPerL;
      const total = Number((dose * calcWaterVolume).toFixed(2));

      addFertilizationLog({
        cultivoId: activeCrop.id,
        date: new Date().toISOString().split("T")[0],
        productId: prod.id,
        productName: prod.name,
        volumeWaterLiters: calcWaterVolume,
        doseMlPerL: dose,
        totalProductMl: total,
        stage: activeCrop.stage || "Vegetativo",
        notes: calcNotes || `Aplicación calculada para ${calcWaterVolume}L`,
      });
    });

    setCalcLoggedSuccess(true);
    setTimeout(() => setCalcLoggedSuccess(false), 3500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner & Sub-Navigation */}
      <div className="p-6 sm:p-8 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Sistema Oficial Top Crop V2
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                Nivel: {userPreferences.knowledgeLevel || "Principiante"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Nutrición y Fertirriego Inteligente
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-2xl">
              Dosificación precisa, tablas oficiales certificadas para Tierra, Coco y Auto, y detección preventiva de incompatibilidades químicas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsQuickAddOpen(true, "fertilizacion")}
              className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Fertirriego</span>
            </button>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 max-w-fit overflow-x-auto">
          <button
            onClick={() => setActiveSubTab("tablas")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === "tablas"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tablas Oficiales</span>
          </button>
          <button
            onClick={() => setActiveSubTab("productos")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === "productos"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Catálogo ({TOP_CROP_PRODUCTS.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab("calculadora")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === "calculadora"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Calculadora & Mezclas</span>
          </button>
          <button
            onClick={() => setActiveSubTab("historial")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === "historial"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Historial ({activeCropFertilizations.length})</span>
          </button>
        </div>
      </div>

      {/* 2. SUB-TAB: TABLAS OFICIALES TOP CROP */}
      {activeSubTab === "tablas" && (
        <div className="space-y-6">
          {/* System & Medium Selector */}
          <div className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Selecciona el Medio de Cultivo
                </h3>
                <p className="text-xs text-zinc-500">
                  {currentSchedule.description}
                </p>
              </div>

              {/* System pills */}
              <div className="flex items-center gap-2">
                {(["Tierra", "Coco", "Auto"] as CultivationSystem[]).map((sys) => (
                  <button
                    key={sys}
                    onClick={() => handleSystemChange(sys)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedSystem === sys
                        ? "bg-emerald-600 text-white shadow-xs shadow-emerald-600/20"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
                    }`}
                  >
                    {sys === "Tierra" && "🪴 Tierra"}
                    {sys === "Coco" && "🥥 Coco"}
                    {sys === "Auto" && "⚡ Autofloreciente"}
                  </button>
                ))}
              </div>
            </div>

            {/* Weeks Selector Strip */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div className="text-[11px] font-mono uppercase text-zinc-400 font-bold mb-2">
                Semanas del Ciclo
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {currentSchedule.weeks.map((w) => (
                  <button
                    key={w.weekNumber}
                    onClick={() => setSelectedWeek(w.weekNumber)}
                    className={`px-3.5 py-2.5 rounded-2xl text-left shrink-0 transition-all cursor-pointer border ${
                      selectedWeek === w.weekNumber
                        ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-950 dark:text-emerald-100 shadow-xs"
                        : "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/70 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
                    }`}
                  >
                    <div className="text-xs font-bold">Semana {w.weekNumber}</div>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400">{w.stageName}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Current Week Detail Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col: Week Target Metrics */}
            <div className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-bold">
                    {currentWeekData.phase}
                  </span>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    Semana {currentWeekData.weekNumber}: {currentWeekData.stageName}
                  </h3>
                </div>
                <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <Droplets className="w-5 h-5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80">
                  <div className="text-[10px] font-mono uppercase text-zinc-400">EC Recomendada</div>
                  <div className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {currentWeekData.ecRecommended || "0.8 - 1.2 mS/cm"}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80">
                  <div className="text-[10px] font-mono uppercase text-zinc-400">pH Recomendado</div>
                  <div className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {currentWeekData.phRecommended || "6.2 - 6.5"}
                  </div>
                </div>
              </div>

              {currentWeekData.notes && (
                <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">{currentWeekData.notes}</p>
                </div>
              )}
            </div>

            {/* Right Col: Recommended Products & Dosages (Span 2) */}
            <div className="lg:col-span-2 p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Productos recomendados para esta semana
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Dosificaciones oficiales por litro de agua
                  </p>
                </div>
                <button
                  onClick={() => {
                    setCalcSelectedProductIds(currentWeekData.dosages.map((d) => d.productId));
                    setActiveSubTab("calculadora");
                  }}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Cargar en calculadora</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {currentWeekData.dosages.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-dashed border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500">
                  💧 Solo agua reposada o lavado de raíces según el calendario oficial.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentWeekData.dosages.map((dose) => {
                    const product = TOP_CROP_PRODUCTS.find((p) => p.id === dose.productId);
                    return (
                      <div
                        key={dose.productId}
                        className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 flex items-start justify-between gap-3 hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{product?.icon || "🧪"}</span>
                            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                              {dose.productName}
                            </h4>
                          </div>
                          <p className="text-[11px] text-zinc-500">
                            {product?.keyBenefit}
                          </p>
                          <div className="text-[10px] font-mono text-zinc-400">
                            Frecuencia: {dose.frequency || "1 vez por semana"}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                            {dose.doseMlPerL} ml/L
                          </div>
                          <span className="text-[10px] text-zinc-400">Dosis oficial</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. SUB-TAB: CATÁLOGO DE PRODUCTOS TOP CROP */}
      {activeSubTab === "productos" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="p-4 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar abono, estimulador, N-P-K..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {[
                { id: "todos", label: "Todos" },
                { id: "base", label: "Bases" },
                { id: "estimulador", label: "Estimuladores" },
                { id: "aditivo", label: "Aditivos" },
                { id: "sustrato", label: "Sustratos" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setProductCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                    productCategoryFilter === cat.id
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((prod) => {
              const isFav = learningProgress.favoriteProductIds.includes(prod.id);
              return (
                <div
                  key={prod.id}
                  className="p-5 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-500/50 transition-all"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xl shrink-0">
                          {prod.icon || "🧪"}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            {prod.name}
                          </h4>
                          <span className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-semibold">
                            {prod.category} • {prod.applicationMethod}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleFavoriteProduct(prod.id)}
                        className={`p-2 rounded-xl transition-colors cursor-pointer ${
                          isFav
                            ? "bg-amber-50 dark:bg-amber-950/60 text-amber-500"
                            : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${isFav ? "fill-amber-500" : ""}`} />
                      </button>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {prod.description}
                    </p>

                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500">Dosis recomendada:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          {prod.doseRangeMlPerL} ml/L
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500">Composición:</span>
                        <span className="font-mono text-zinc-700 dark:text-zinc-300 text-[11px]">
                          {prod.compositionNpk}
                        </span>
                      </div>
                    </div>

                    {prod.warnings && (
                      <div className="text-[10px] text-amber-700 dark:text-amber-400 flex items-start gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{prod.warnings}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <button
                      onClick={() => {
                        handleToggleProductInCalc(prod.id);
                        setActiveSubTab("calculadora");
                      }}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>Calcular dosis</span>
                    </button>
                    {prod.officialGuideUrl && (
                      <a
                        href={prod.officialGuideUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 flex items-center gap-1"
                      >
                        <span>Ficha</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. SUB-TAB: CALCULADORA DE MEZCLAS & CONFLICTOS */}
      {activeSubTab === "calculadora" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Configuration Form */}
          <div className="lg:col-span-2 p-6 sm:p-8 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Calculadora de Solución Nutritiva
              </h3>
              <p className="text-xs text-zinc-500">
                Calcula los mililitros exactos según el volumen de agua de tu riego.
              </p>
            </div>

            {/* Water Volume Slider / Input */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-emerald-500" />
                  <span>Volumen de Agua para el Riego</span>
                </label>
                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {calcWaterVolume} Litros
                </div>
              </div>

              <input
                type="range"
                min="0.5"
                max="20"
                step="0.5"
                value={calcWaterVolume}
                onChange={(e) => setCalcWaterVolume(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />

              <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                <span>0.5 L</span>
                <span>5 L</span>
                <span>10 L</span>
                <span>20 L</span>
              </div>
            </div>

            {/* Conflict Warnings if any */}
            {activeConflicts.hasConflict && (
              <div className="p-4 rounded-2xl bg-red-50/80 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-900 dark:text-red-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-red-700 dark:text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Alerta de Compatibilidad Nutricional</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
                  {activeConflicts.conflictWarnings.map((warn, i) => (
                    <li key={i}>{warn}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Select Products to Mix */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Productos a incluir en el caldo de riego:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TOP_CROP_PRODUCTS.map((prod) => {
                  const isSelected = calcSelectedProductIds.includes(prod.id);
                  return (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => handleToggleProductInCalc(prod.id)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-zinc-900 dark:text-zinc-100 font-bold"
                          : "bg-white dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
                      }`}
                    >
                      <span className="truncate">{prod.name}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Notas adicionales para el registro:
              </label>
              <input
                type="text"
                placeholder="Ej. Riego con 10% de drenaje, pH ajustado a 6.3..."
                value={calcNotes}
                onChange={(e) => setCalcNotes(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
          </div>

          {/* Right: Recipe Breakdown & Action */}
          <div className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Dosificación Calculada
                </h3>
              </div>

              <div className="space-y-2.5">
                {calcSelectedProductIds.length === 0 ? (
                  <p className="text-xs text-zinc-400 text-center py-6">
                    Selecciona uno o más productos para calcular la mezcla.
                  </p>
                ) : (
                  calcSelectedProductIds.map((prodId) => {
                    const prod = TOP_CROP_PRODUCTS.find((p) => p.id === prodId);
                    if (!prod) return null;
                    const dose = prod.defaultDoseMlPerL;
                    const total = (dose * calcWaterVolume).toFixed(1);
                    return (
                      <div
                        key={prodId}
                        className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {prod.name}
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            {dose} ml / Litro
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                            {total} ml
                          </div>
                          <div className="text-[10px] text-zinc-400">Total a medir</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              {calcLoggedSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>¡Fertirriego registrado con éxito en el diario!</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleLogFromCalculator}
                disabled={calcSelectedProductIds.length === 0}
                className="w-full py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Droplets className="w-4 h-4" />
                <span>Aplicar y Registrar Fertirriego</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. SUB-TAB: HISTORIAL DE FERTIRRIEGOS */}
      {activeSubTab === "historial" && (
        <div className="p-6 sm:p-8 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Historial de Fertirriegos del Cultivo
              </h3>
              <p className="text-xs text-zinc-500">
                Registro cronológico de nutrientes aplicados a {activeCrop?.name || "tu cultivo"}
              </p>
            </div>
          </div>

          {activeCropFertilizations.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 text-xs space-y-2">
              <FlaskConical className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-600" />
              <p>No hay aplicaciones de nutrientes registradas aún.</p>
              <button
                onClick={() => setActiveSubTab("calculadora")}
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
              >
                Calcular y registrar tu primer riego
              </button>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {activeCropFertilizations.map((log) => (
                <div key={log.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {log.productName}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                        {log.date}
                      </span>
                      {log.stage && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          • {log.stage}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500">
                      {log.doseMlPerL} ml/L en {log.volumeWaterLiters}L de agua ={" "}
                      <strong className="text-zinc-800 dark:text-zinc-200 font-mono">
                        {log.totalProductMl} ml total
                      </strong>
                    </p>
                    {log.notes && (
                      <p className="text-[11px] text-zinc-400 italic">{log.notes}</p>
                    )}
                  </div>

                  <button
                    onClick={() => deleteFertilizationLog(log.id)}
                    className="text-xs text-zinc-400 hover:text-red-500 transition-colors p-1.5"
                    title="Eliminar registro"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
