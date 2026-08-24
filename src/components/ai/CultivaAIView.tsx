import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Camera,
  FileSpreadsheet,
  AlertCircle,
  Sprout,
  Bot,
  User,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
  TrendingUp,
  FlaskConical,
  GraduationCap,
  ShieldAlert,
  Clock,
} from "lucide-react";
import { useCultiva } from "../../context/CultivaContext";
import { NUTRITION_SCHEDULES } from "../../data/nutritionData";
import { calculateCropChronology } from "../../utils/dateCalculations";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export const CultivaAIView: React.FC = () => {
  const {
    activeCrop,
    activeCropPlants,
    activeCropLogs,
    activeCropFertilizations,
    activeCropTasks,
    activeCropPhotos,
    userPreferences,
  } = useCultiva();

  const [activeAITab, setActiveAITab] = useState<"chat" | "photo_analysis" | "crop_audit">("chat");

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "¡Hola! Soy Cultiva IA, tu asistente técnico y botánico especializado. Puedo analizar los parámetros registrados de tu cultivo, auditar la fertilidad y nutrición de tu sustrato, evaluar fotografías foliares o resolver dudas sobre podas, sustratos y cronología. ¿Qué te gustaría consultar hoy?",
      timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Photo Analysis state
  const [photoForAnalysis, setPhotoForAnalysis] = useState<string>(
    activeCropPhotos[0]?.image || ""
  );
  const [photoNotes, setPhotoNotes] = useState<string>("");
  const [photoAnalysisResult, setPhotoAnalysisResult] = useState<any | null>(null);
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);

  // Crop Audit state
  const [auditResult, setAuditResult] = useState<any | null>(null);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoadingChat]);

  // Handle Send Chat
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputVal;
    if (!textToSend.trim() || isLoadingChat) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsLoadingChat(true);

    try {
      // Build real crop & nutrition context
      const chronology = activeCrop ? calculateCropChronology(activeCrop) : null;
      const systemSchedule = NUTRITION_SCHEDULES[userPreferences.cultivationSystem || "Tierra"] || NUTRITION_SCHEDULES.Tierra;

      const contextPayload = activeCrop
        ? {
            crop: {
              name: activeCrop.name,
              stage: activeCrop.stage,
              method: activeCrop.method,
              space: activeCrop.space,
              startDate: activeCrop.startDate,
              currentDay: chronology?.currentDay || 30,
              currentWeek: Math.max(1, Math.ceil((chronology?.totalDays || 1) / 7)),
            },
            cultivationSystem: userPreferences.cultivationSystem || "Tierra",
            knowledgeLevel: userPreferences.knowledgeLevel || "Principiante",
            plantsCount: activeCropPlants.length,
            recentLogs: activeCropLogs.slice(0, 5).map((l) => ({
              date: l.date,
              temp: l.temperature,
              humidity: l.humidity,
              ph: l.watering?.ph,
              ec: l.watering?.ec,
              notes: l.notes,
            })),
            recentFertilizations: activeCropFertilizations.slice(0, 5).map((f) => ({
              date: f.date,
              product: f.productName,
              dose: f.doseMlPerL,
              waterLiters: f.volumeWaterLiters,
            })),
            pendingTasksCount: activeCropTasks.filter((t) => !t.completed).length,
          }
        : {
            cultivationSystem: userPreferences.cultivationSystem || "Tierra",
            knowledgeLevel: userPreferences.knowledgeLevel || "Principiante",
          };

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend.trim(),
          history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: contextPayload,
        }),
      });

      const data = await res.json();
      const assistantReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || "No he podido generar una respuesta en este momento.",
        timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantReply]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Hubo una interrupción al conectar con Cultiva IA. Por favor, intenta nuevamente.",
          timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Handle Photo Analysis
  const handleAnalyzePhoto = async () => {
    if (!photoForAnalysis) return;
    setIsLoadingPhoto(true);
    setPhotoAnalysisResult(null);

    try {
      const chronology = activeCrop ? calculateCropChronology(activeCrop) : null;
      const res = await fetch("/api/gemini/analyze-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: photoForAnalysis,
          plantName: activeCropPlants[0]?.name || activeCrop?.name || "Planta",
          cropDay: chronology?.currentDay || 35,
          notes: photoNotes || "Inspección visual foliar",
        }),
      });
      const data = await res.json();
      setPhotoAnalysisResult(data.analysis || null);
    } catch (e) {
      console.error(e);
      setPhotoAnalysisResult({
        observations: "Error al comunicar con el servicio de análisis visual.",
        visualFeatures: [],
        pointsToWatch: "Verifica tu conexión y vuelve a intentarlo.",
        cautiousNote: "Análisis no disponible temporalmente.",
      });
    } finally {
      setIsLoadingPhoto(false);
    }
  };

  // Handle Crop Audit
  const handleGenerateAudit = async () => {
    if (!activeCrop) return;
    setIsLoadingAudit(true);
    setAuditResult(null);

    try {
      const chronology = calculateCropChronology(activeCrop);
      const res = await fetch("/api/gemini/analyze-crop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop: {
            ...activeCrop,
            currentDay: chronology.currentDay,
          },
          plants: activeCropPlants,
          logs: activeCropLogs,
          tasks: activeCropTasks,
        }),
      });
      const data = await res.json();
      setAuditResult(data.analysis || null);
    } catch (e) {
      console.error(e);
      setAuditResult(null);
    } finally {
      setIsLoadingAudit(false);
    }
  };

  const quickPrompts = [
    "¿Qué tabla y dosis de Top Crop corresponden a mi semana actual?",
    "¿Cómo evalúas la estabilidad de temperatura y humedad en mis registros?",
    "¿Qué tareas preventivas me recomiendas para esta etapa?",
    "¿Cómo evitar sobrefertilización o bloqueo de sales con Top Bud?",
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-emerald-500" />
            Cultiva IA — Asistente Agronómico
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            Copiloto técnico alimentado por tus bitácoras, cronología y el catálogo oficial Top Crop
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex p-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveAITab("chat")}
            className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer ${
              activeAITab === "chat"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            💬 Chat Técnico
          </button>
          <button
            onClick={() => setActiveAITab("photo_analysis")}
            className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer ${
              activeAITab === "photo_analysis"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            📸 Análisis Visual
          </button>
          <button
            onClick={() => setActiveAITab("crop_audit")}
            className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer ${
              activeAITab === "crop_audit"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            📊 Auditoría General
          </button>
        </div>
      </div>

      {/* 1. TAB: CHAT TECNICO */}
      {activeAITab === "chat" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Context Card */}
          <div className="lg:col-span-1 space-y-4">
            <div className="p-5 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Sprout className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono">
                  Contexto Activo
                </h3>
              </div>

              {activeCrop ? (
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="text-[10px] text-zinc-400">Cultivo</div>
                    <div className="font-bold text-zinc-800 dark:text-zinc-200">{activeCrop.name}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400">Etapa / Método</div>
                    <div className="text-zinc-700 dark:text-zinc-300 font-mono">
                      {activeCrop.stage} • {activeCrop.method}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400">Sistema Nutricional</div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                      Top Crop ({userPreferences.cultivationSystem || "Tierra"})
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400">Registros cargados</div>
                    <div className="text-zinc-600 dark:text-zinc-400 font-mono">
                      {activeCropLogs.length} logs • {activeCropFertilizations.length} fertirriegos
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-400">Sin cultivo activo seleccionado.</p>
              )}
            </div>

            {/* Quick Prompts */}
            <div className="p-5 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>Preguntas Frecuentes</span>
              </div>
              <div className="space-y-1.5">
                {quickPrompts.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="w-full p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-left text-[11px] text-zinc-600 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60 transition-colors cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Chat Messages Window */}
          <div className="lg:col-span-3 flex flex-col h-[580px] rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs overflow-hidden">
            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-start gap-3 ${
                    m.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${
                      m.role === "user"
                        ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                        : "bg-emerald-500 text-white shadow-2xs"
                    }`}
                  >
                    {m.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-tr-none font-medium"
                        : "bg-zinc-50 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 border border-zinc-200/70 dark:border-zinc-700/70 rounded-tl-none"
                    }`}
                  >
                    {m.content}
                    <div
                      className={`text-[9px] font-mono mt-1 text-right ${
                        m.role === "user" ? "text-zinc-400 dark:text-zinc-600" : "text-zinc-400"
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>
                </div>
              ))}

              {isLoadingChat && (
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/70 dark:border-zinc-700/70 text-xs text-zinc-500 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                    <span>Cultiva IA está analizando los registros botánicos...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 sm:p-4 bg-zinc-50 dark:bg-zinc-800/60 border-t border-zinc-100 dark:border-zinc-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Escribe tu consulta agronómica o técnica..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
                <button
                  type="submit"
                  disabled={!inputVal.trim() || isLoadingChat}
                  className="p-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white transition-colors cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 2. TAB: ANALISIS VISUAL */}
      {activeAITab === "photo_analysis" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-500" />
                <span>Inspección Fotográfica con Gemini Vision</span>
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Evaluación morfológica cautelosa de coloración foliar, turgencia y estructura
              </p>
            </div>

            {/* Photo Picker */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Fotografía a inspeccionar:
              </label>
              {photoForAnalysis ? (
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                  <img
                    src={photoForAnalysis}
                    alt="Planta a inspeccionar"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="p-8 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 text-center text-xs text-zinc-400">
                  No hay fotos seleccionadas. Registra una foto en la bitácora o selecciona una de la galería.
                </div>
              )}
            </div>

            {/* Gallery Selector */}
            {activeCropPhotos.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] text-zinc-400">Otras fotos del cultivo:</span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {activeCropPhotos.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setPhotoForAnalysis(f.image)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border shrink-0 cursor-pointer ${
                        photoForAnalysis === f.image
                          ? "border-emerald-500 ring-2 ring-emerald-500/30"
                          : "border-zinc-200 dark:border-zinc-700 opacity-60"
                      }`}
                    >
                      <img src={f.image} alt="Thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Optional Notes */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Notas sobre lo que observas (opcional):
              </label>
              <input
                type="text"
                placeholder="Ej. Amarillamiento leve en hojas inferiores..."
                value={photoNotes}
                onChange={(e) => setPhotoNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <button
              onClick={handleAnalyzePhoto}
              disabled={!photoForAnalysis || isLoadingPhoto}
              className="w-full py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {isLoadingPhoto ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Procesando visión botánica...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analizar Fotografía</span>
                </>
              )}
            </button>
          </div>

          {/* Results Box */}
          <div className="p-6 sm:p-8 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-zinc-700 dark:text-zinc-300">
              Diagnóstico Descriptivo
            </h3>

            {photoAnalysisResult ? (
              <div className="space-y-4 text-xs leading-relaxed animate-fade-in">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80">
                  <div className="text-[10px] font-mono uppercase text-zinc-400 mb-1">
                    Observaciones Generales
                  </div>
                  <p className="text-zinc-800 dark:text-zinc-200">
                    {photoAnalysisResult.observations}
                  </p>
                </div>

                {photoAnalysisResult.visualFeatures?.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-mono uppercase text-zinc-400">
                      Características Observables
                    </div>
                    <ul className="space-y-1">
                      {photoAnalysisResult.visualFeatures.map((feat: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-zinc-700 dark:text-zinc-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {photoAnalysisResult.pointsToWatch && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/40 text-amber-900 dark:text-amber-300 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      <span>Aspectos a Monitorear</span>
                    </div>
                    <p className="text-[11px]">{photoAnalysisResult.pointsToWatch}</p>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[10px] text-zinc-500 font-mono">
                  ⚠️ {photoAnalysisResult.cautiousNote || "Esta observación es orientativa. Consulta la Enciclopedia para guías detalladas."}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-zinc-400 space-y-2">
                <Camera className="w-8 h-8 text-zinc-300 mx-auto" />
                <p>Selecciona una imagen y haz clic en "Analizar Fotografía" para obtener la lectura descriptiva.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. TAB: AUDITORIA GENERAL */}
      {activeAITab === "crop_audit" && (
        <div className="p-6 sm:p-8 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                <span>Auditoría Integral de Métricas y Bitácora</span>
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Evaluación automatizada de consistencia de datos, rangos térmicos y pendientes
              </p>
            </div>

            <button
              onClick={handleGenerateAudit}
              disabled={!activeCrop || isLoadingAudit}
              className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
            >
              {isLoadingAudit ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Auditando cultivo...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generar Informe de Auditoría</span>
                </>
              )}
            </button>
          </div>

          {auditResult ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 space-y-2">
                <div className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-bold">
                  Resumen General
                </div>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {auditResult.summary}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 space-y-2">
                <div className="text-[10px] font-mono uppercase text-teal-600 dark:text-teal-400 font-bold">
                  Tendencias Recientes
                </div>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {auditResult.changes}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 space-y-2">
                <div className="text-[10px] font-mono uppercase text-blue-600 dark:text-blue-400 font-bold">
                  Registros Recomendados a Incorporar
                </div>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {auditResult.missingRecords}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 space-y-2">
                <div className="text-[10px] font-mono uppercase text-amber-600 dark:text-amber-400 font-bold">
                  Recomendaciones Agronómicas
                </div>
                <ul className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                  {auditResult.recommendations?.map((rec: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-zinc-400 space-y-2">
              <FileSpreadsheet className="w-8 h-8 text-zinc-300 mx-auto" />
              <p>Presiona "Generar Informe de Auditoría" para evaluar la estabilidad de tus datos y recibir sugerencias.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
