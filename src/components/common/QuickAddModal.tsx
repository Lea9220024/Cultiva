import React, { useState } from "react";
import {
  X,
  Thermometer,
  Droplets,
  Camera,
  Calendar,
  Sprout,
  Plus,
  CheckCircle2,
  FileText,
  Tag,
  Upload,
} from "lucide-react";
import { useCultiva } from "../../context/CultivaContext";
import { TagType, Priority, TaskRepeat, Stage, Method } from "../../types";

type TabMode = "registro" | "foto" | "tarea" | "planta" | "cultivo";

export const QuickAddModal: React.FC = () => {
  const {
    isQuickAddOpen,
    setIsQuickAddOpen,
    activeCrop,
    activeCropPlants,
    addRegistro,
    addFoto,
    addTarea,
    addPlanta,
    addCultivo,
  } = useCultiva();

  const [activeTab, setActiveTab] = useState<TabMode>("registro");

  // Form State - Registro
  const [selectedPlantId, setSelectedPlantId] = useState<string>("");
  const [temp, setTemp] = useState<string>("24.0");
  const [humidity, setHumidity] = useState<string>("60");
  const [waterPerformed, setWaterPerformed] = useState<boolean>(true);
  const [waterVolume, setWaterVolume] = useState<string>("1000");
  const [waterPh, setWaterPh] = useState<string>("6.3");
  const [heightMeasurement, setHeightMeasurement] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<TagType[]>(["riego", "ambiente"]);

  // Form State - Tarea
  const [taskTitle, setTaskTitle] = useState<string>("");
  const [taskDate, setTaskDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [taskTime, setTaskTime] = useState<string>("10:00");
  const [taskPriority, setTaskPriority] = useState<Priority>("media");
  const [taskRepeat, setTaskRepeat] = useState<TaskRepeat>("ninguna");
  const [taskNotes, setTaskNotes] = useState<string>("");

  // Form State - Planta
  const [newPlantName, setNewPlantName] = useState<string>("");
  const [newPlantStage, setNewPlantStage] = useState<Stage>("Vegetativo");
  const [newPlantHeight, setNewPlantHeight] = useState<string>("25.0");
  const [newPlantPot, setNewPlantPot] = useState<string>("11L Geotextil");
  const [newPlantImage, setNewPlantImage] = useState<string>(
    "https://images.unsplash.com/photo-1530968033775-2c92736b131e?auto=format&fit=crop&w=800&q=80"
  );

  // Form State - Cultivo
  const [newCropName, setNewCropName] = useState<string>("");
  const [newCropMethod, setNewCropMethod] = useState<Method>("Indoor (Carpa)");
  const [newCropSpace, setNewCropSpace] = useState<string>("80x80x160 cm — 4 Macetas 11L");
  const [newCropGenetic, setNewCropGenetic] = useState<string>("");
  const [newCropImage, setNewCropImage] = useState<string>(
    "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1000&q=80"
  );

  if (!isQuickAddOpen) return null;

  const availableTags: TagType[] = [
    "riego",
    "ambiente",
    "crecimiento",
    "observacion",
    "fotografia",
    "mantenimiento",
    "poda",
    "fertilizacion",
    "incidencia",
    "otro",
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (!file) continue;
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleTag = (tag: TagType) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSaveRegistro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCrop) {
      alert("Crea o selecciona un cultivo primero.");
      return;
    }

    addRegistro({
      cultivoId: activeCrop.id,
      plantaId: selectedPlantId || undefined,
      date: new Date().toISOString(),
      temperature: temp ? parseFloat(temp) : undefined,
      humidity: humidity ? parseFloat(humidity) : undefined,
      watering: {
        performed: waterPerformed,
        volumeMl: waterPerformed && waterVolume ? parseFloat(waterVolume) : undefined,
        ph: waterPerformed && waterPh ? parseFloat(waterPh) : undefined,
      },
      measurements: heightMeasurement
        ? { heightCm: parseFloat(heightMeasurement) }
        : undefined,
      notes: notes.trim() || (waterPerformed ? "Riego rutinario completado." : "Revisión de parámetros ambientales."),
      images,
      tags: selectedTags,
    });

    // Close & reset
    setIsQuickAddOpen(false);
    setNotes("");
    setImages([]);
  };

  const handleSaveFoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCrop) return;
    if (images.length === 0) {
      alert("Por favor selecciona o sube al menos una fotografía.");
      return;
    }

    const start = new Date(activeCrop.startDate);
    const now = new Date();
    const cropDay = Math.max(1, Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    images.forEach((img) => {
      addFoto({
        cultivoId: activeCrop.id,
        plantaId: selectedPlantId || undefined,
        date: now.toISOString().split("T")[0],
        cropDay,
        image: img,
        stage: activeCrop.stage,
        notes: notes || "Fotografía de seguimiento periódico.",
        tags: selectedTags,
      });
    });

    setIsQuickAddOpen(false);
    setImages([]);
    setNotes("");
  };

  const handleSaveTarea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCrop || !taskTitle.trim()) return;

    addTarea({
      cultivoId: activeCrop.id,
      plantaId: selectedPlantId || undefined,
      title: taskTitle.trim(),
      date: taskDate,
      time: taskTime,
      priority: taskPriority,
      repeat: taskRepeat,
      completed: false,
      notes: taskNotes,
    });

    setIsQuickAddOpen(false);
    setTaskTitle("");
    setTaskNotes("");
  };

  const handleSavePlanta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCrop || !newPlantName.trim()) return;

    addPlanta({
      cultivoId: activeCrop.id,
      name: newPlantName.trim(),
      dateAdded: new Date().toISOString().split("T")[0],
      stage: newPlantStage,
      status: "Óptimo",
      heightCm: newPlantHeight ? parseFloat(newPlantHeight) : undefined,
      potSize: newPlantPot,
      image: newPlantImage,
    });

    setIsQuickAddOpen(false);
    setNewPlantName("");
  };

  const handleSaveCultivo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCropName.trim()) return;

    addCultivo({
      name: newCropName.trim(),
      startDate: new Date().toISOString().split("T")[0],
      status: "activo",
      stage: "Vegetativo",
      description: "Nuevo cultivo doméstico.",
      method: newCropMethod,
      space: newCropSpace,
      image: newCropImage,
      geneticName: newCropGenetic || "Variedad Botánica",
      geneticType: "Fotoperiódica",
    });

    setIsQuickAddOpen(false);
    setNewCropName("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Registro Rápido
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activeCrop ? `Cultivo: ${activeCrop.name}` : "Crea tu primer registro"}
            </p>
          </div>
          <button
            onClick={() => setIsQuickAddOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/30 p-1.5 gap-1 overflow-x-auto">
          {[
            { id: "registro", label: "Registro", icon: <FileText className="w-3.5 h-3.5" /> },
            { id: "foto", label: "Fotografía", icon: <Camera className="w-3.5 h-3.5" /> },
            { id: "tarea", label: "Tarea", icon: <Calendar className="w-3.5 h-3.5" /> },
            { id: "planta", label: "Planta", icon: <Sprout className="w-3.5 h-3.5" /> },
            { id: "cultivo", label: "Cultivo", icon: <Plus className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabMode)}
              className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                activeTab === tab.id
                  ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: REGISTRO RÁPIDO */}
          {activeTab === "registro" && (
            <form onSubmit={handleSaveRegistro} className="space-y-4">
              {/* Plant selector */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Planta asociada
                </label>
                <select
                  value={selectedPlantId}
                  onChange={(e) => setSelectedPlantId(e.target.value)}
                  className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">🌱 Todo el cultivo (Registro general)</option>
                  {activeCropPlants.map((plant) => (
                    <option key={plant.id} value={plant.id}>
                      {plant.name} — ({plant.stage}, {plant.heightCm ? `${plant.heightCm}cm` : "sin medir"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Temp & Humidity 2-column */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                      Temperatura
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {temp}°C
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    min="10"
                    max="45"
                    value={temp}
                    onChange={(e) => setTemp(e.target.value)}
                    className="w-full text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-slate-800 dark:text-slate-200 font-mono"
                    placeholder="24.0"
                  />
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-sky-500" />
                      Humedad
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {humidity}%
                    </span>
                  </div>
                  <input
                    type="number"
                    step="1"
                    min="10"
                    max="99"
                    value={humidity}
                    onChange={(e) => setHumidity(e.target.value)}
                    className="w-full text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-slate-800 dark:text-slate-200 font-mono"
                    placeholder="60"
                  />
                </div>
              </div>

              {/* Riego 1-Tap Toggle */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-emerald-500" />
                    ¿Se realizó riego?
                  </span>
                  <button
                    type="button"
                    onClick={() => setWaterPerformed(!waterPerformed)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      waterPerformed
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {waterPerformed ? "SÍ, REGADO" : "NO"}
                  </button>
                </div>

                {waterPerformed && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <label className="text-[11px] text-slate-500 dark:text-slate-400">Volumen (ml)</label>
                      <input
                        type="number"
                        step="50"
                        value={waterVolume}
                        onChange={(e) => setWaterVolume(e.target.value)}
                        className="w-full text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-1 font-mono mt-0.5 text-slate-800 dark:text-slate-200"
                        placeholder="1000"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 dark:text-slate-400">pH del agua</label>
                      <input
                        type="number"
                        step="0.1"
                        value={waterPh}
                        onChange={(e) => setWaterPh(e.target.value)}
                        className="w-full text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-1 font-mono mt-0.5 text-slate-800 dark:text-slate-200"
                        placeholder="6.3"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Altura / Medición (opcional) */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Medición de altura (cm) <span className="text-slate-400 font-normal">(Opcional)</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={heightMeasurement}
                  onChange={(e) => setHeightMeasurement(e.target.value)}
                  className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-800 dark:text-slate-200 font-mono"
                  placeholder="Ej: 38.5"
                />
              </div>

              {/* Tags Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-slate-400" />
                  Etiquetas rápidas
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                          isSelected
                            ? "bg-emerald-600 text-white font-semibold shadow-2xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes & Photos */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Observaciones / Notas
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Escribe detalles del día, vigor foliar, cambios observados..."
                />
              </div>

              {/* Image attachment */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Adjuntar fotografías
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors">
                    <Camera className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Cámara / Galería</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {images.length > 0 && (
                    <span className="text-xs text-emerald-600 font-semibold">
                      {images.length} foto(s) cargada(s)
                    </span>
                  )}
                </div>

                {images.length > 0 && (
                  <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                        <img src={img} alt="preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImages(images.filter((_, i) => i !== idx))}
                          className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Guardar Registro en 1 Clic</span>
              </button>
            </form>
          )}

          {/* TAB 2: FOTOGRAFÍA */}
          {activeTab === "foto" && (
            <form onSubmit={handleSaveFoto} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Planta
                </label>
                <select
                  value={selectedPlantId}
                  onChange={(e) => setSelectedPlantId(e.target.value)}
                  className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-800 dark:text-slate-200"
                >
                  <option value="">🌱 Foto general del cultivo</option>
                  {activeCropPlants.map((plant) => (
                    <option key={plant.id} value={plant.id}>
                      {plant.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Upload Zone */}
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-emerald-500 transition-colors">
                <input
                  type="file"
                  id="photo-upload-input"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="photo-upload-input"
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Toca para tomar foto o subir archivo
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1">
                    Soporta múltiples imágenes (JPG, PNG, WebP)
                  </span>
                </label>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                      <img src={img} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImages(images.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Observación de la fotografía
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 text-slate-800 dark:text-slate-200"
                  placeholder="Detalles sobre el ángulo, luz o estructura..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Agregar a la Galería</span>
              </button>
            </form>
          )}

          {/* TAB 3: TAREA */}
          {activeTab === "tarea" && (
            <form onSubmit={handleSaveTarea} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Título de la tarea *
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-800 dark:text-slate-200"
                  placeholder="Ej: Riego con bioestimulante, Poda de bajos, etc."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Fecha programada
                  </label>
                  <input
                    type="date"
                    value={taskDate}
                    onChange={(e) => setTaskDate(e.target.value)}
                    className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-800 dark:text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Hora
                  </label>
                  <input
                    type="time"
                    value={taskTime}
                    onChange={(e) => setTaskTime(e.target.value)}
                    className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-800 dark:text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Repetición
                  </label>
                  <select
                    value={taskRepeat}
                    onChange={(e) => setTaskRepeat(e.target.value as TaskRepeat)}
                    className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-800 dark:text-slate-200"
                  >
                    <option value="ninguna">Única vez</option>
                    <option value="diaria">Diaria</option>
                    <option value="cada_2_dias">Cada 2 días</option>
                    <option value="semanal">Semanal</option>
                    <option value="cada_15_dias">Cada 15 días</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Prioridad
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as Priority)}
                    className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-800 dark:text-slate-200"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta ⚠️</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Notas de la tarea
                </label>
                <textarea
                  rows={2}
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 text-slate-800 dark:text-slate-200"
                  placeholder="Detalles sobre dosis o recordatorios..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Programar Tarea</span>
              </button>
            </form>
          )}

          {/* TAB 4: PLANTA */}
          {activeTab === "planta" && (
            <form onSubmit={handleSavePlanta} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nombre o Identificador *
                </label>
                <input
                  type="text"
                  required
                  value={newPlantName}
                  onChange={(e) => setNewPlantName(e.target.value)}
                  className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-800 dark:text-slate-200"
                  placeholder="Ej: Planta #04 (Esqueje Selección)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Etapa Actual
                  </label>
                  <select
                    value={newPlantStage}
                    onChange={(e) => setNewPlantStage(e.target.value as Stage)}
                    className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-800 dark:text-slate-200"
                  >
                    <option value="Germinación">Germinación</option>
                    <option value="Plántula">Plántula</option>
                    <option value="Vegetativo">Vegetativo</option>
                    <option value="Pre-floración">Pre-floración</option>
                    <option value="Floración">Floración</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Altura inicial (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newPlantHeight}
                    onChange={(e) => setNewPlantHeight(e.target.value)}
                    className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-800 dark:text-slate-200 font-mono"
                    placeholder="25.0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Maceta / Contenedor
                </label>
                <input
                  type="text"
                  value={newPlantPot}
                  onChange={(e) => setNewPlantPot(e.target.value)}
                  className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-800 dark:text-slate-200"
                  placeholder="Ej: 11L Geotextil, 3L Plástica, etc."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  URL de Imagen / Foto
                </label>
                <input
                  type="text"
                  value={newPlantImage}
                  onChange={(e) => setNewPlantImage(e.target.value)}
                  className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-800 dark:text-slate-200 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sprout className="w-4 h-4" />
                <span>Incorporar Planta al Cultivo</span>
              </button>
            </form>
          )}

          {/* TAB 5: CULTIVO */}
          {activeTab === "cultivo" && (
            <form onSubmit={handleSaveCultivo} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nombre del Cultivo *
                </label>
                <input
                  type="text"
                  required
                  value={newCropName}
                  onChange={(e) => setNewCropName(e.target.value)}
                  className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-800 dark:text-slate-200"
                  placeholder="Ej: Ciclo Invierno 2026, Jardín Primavera..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Método de cultivo
                  </label>
                  <select
                    value={newCropMethod}
                    onChange={(e) => setNewCropMethod(e.target.value as Method)}
                    className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-800 dark:text-slate-200"
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
                    Genética / Variedad
                  </label>
                  <input
                    type="text"
                    value={newCropGenetic}
                    onChange={(e) => setNewCropGenetic(e.target.value)}
                    className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-800 dark:text-slate-200"
                    placeholder="Ej: Aura Verde #4"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Espacio y Equipamiento
                </label>
                <input
                  type="text"
                  value={newCropSpace}
                  onChange={(e) => setNewCropSpace(e.target.value)}
                  className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-800 dark:text-slate-200"
                  placeholder="Ej: 80x80x160 cm — LED 240W Quantum Board"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Nuevo Cultivo</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
