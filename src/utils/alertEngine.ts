import { Alerta, Cultivo, Registro, Tarea } from "../types";

export function calculateAlerts(
  crop: Cultivo | null,
  logs: Registro[],
  tasks: Tarea[]
): Alerta[] {
  if (!crop) return [];

  const alerts: Alerta[] = [];
  const now = new Date();
  const cropLogs = logs.filter((l) => l.cultivoId === crop.id);
  const cropTasks = tasks.filter((t) => t.cultivoId === crop.id);

  // 1. Check for pending overdue tasks
  const todayStr = now.toISOString().split("T")[0];
  const overdueTasks = cropTasks.filter((t) => !t.completed && t.date < todayStr);
  if (overdueTasks.length > 0) {
    alerts.push({
      id: "alert-overdue-tasks",
      cultivoId: crop.id,
      type: "urgent",
      title: "Tareas vencidas pendientes",
      message: `Tenés ${overdueTasks.length} tarea(s) pendiente(s) anterior(es) a hoy. Revisá tu calendario para mantener el seguimiento al día.`,
      date: todayStr,
      actionPath: "tasks",
    });
  }

  // 2. Check for missing recent logs (> 48hs without log)
  if (cropLogs.length > 0) {
    const sortedLogs = [...cropLogs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const lastLogDate = new Date(sortedLogs[0].date);
    const diffHours = (now.getTime() - lastLogDate.getTime()) / (1000 * 60 * 60);

    if (diffHours > 48) {
      alerts.push({
        id: "alert-no-recent-log",
        cultivoId: crop.id,
        type: "warning",
        title: "Registro de seguimiento sugerido",
        message: `Han transcurrido más de ${Math.floor(diffHours / 24)} días desde la última entrada en la bitácora. Un registro rápido te ayuda a mantener las curvas de evolución precisas.`,
        date: todayStr,
        actionPath: "diary",
      });
    }

    // 3. Check for environmental changes (> 4°C shift or > 15% humidity shift compared to recent average)
    const logsWithTemp = cropLogs.filter((l) => typeof l.temperature === "number");
    if (logsWithTemp.length >= 3) {
      const recentTemps = logsWithTemp.slice(0, 3).map((l) => l.temperature!);
      const olderTemps = logsWithTemp.slice(3, 8).map((l) => l.temperature!);
      if (olderTemps.length > 0) {
        const recentAvg = recentTemps.reduce((a, b) => a + b, 0) / recentTemps.length;
        const olderAvg = olderTemps.reduce((a, b) => a + b, 0) / olderTemps.length;
        const diff = Math.abs(recentAvg - olderAvg);

        if (diff >= 3.5) {
          alerts.push({
            id: "alert-temp-shift",
            cultivoId: crop.id,
            type: "info",
            title: "Variación detectada en temperatura",
            message: `Se detectó un cambio de ${diff.toFixed(1)}°C respecto de tus registros anteriores. Te sugerimos revisar la ventilación y el historial de mediciones.`,
            date: todayStr,
            actionPath: "dashboard",
          });
        }
      }
    }

    // 4. Check for humidity shift
    const logsWithHum = cropLogs.filter((l) => typeof l.humidity === "number");
    if (logsWithHum.length >= 3) {
      const recentHum = logsWithHum.slice(0, 3).map((l) => l.humidity!);
      const olderHum = logsWithHum.slice(3, 8).map((l) => l.humidity!);
      if (olderHum.length > 0) {
        const recentAvg = recentHum.reduce((a, b) => a + b, 0) / recentHum.length;
        const olderAvg = olderHum.reduce((a, b) => a + b, 0) / olderHum.length;
        const diff = Math.abs(recentAvg - olderAvg);

        if (diff >= 12) {
          alerts.push({
            id: "alert-hum-shift",
            cultivoId: crop.id,
            type: "info",
            title: "Variación detectada en humedad relativa",
            message: `Se detectó un cambio del ${diff.toFixed(0)}% en la humedad respecto de tus promedios previos. Podés consultar el gráfico de evolución en el dashboard.`,
            date: todayStr,
            actionPath: "dashboard",
          });
        }
      }
    }
  }

  return alerts;
}
