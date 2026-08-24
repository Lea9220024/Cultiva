import React, { useState } from "react";
import {
  Sprout,
  Check,
  Sparkles,
  ArrowRight,
  Calendar,
  Layers,
  Thermometer,
  ShieldCheck,
} from "lucide-react";
import { useCultiva } from "../../context/CultivaContext";
import { Method, Stage } from "../../types";

export const OnboardingModal: React.FC = () => {
  const {
    isOnboardingOpen,
    completeOnboarding,
    addCultivo,
    addPlanta,
    addTarea,
    loadDemoData,
    cultivos,
  } = useCultiva();

  const [step, setStep] = useState<number>(1);

  // Form states during onboarding
  const [cropName, setCropName] = useState<string>("Mi Primer Cultivo 2026");
  const [cropMethod, setCropMethod] = useState<Method>("Indoor (Carpa)");
  const [cropSpace, setCropSpace] = useState<string>("80x80 cm — Macetas 11L");
  const [plantCount, setPlantCount] = useState<number>(3);
  const [enableDailyReminder, setEnableDailyReminder] = useState<boolean>(true);
  const [reminderTime, setReminderTime] = useState<string>("10:00");

  if (!isOnboardingOpen) return null;

  const handleFinishOnboarding = () => {
    // If user made a custom crop in step 3
    if (cropName.trim()) {
      const createdCrop = addCultivo({
        name: cropName.trim(),
        startDate: new Date().toISOString().split("T")[0],
        status: "activo",
        stage: "Vegetativo",
        description: "Cultivo inicial creado durante el onboarding.",
        method: cropMethod,
        space: cropSpace,
        image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1000&q=80",
        geneticName: "Variedad Botánica",
        geneticType: "Fotoperiódica",
      });

      // Add plants
      for (let i = 1; i <= plantCount; i++) {
        addPlanta({
          cultivoId: createdCrop.id,
          name: `Planta #${i < 10 ? `0${i}` : i}`,
          dateAdded: new Date().toISOString().split("T")[0],
          stage: "Vegetativo",
          status: "Óptimo",
          heightCm: 20 + i * 2,
          potSize: "11L Geotextil",
          image: "https://images.unsplash.com/photo-1530968033775-2c92736b131e?auto=format&fit=crop&w=800&q=80",
        });
      }

      // Add recurring reminder task if enabled
      if (enableDailyReminder) {
        addTarea({
          cultivoId: createdCrop.id,
          title: "Revisión diaria: Temperatura, humedad y sustrato",
          date: new Date().toISOString().split("T")[0],
          time: reminderTime,
          repeat: "cada_2_dias",
          priority: "alta",
          completed: false,
          notes: "Verificar niveles ambientales y estado del sustrato.",
        });
      }
    }

    completeOnboarding();
  };

  const handleExploreDemo = () => {
    loadDemoData();
    completeOnboarding();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Step Progress Bar */}
        <div className="bg-slate-100 dark:bg-slate-800/80 p-3 px-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Paso {step} de 6
            </span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s <= step ? "w-6 bg-emerald-500" : "w-2 bg-slate-300 dark:bg-slate-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content Container */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* PASO 1: Bienvenida */}
          {step === 1 && (
            <div className="text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <Sprout className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Bienvenido a Cultiva 🌱
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed max-w-sm mx-auto">
                  Tu bitácora tecnológica, privada y rápida para el seguimiento y documentación personal de autocultivos domésticos legales.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 text-left space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>100% Privado y Local</span>
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400/90 leading-tight">
                  Tus datos residen de forma segura y confidencial en tu dispositivo. Sin publicaciones ni tracking externo.
                </p>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Comenzar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* PASO 2: ¿Qué querés hacer? */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  ¿Qué querés hacer hoy?
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Elegí cómo preferís iniciar tu experiencia
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => setStep(3)}
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold">
                        🌱
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                          Crear mi primer cultivo
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Configuración personalizada paso a paso en 1 minuto.
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                <button
                  onClick={handleExploreDemo}
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-700 hover:border-teal-500 transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-600 dark:text-teal-300 flex items-center justify-center font-bold">
                        📊
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                          Explorar con datos de demostración
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Carga un cultivo activo completo con 3 plantas, métricas y fotos.
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* PASO 3: Crear cultivo */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  Paso 3: Información Básica del Cultivo
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Define el nombre y las características del espacio
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nombre del cultivo
                  </label>
                  <input
                    type="text"
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-slate-900 dark:text-slate-100"
                    placeholder="Ej: Cultivo Primavera 2026"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Método de cultivo
                  </label>
                  <select
                    value={cropMethod}
                    onChange={(e) => setCropMethod(e.target.value as Method)}
                    className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Indoor (Carpa)">Indoor (Carpa)</option>
                    <option value="Indoor (Espacio abierto)">Indoor (Espacio abierto)</option>
                    <option value="Exterior (Suelo)">Exterior (Suelo)</option>
                    <option value="Exterior (Macetas)">Exterior (Macetas)</option>
                    <option value="Invernadero">Invernadero</option>
                    <option value="Hidroponía">Hidroponía</option>
                    <option value="Living Soil">Living Soil</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Espacio utilizado
                  </label>
                  <input
                    type="text"
                    value={cropSpace}
                    onChange={(e) => setCropSpace(e.target.value)}
                    className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-slate-900 dark:text-slate-100"
                    placeholder="Ej: 80x80x160 cm — Macetas 11L"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Atrás
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Continuar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* PASO 4: Agregar plantas */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  Paso 4: Cantidad de Plantas
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ¿Cuántas plantas componen este cultivo?
                </p>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2">
                {[1, 2, 3, 4, 6, 8, 12, 16].map((num) => (
                  <button
                    key={num}
                    onClick={() => setPlantCount(num)}
                    className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                      plantCount === num
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {num} {num === 1 ? "Planta" : "Plantas"}
                  </button>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400">
                Se generarán fichas individuales con identificadores para cada planta (Planta #01, Planta #02...) que podrás renombrar en cualquier momento.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setStep(3)}
                  className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Atrás
                </button>
                <button
                  onClick={() => setStep(5)}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Continuar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* PASO 5: Recordatorios */}
          {step === 5 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  Paso 5: Configurar Recordatorios
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Mantené la constancia en tus observaciones diarias
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Tarea periódica de revisión
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableDailyReminder}
                    onChange={(e) => setEnableDailyReminder(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded"
                  />
                </div>

                {enableDailyReminder && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Horario sugerido:</span>
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-1 font-mono text-slate-800 dark:text-slate-200"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setStep(4)}
                  className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Atrás
                </button>
                <button
                  onClick={() => setStep(6)}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Ver Resumen</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* PASO 6: Finalizar y Mostrar Dashboard */}
          {step === 6 && (
            <div className="text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  ¡Todo Listo para Cultivar!
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Tu cultivo &quot;{cropName}&quot; con {plantCount} plantas ha sido configurado con éxito.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-left text-xs space-y-1.5 border border-slate-200 dark:border-slate-700">
                <div className="font-semibold text-slate-800 dark:text-slate-200">Consejo de uso diario:</div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  Podés registrar temperatura, humedad o riego en <strong>menos de 20 segundos</strong> tocando el botón <strong>+</strong> flotante en cualquier momento.
                </div>
              </div>

              <button
                onClick={handleFinishOnboarding}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sprout className="w-4 h-4" />
                <span>Ingresar a Mi Dashboard</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
