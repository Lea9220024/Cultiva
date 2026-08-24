import { Cultivo, Planta, Registro, Tarea, Foto, Evento } from "../types";

export function exportCropToCSV(crop: Cultivo, logs: Registro[], plants: Planta[]): void {
  const cropLogs = logs.filter((l) => l.cultivoId === crop.id);
  
  const headers = [
    "ID",
    "Fecha",
    "Planta",
    "Temperatura (°C)",
    "Humedad (%)",
    "Riego Realizado",
    "Volumen Riego (ml)",
    "pH",
    "EC",
    "Nutrientes",
    "Altura Registrada (cm)",
    "Etiquetas",
    "Notas",
  ];

  const rows = cropLogs.map((log) => {
    const plant = plants.find((p) => p.id === log.plantaId);
    return [
      log.id,
      `"${log.date}"`,
      `"${plant ? plant.name : "Todo el cultivo"}"`,
      log.temperature ?? "",
      log.humidity ?? "",
      log.watering?.performed ? "SI" : "NO",
      log.watering?.volumeMl ?? "",
      log.watering?.ph ?? "",
      log.watering?.ec ?? "",
      `"${log.watering?.nutrients || ""}"`,
      (log.heightCm ?? log.measurements?.heightCm ?? ""),
      `"${log.tags?.join(", ") || ""}"`,
      `"${(log.notes || "").replace(/"/g, '""')}"`,
    ];
  });

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Cultiva_${crop.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportAllLogsToCSV(logs: Registro[]): void {
  const headers = [
    "ID",
    "CultivoID",
    "PlantaID",
    "Fecha",
    "Temperatura (°C)",
    "Humedad (%)",
    "Riego Realizado",
    "Volumen Riego (ml)",
    "pH",
    "Altura Registrada (cm)",
    "Etiquetas",
    "Notas",
  ];

  const rows = logs.map((log) => [
    log.id,
    log.cultivoId,
    log.plantaId || "General",
    `"${log.date}"`,
    log.temperature ?? "",
    log.humidity ?? "",
    log.watering?.performed ? "SI" : "NO",
    log.watering?.volumeMl ?? "",
    log.watering?.ph ?? "",
    (log.heightCm ?? log.measurements?.heightCm ?? ""),
    `"${log.tags?.join(", ") || ""}"`,
    `"${(log.notes || "").replace(/"/g, '""')}"`,
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Cultiva_Diario_Completo_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportPlantsToCSV(plants: Planta[]): void {
  const headers = [
    "ID",
    "CultivoID",
    "Nombre",
    "Fecha Incorporación",
    "Etapa",
    "Estado",
    "Altura (cm)",
    "Maceta",
    "Notas",
  ];

  const rows = plants.map((p) => [
    p.id,
    p.cultivoId,
    `"${p.name}"`,
    `"${p.dateAdded}"`,
    `"${p.stage}"`,
    `"${p.status}"`,
    p.heightCm ?? "",
    `"${p.potSize || ""}"`,
    `"${(p.notes || "").replace(/"/g, '""')}"`,
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Cultiva_Plantas_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(data: any): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Cultiva_Backup_${new Date().toISOString().split("T")[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportCropReportToPDF(
  crop: Cultivo,
  plants: Planta[],
  logs: Registro[],
  photos: Foto[]
): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Por favor habilita las ventanas emergentes para generar el informe imprimible.");
    return;
  }

  const start = new Date(crop.startDate);
  const diffDays = Math.max(1, Math.floor((new Date().getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Cultiva — Pasaporte: ${crop.name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; margin: 0; background: #ffffff; }
    h1 { font-size: 24px; margin: 0 0 6px 0; color: #0f172a; }
    h2 { font-size: 16px; margin: 24px 0 10px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; color: #059669; }
    .header-box { display: flex; justify-content: space-between; border-bottom: 2px solid #059669; padding-bottom: 16px; margin-bottom: 24px; }
    .badge { display: inline-block; background: #ecfdf5; color: #047857; padding: 4px 10px; border-radius: 9999px; font-weight: 600; font-size: 12px; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
    .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; }
    .stat-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; }
    .stat-value { font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
    th { text-align: left; background: #f1f5f9; padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: 600; color: #475569; }
    td { padding: 8px 10px; border: 1px solid #e2e8f0; color: #334155; }
    tr:nth-child(even) { background: #f8fafc; }
    .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="header-box">
    <div>
      <div class="badge">Cultiva 🌱 — Pasaporte Técnico</div>
      <h1>${crop.name}</h1>
      <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px;">${crop.description || "Seguimiento botánico doméstico legal"}</p>
    </div>
    <div style="text-align: right; font-size: 12px; color: #64748b;">
      <div><strong>Inicio:</strong> ${crop.startDate}</div>
      <div><strong>Días:</strong> ${diffDays} días</div>
      <div><strong>Método:</strong> ${crop.method}</div>
      <div><strong>Estado:</strong> ${crop.status.toUpperCase()} (${crop.stage})</div>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">Plantas</div>
      <div class="stat-value">${plants.length}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Registros</div>
      <div class="stat-value">${logs.length}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Riegos Totales</div>
      <div class="stat-value">${logs.filter((l) => l.watering?.performed).length}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Fotografías</div>
      <div class="stat-value">${photos.length}</div>
    </div>
  </div>

  <h2>Plantas en Seguimiento</h2>
  <table>
    <thead>
      <tr>
        <th>Nombre</th>
        <th>Fecha Incorporación</th>
        <th>Etapa</th>
        <th>Estado</th>
        <th>Altura Actual</th>
      </tr>
    </thead>
    <tbody>
      ${plants.map((p) => `
        <tr>
          <td><strong>${p.name}</strong></td>
          <td>${p.dateAdded}</td>
          <td>${p.stage}</td>
          <td>${p.status}</td>
          <td>${p.heightCm ? p.heightCm + " cm" : "N/D"}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>

  <h2>Historial de Registros</h2>
  <table>
    <thead>
      <tr>
        <th>Fecha</th>
        <th>Planta</th>
        <th>Temp</th>
        <th>HR</th>
        <th>Riego</th>
        <th>Observaciones</th>
      </tr>
    </thead>
    <tbody>
      ${logs.map((l) => {
        const plant = plants.find((p) => p.id === l.plantaId);
        return `
          <tr>
            <td>${new Date(l.date).toLocaleDateString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
            <td>${plant ? plant.name : "Cultivo general"}</td>
            <td>${l.temperature ? l.temperature + "°C" : "-"}</td>
            <td>${l.humidity ? l.humidity + "%" : "-"}</td>
            <td>${l.watering?.performed ? (l.watering.volumeMl ? l.watering.volumeMl + " ml" : "Sí") : "No"}</td>
            <td>${l.notes || "-"}</td>
          </tr>
        `;
      }).join("")}
    </tbody>
  </table>

  <div class="footer">
    Generado con Cultiva • Documentación personal y privada de autocultivo • Fecha de emisión: ${new Date().toLocaleDateString("es-ES")}
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
