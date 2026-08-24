import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy initialize Gemini API client with required User-Agent
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. Mock responses will be used if needed.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "dummy_key",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint (Used by Render for zero-downtime health verification)
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "Cultiva",
    version: "2.1.0",
    environment: process.env.NODE_ENV || "development",
    port: PORT,
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// 1. Analyze Crop Endpoint
app.post("/api/gemini/analyze-crop", async (req, res) => {
  try {
    const { crop, plants, logs, tasks, alerts } = req.body;
    const ai = getGeminiClient();

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: true,
        analysis: {
          summary: `El cultivo "${crop?.name || "Activo"}" se encuentra en el día ${crop?.currentDay || 35} (${crop?.stage || "Vegetativo"}). Los registros muestran una evolución estable con parámetros ambientales dentro de los rangos registrados habitualmente.`,
          changes: "En los últimos 7 días la temperatura media osciló entre 22°C y 25°C, con humedad relativa del 58% al 65%. La frecuencia de riego se mantiene cada 2-3 días.",
          missingRecords: "Se sugiere registrar la medición de altura de las plantas cada 5-7 días y documentar fotos frontales con luz natural.",
          tasksOverview: `Tenés ${tasks?.filter((t: any) => !t.completed)?.length || 0} tareas pendientes programadas.`,
          recommendations: [
            "Mantener la inspección visual del envés de las hojas.",
            "Registrar el pH o volumen de agua en el próximo riego.",
            "Observar la distancia a la fuente lumínica."
          ],
        },
      });
    }

    const systemInstruction = `Sos "Cultiva IA", un asistente técnico y copiloto botánico para autocultivos legales domésticos.
Analizá los datos provistos (cultivo, plantas, historial de registros, tareas y alertas).
NORMAS OBLIGATORIAS:
- Lenguaje profesional, natural, tecnológico y no dogmático ("Se observa...", "Podría ser compatible con...", "Sería conveniente registrar...").
- No inventar diagnósticos definitivos ni dar prescripciones químicas peligrosas.
- Focalizate en tendencias de datos (temperatura, humedad, frecuencia de riego, ritmo de crecimiento) y tareas pendientes.
- Responde siempre en español en formato JSON estructurado.`;

    const prompt = `Analiza este cultivo y genera un informe estructurado:
Datos del Cultivo:
${JSON.stringify({ crop, plantsCount: plants?.length, plants, recentLogs: logs?.slice(0, 15), tasks: tasks?.slice(0, 10), alerts }, null, 2)}

Devuelve únicamente un JSON válido con el siguiente formato:
{
  "summary": "Resumen general del estado del cultivo y días transcurridos",
  "changes": "Resumen de cambios recientes y tendencias ambientales/riego observadas",
  "missingRecords": "Registros o datos que convendría incorporar para un mejor seguimiento",
  "tasksOverview": "Estado de tareas pendientes prioritarias",
  "recommendations": ["Punto a observar 1", "Punto a observar 2", "Punto a observar 3"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    res.json({ success: true, analysis: data });
  } catch (error: any) {
    console.error("Error analyzing crop:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Error al procesar el análisis con Gemini IA",
    });
  }
});

// 2. Analyze Photo Endpoint (Vision)
app.post("/api/gemini/analyze-photo", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", plantName, cropDay, notes } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, error: "No se proporcionó imagen" });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const ai = getGeminiClient();

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: true,
        analysis: {
          observations: "Se observa follaje con tonalidad verde uniforme y desarrollo foliar estructurado. La morfología general presenta buena turgencia.",
          visualFeatures: [
            "Coloración foliar saludable sin clorosis evidente en hojas superiores",
            "Entrenudos con espaciado regular",
            "Turgencia foliar adecuada"
          ],
          pointsToWatch: "Monitorear posibles variaciones de color en hojas basales y registrar altura en el próximo ciclo.",
          cautiousNote: "Esta observación es meramente descriptiva y orientativa. Registrá nuevas fotos en 48-72hs para evaluar evolución.",
        },
      });
    }

    const systemInstruction = `Sos "Cultiva IA", un observador botánico para autocultivos domésticos.
INSTRUCCIONES CLAVE:
1. Describe ÚNICAMENTE características visuales observables de la planta (coloración, manchas, vigor foliar, forma, entrenudos, signos de deshidratación o excesos aparentes).
2. NUNCA des diagnósticos categóricos ni definitivos.
3. Usar estrictamente fórmulas cautelosas como:
   - "Se observa..."
   - "Podría ser compatible con..."
   - "Presenta características visuales de..."
   - "Sería conveniente observar nuevamente en las próximas 48hs..."
4. Responde en español en formato JSON.`;

    const prompt = `Analiza esta fotografía botánica de la planta "${plantName || "Planta"}" (Día de cultivo: ${cropDay || "N/D"}). Notas del cultivador: "${notes || "Sin notas adicionales"}".

