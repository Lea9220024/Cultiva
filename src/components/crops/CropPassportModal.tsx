import React from "react";
import {
  X,
  Printer,
  Download,
  Calendar,
  Sprout,
  Thermometer,
  Droplets,
  Layers,
  Award,
  FileSpreadsheet,
} from "lucide-react";
import { Cultivo, Planta, Registro, Foto } from "../../types";
import { exportCropReportToPDF } from "../../utils/exportUtils";

interface Props {
  crop: Cultivo;
  plants: Planta[];
  logs: Registro[];
  photos: Foto[];
  onClose: () => void;
}

export const CropPassportModal: React.FC<Props> = ({
  crop,
  plants,
  logs,
  photos,
  onClose,
}) => {
  const daysTotal = Math.max(
    1,
    Math.floor(
      (new Date().getTime() - new Date(crop.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  const wateringLogs = logs.filter((l) => l.watering?.performed);
  const totalWaterVolume = wateringLogs.reduce(
    (acc, cur) => acc + (cur.watering?.volumeMl || 0),
    0
  );

  const avgTemp =
    logs.filter((l) => l.temperature !== undefined).length > 0
      ? (
          logs
            .filter((l) => l.temperature !== undefined)
            .reduce((acc, cur) => acc + (cur.temperature || 0), 0) /
          logs.filter((l) => l.temperature !== undefined).length
        ).toFixed(1)
      : "N/D";

  const avgHumidity =
    logs.filter((l) => l.humidity !== undefined).length > 0
      ? Math.round(
          logs
            .filter((l) => l.humidity !== undefined)
            .reduce((acc, cur) => acc + (cur.humidity || 0), 0) /
            logs.filter((l) => l.humidity !== undefined).length
        )
      : "N/D";

  const handlePrintPDF = () => {
    exportCropReportToPDF(crop, plants, logs, photos);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Passport Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-emerald-900 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-white border border-emerald-700 font-bold">
              🛂
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-300">
                PASAPORTE OFICIAL DE CULTIVO
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                {crop.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrintPDF}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-xs font-semibold border border-emerald-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Passport Document Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-200">
          {/* Identity block */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <img
              src={crop.image}
              alt={crop.name}
              className="w-full h-36 sm:h-full object-cover rounded-xl border border-slate-200 dark:border-slate-700"
            />
            <div className="sm:col-span-2 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">
                    ID Registro
                  </span>
                  <span className="font-mono font-bold">{crop.id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">
                    Estado Actual
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                    {crop.status} ({crop.stage})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">
                    Fecha de Inicio
                  </span>
                  <span className="font-mono font-semibold">{crop.startDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">
                    Días Totales
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    🌱 {daysTotal} Días
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">
                    Método y Medio
                  </span>
                  <span className="font-semibold">{crop.method}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">
                    Genética
                  </span>
                  <span className="font-semibold">{crop.geneticName || "No especificada"}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">
                  Espacio y Configuración
                </span>
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  {crop.space}
                </span>
              </div>
            </div>
          </div>

          {/* Statistical Aggregates */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Resumen Métrico Acumulado
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[10px] uppercase text-slate-400 font-mono">Temp Promedio</span>
                <div className="text-lg font-bold font-mono text-amber-500">{avgTemp}°C</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[10px] uppercase text-slate-400 font-mono">HR Promedio</span>
                <div className="text-lg font-bold font-mono text-sky-500">{avgHumidity}%</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[10px] uppercase text-slate-400 font-mono">Riegos Totales</span>
                <div className="text-lg font-bold font-mono text-emerald-500">
                  {wateringLogs.length} ({totalWaterVolume} ml)
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[10px] uppercase text-slate-400 font-mono">Plantas / Ejemplares</span>
                <div className="text-lg font-bold font-mono text-indigo-500">{plants.length}</div>
              </div>
            </div>
          </div>

          {/* Plant Inventory in this Crop */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Inventario de Plantas
            </h3>
            <div className="space-y-2">
              {plants.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-2.5">
                    <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{p.name}</span>
                      <span className="text-slate-400 block text-[11px]">
                        {p.stage} • Contenedor: {p.potSize || "11L"}
                      </span>
                    </div>
                  </div>
                  <div className="font-mono text-right">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {p.heightCm ? `${p.heightCm} cm` : "Sin medir"}
                    </span>
                    <span className="block text-[10px] text-slate-400">{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chronological Log Sample */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Últimas Observaciones de Bitácora ({logs.length} totales)
            </h3>
            <div className="space-y-2">
              {logs.slice(0, 5).map((l) => (
                <div
                  key={l.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                    <span>{new Date(l.date).toLocaleString("es-ES")}</span>
                    <span>
                      {l.temperature ? `${l.temperature}°C` : ""} {l.humidity ? `• ${l.humidity}%` : ""}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{l.notes}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
