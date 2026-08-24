import React, { useState } from "react";
import {
  X,
  ArrowRightLeft,
  Sparkles,
  Sprout,
  Thermometer,
  Droplets,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { useCultiva } from "../../context/CultivaContext";
import { Cultivo } from "../../types";

interface Props {
  onClose: () => void;
}

export const CropCompareModal: React.FC<Props> = ({ onClose }) => {
  const { cultivos, plantas, registros } = useCultiva();

  const [cropIdA, setCropIdA] = useState<string>(cultivos[0]?.id || "");
  const [cropIdB, setCropIdB] = useState<string>(cultivos[1]?.id || cultivos[0]?.id || "");

  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  const cropA = cultivos.find((c) => c.id === cropIdA);
  const cropB = cultivos.find((c) => c.id === cropIdB);

  const plantsA = plantas.filter((p) => p.cultivoId === cropIdA);
  const plantsB = plantas.filter((p) => p.cultivoId === cropIdB);

  const logsA = registros.filter((l) => l.cultivoId === cropIdA);
  const logsB = registros.filter((l) => l.cultivoId === cropIdB);

  const daysA = cropA
    ? Math.max(1, Math.floor((new Date().getTime() - new Date(cropA.startDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const daysB = cropB
    ? Math.max(1, Math.floor((new Date().getTime() - new Date(cropB.startDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const handleRunAiComparison = async () => {
    if (!cropA || !cropB) return;
    setLoadingAi(true);
    try {
      const res = await fetch("/api/gemini/compare-crops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropA: {
            name: cropA.name,
            method: cropA.method,
            stage: cropA.stage,
            days: daysA,
            plantsCount: plantsA.length,
            genetic: cropA.geneticName,
          },
          cropB: {
            name: cropB.name,
            method: cropB.method,
            stage: cropB.stage,
            days: daysB,
            plantsCount: plantsB.length,
            genetic: cropB.geneticName,
          },
        }),
      });
      const data = await res.json();
      if (data.comparison) {
        setAiAnalysis(data.comparison);
      } else {
        setAiAnalysis("No se pudo obtener el análisis comparativo.");
      }
    } catch (e) {
      console.error(e);
      setAiAnalysis("Error al contactar con Cultiva IA.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Comparador de Cultivos
              </h2>
              <p className="text-xs text-slate-500">
                Contrasta variables, duraciones, métodos y rendimientos entre dos ciclos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1">
          {/* Selectors Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Crop A selector */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-2">
              <label className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase font-mono block">
                Cultivo A (Base)
              </label>
              <select
                value={cropIdA}
                onChange={(e) => setCropIdA(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 px-3 py-2 text-slate-900 dark:text-slate-100"
              >
                {cultivos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.method})
                  </option>
                ))}
              </select>
            </div>

            {/* Crop B selector */}
            <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/40 space-y-2">
              <label className="text-xs font-bold text-teal-800 dark:text-teal-300 uppercase font-mono block">
                Cultivo B (Comparativo)
              </label>
              <select
                value={cropIdB}
                onChange={(e) => setCropIdB(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-teal-300 dark:border-teal-700 px-3 py-2 text-slate-900 dark:text-slate-100"
              >
                {cultivos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.method})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Comparison Matrix Cards */}
          {cropA && cropB && (
            <div className="grid grid-cols-2 gap-3 sm:gap-6">
              {/* Card A */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-2xs">
                <img
                  src={cropA.image}
                  alt={cropA.name}
                  className="w-full h-32 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{cropA.name}</h3>
                  <p className="text-xs text-slate-500">{cropA.geneticName || "Genética botánica"}</p>
                </div>
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Método:</span>
                    <span className="font-medium">{cropA.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Días transcurridos:</span>
                    <span className="font-mono font-bold">{daysA} días</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Plantas activas:</span>
                    <span className="font-mono font-bold">{plantsA.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Registros de diario:</span>
                    <span className="font-mono">{logsA.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estado:</span>
                    <span className="font-semibold text-emerald-600">{cropA.status} ({cropA.stage})</span>
                  </div>
                </div>
              </div>

              {/* Card B */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-2xs">
                <img
                  src={cropB.image}
                  alt={cropB.name}
                  className="w-full h-32 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{cropB.name}</h3>
                  <p className="text-xs text-slate-500">{cropB.geneticName || "Genética botánica"}</p>
                </div>
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Método:</span>
                    <span className="font-medium">{cropB.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Días transcurridos:</span>
                    <span className="font-mono font-bold">{daysB} días</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Plantas activas:</span>
                    <span className="font-mono font-bold">{plantsB.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Registros de diario:</span>
                    <span className="font-mono">{logsB.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estado:</span>
                    <span className="font-semibold text-emerald-600">{cropB.status} ({cropB.stage})</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Comparison Generator Trigger */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                  Análisis Comparativo con Cultiva IA
                </span>
              </div>
              <button
                onClick={handleRunAiComparison}
                disabled={loadingAi}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                {loadingAi ? "Analizando..." : "Generar Comparativa IA"}
              </button>
            </div>

            {aiAnalysis && (
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {aiAnalysis}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