Devuelve ÚNICAMENTE un JSON con:
{
  "observations": "Descripción visual detallada de lo que se aprecia en la imagen",
  "visualFeatures": ["Característica visible 1", "Característica visible 2", "Característica visible 3"],
  "pointsToWatch": "Zonas o detalles que convendría volver a fotografiar o vigilar",
  "cautiousNote": "Nota de cautela y sugerencia de seguimiento temporal"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType || "image/jpeg",
            },
          },
          { text: prompt },
        ],
      },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    res.json({ success: true, analysis: data });
  } catch (error: any) {
    console.error("Error analyzing photo:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Error al analizar la fotografía con Gemini",
    });
  }
});

// 3. Contextual Chat Endpoint
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, history = [], context } = req.body;
    const ai = getGeminiClient();

    if (!message) {
      return res.status(400).json({ success: false, error: "Mensaje requerido" });
    }

    if (!process.env.GEMINI_API_KEY) {
      let reply = `Basándome en los registros de tu cultivo "${context?.crop?.name || "Cultivo Activo"}": `;
      if (message.toLowerCase().includes("riego")) {
        reply += `El último registro de riego fue el ${context?.lastWatering || "hace 2 días"}. Los niveles de humedad se mantienen estables.`;
      } else if (message.toLowerCase().includes("tarea") || message.toLowerCase().includes("pendiente")) {
        const count = context?.pendingTasksCount || 2;
        reply += `Tenés ${count} tareas pendientes, entre ellas: ${context?.nextTaskTitle || "Revisar sustrato y medir pH"}.`;
      } else if (message.toLowerCase().includes("planta")) {
        reply += `Tu cultivo cuenta con ${context?.plantsCount || 3} plantas registradas en etapa ${context?.crop?.stage || "Vegetativo"}.`;
      } else {
        reply += `He revisado tus datos. El cultivo lleva ${context?.crop?.currentDay || 35} días. ¿Te gustaría registrar una nueva medición, analizar una foto o revisar las tareas del calendario?`;
      }
      return res.json({ success: true, reply });
    }

    const systemInstruction = `Sos "Cultiva IA", el copiloto inteligente integrado de la app Cultiva.
Conocés el contexto exacto del cultivo activo del usuario, sus plantas, registros históricos, fotos y tareas.
REGLAS:
- Respondé de forma concisa, cálida, técnica y útil en español.
- Usá el contexto proporcionado con precisión (mencioná fechas reales de registros, temperaturas, nombres de plantas, días de cultivo).
- Jamás diagnostiques de forma absoluta; fomentá la observación rigurosa y el registro continuo.
- Formateá con Markdown claro (listas cortas, negrita en datos clave).

Contexto del Cultivo del Usuario:
${JSON.stringify(context, null, 2)}`;

    // Build contents for multi-turn chat if needed
    const contents = [
      ...history.map((h: any) => ({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.content }],
      })),
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || "No pude generar una respuesta en este momento.";
    res.json({ success: true, reply });
  } catch (error: any) {
    console.error("Error in chat:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Error en el chat de IA",
    });
  }
});

// 4. Compare Crops AI Analysis
app.post("/api/gemini/compare-crops", async (req, res) => {
  try {
    const { cropA, cropB } = req.body;
    const ai = getGeminiClient();

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: true,
        comparison: {
          overview: `Comparando "${cropA?.name || "Cultivo A"}" con "${cropB?.name || "Cultivo B"}".`,
          durationDiff: `El Cultivo A duró ${cropA?.totalDays || 70} días frente a ${cropB?.totalDays || 65} días del Cultivo B.`,
          metricsComparison: "Ambos cultivos mantuvieron promedios térmicos similares (23.5°C vs 24.1°C), con mayor estabilidad de humedad en el segundo.",
          keyLearnings: [
            "Mayor frecuencia de registros fotográficos en el cultivo más reciente.",
            "Mejor control de riegos regulares reflejado en el vigor registrado.",
          ],
        },
      });
    }

    const prompt = `Compara estos dos cultivos históricos y destaca diferencias en duración, estabilidad de parámetros ambientales, cantidad de registros y observaciones clave:
Cultivo A: ${JSON.stringify(cropA, null, 2)}
Cultivo B: ${JSON.stringify(cropB, null, 2)}

Devuelve únicamente un JSON:
{
  "overview": "Resumen comparativo",
  "durationDiff": "Análisis de tiempos y etapas",
  "metricsComparison": "Comparación de temperatura/humedad/frecuencia de registros",
  "keyLearnings": ["Aprendizaje 1", "Aprendizaje 2", "Aprendizaje 3"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json({ success: true, comparison: data });
  } catch (error: any) {
    console.error("Error comparing crops:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Vite Middleware for SPA development & static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Resolve dist path robustly across local build and Render production
    const distPath = fs.existsSync(path.join(__dirname, "index.html"))
      ? __dirname
      : path.join(process.cwd(), "dist");

    console.log(`[Production] Serving static frontend from: ${distPath}`);
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Cultiva Server successfully started on http://0.0.0.0:${PORT} (ENV: ${process.env.NODE_ENV || "development"})`);
  });
}

startServer();

