import React, { createContext, useContext, useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Cultivo,
  Planta,
  Registro,
  Tarea,
  Foto,
  Evento,
  Achievement,
  Alerta,
  UserPreferences,
  FertilizationLog,
  UserFertilizer,
  UserLearningProgress,
  CultivoDates,
  CustomStage,
  UserKnowledgeLevel,
} from "../types";
import {
  initialCultivo,
  initialPlantas,
  initialRegistros,
  initialFertilizationLogs,
  initialUserFertilizers,
  initialTareas,
  initialFotos,
  initialEventos,
  initialAchievements,
  initialLearningProgress,
  mockArchivedCrop,
} from "../mockData";
import { calculateAlerts } from "../utils/alertEngine";

export type NavTab =
  | "dashboard"
  | "crops"
  | "tasks"
  | "diary"
  | "photos"
  | "nutrition"
  | "encyclopedia"
  | "ai"
  | "settings";

export type QuickAddType = "registro" | "fertilizacion" | "riego" | "tarea" | "foto" | "planta";

interface CultivaContextType {
  cultivos: Cultivo[];
  activeCrop: Cultivo | null;
  activeCropId: string | null;
  plantas: Planta[];
  activeCropPlants: Planta[];
  registros: Registro[];
  activeCropLogs: Registro[];
  fertilizationLogs: FertilizationLog[];
  activeCropFertilizations: FertilizationLog[];
  userFertilizers: UserFertilizer[];
  tareas: Tarea[];
  activeCropTasks: Tarea[];
  fotos: Foto[];
  activeCropPhotos: Foto[];
  eventos: Evento[];
  activeCropEvents: Evento[];
  learningProgress: UserLearningProgress;
  achievements: Achievement[];
  alerts: Alerta[];
  userPreferences: UserPreferences;
  currentTab: NavTab;
  isQuickAddOpen: boolean;
  quickAddDefaultType: QuickAddType;
  isSearchOpen: boolean;
  isOnboardingOpen: boolean;
  isAdjustChronologyOpen: boolean;
  isDateSettingsOpen: boolean;
  isCustomStagesOpen: boolean;
  selectedPlantIdForModal: string | null;

  setCurrentTab: (tab: NavTab) => void;
  setActiveCropId: (id: string | null) => void;
  setIsQuickAddOpen: (open: boolean, defaultType?: QuickAddType) => void;
  setIsSearchOpen: (open: boolean) => void;
  setIsOnboardingOpen: (open: boolean) => void;
  setIsAdjustChronologyOpen: (open: boolean) => void;
  setIsDateSettingsOpen: (open: boolean) => void;
  setIsCustomStagesOpen: (open: boolean) => void;
  setSelectedPlantIdForModal: (id: string | null) => void;
  toggleTheme: () => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  completeOnboarding: () => void;

  updateCultivo: (id: string, data: Partial<Cultivo>) => void;
  updateCropDates: (id: string, dates: CultivoDates) => void;
  adjustCropChronology: (id: string, newStartDate: string, reason?: string) => void;
  updateCropStages: (id: string, stages: CustomStage[]) => void;

  addCultivo: (cultivo: Omit<Cultivo, "id">) => Cultivo;
  deleteCultivo: (id: string) => void;
  archiveCultivo: (id: string) => void;

  addPlanta: (planta: Omit<Planta, "id">) => Planta;
  updatePlanta: (id: string, data: Partial<Planta>) => void;
  deletePlanta: (id: string) => void;

  addRegistro: (registro: Omit<Registro, "id">) => Registro;
  deleteRegistro: (id: string) => void;

  addFertilizationLog: (log: Omit<FertilizationLog, "id">) => FertilizationLog;
  deleteFertilizationLog: (id: string) => void;

  addUserFertilizer: (fert: Omit<UserFertilizer, "id" | "createdAt">) => UserFertilizer;
  updateUserFertilizer: (id: string, data: Partial<UserFertilizer>) => void;
  deleteUserFertilizer: (id: string) => void;

  addTarea: (tarea: Omit<Tarea, "id">) => Tarea;
  toggleTarea: (id: string) => void;
  updateTarea: (id: string, data: Partial<Tarea>) => void;
  deleteTarea: (id: string) => void;

  addFoto: (foto: Omit<Foto, "id">) => Foto;
  deleteFoto: (id: string) => void;

  addEvento: (evento: Omit<Evento, "id">) => Evento;
  deleteEvento: (id: string) => void;

  markArticleAsRead: (articleId: string) => void;
  toggleFavoriteArticle: (articleId: string) => void;
  toggleFavoriteProduct: (productId: string) => void;
  toggleFavoriteSource: (sourceId: string) => void;
  toggleFavoriteLog: (logId: string) => void;
  updateKnowledgeLevel: (level: UserKnowledgeLevel) => void;

  clearAllData: () => void;
  resetAllData: () => void;
  loadDemoData: () => void;
}

const CultivaContext = createContext<CultivaContextType | null>(null);

const STORAGE_KEYS = {
  CULTIVOS: "cultiva_v2_cultivos",
  PLANTAS: "cultiva_v2_plantas",
  REGISTROS: "cultiva_v2_registros",
  FERTILIZATIONS: "cultiva_v2_fertilizations",
  USER_FERTILIZERS: "cultiva_v2_user_fertilizers",
  TAREAS: "cultiva_v2_tareas",
  FOTOS: "cultiva_v2_fotos",
  EVENTOS: "cultiva_v2_eventos",
  LEARNING: "cultiva_v2_learning",
  ACHIEVEMENTS: "cultiva_v2_achievements",
  PREFERENCES: "cultiva_v2_preferences",
};

export const CultivaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cultivos, setCultivos] = useState<Cultivo[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CULTIVOS) || localStorage.getItem("cultiva_v1_cultivos");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [initialCultivo, mockArchivedCrop];
  });

  const [activeCropId, setActiveCropId] = useState<string | null>(() => {
    return cultivos[0]?.id || "cultivo-1";
  });

  const [plantas, setPlantas] = useState<Planta[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLANTAS) || localStorage.getItem("cultiva_v1_plantas");
    if (saved) { try { return JSON.parse(saved); } catch (e) { console.error(e); } }
    return initialPlantas;
  });

  const [registros, setRegistros] = useState<Registro[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REGISTROS) || localStorage.getItem("cultiva_v1_registros");
    if (saved) { try { return JSON.parse(saved); } catch (e) { console.error(e); } }
    return initialRegistros;
  });

  const [fertilizationLogs, setFertilizationLogs] = useState<FertilizationLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FERTILIZATIONS);
    if (saved) { try { return JSON.parse(saved); } catch (e) { console.error(e); } }
    return initialFertilizationLogs;
  });

  const [userFertilizers, setUserFertilizers] = useState<UserFertilizer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_FERTILIZERS);
    if (saved) { try { return JSON.parse(saved); } catch (e) { console.error(e); } }
    return initialUserFertilizers;
  });

  const [tareas, setTareas] = useState<Tarea[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TAREAS) || localStorage.getItem("cultiva_v1_tareas");
    if (saved) { try { return JSON.parse(saved); } catch (e) { console.error(e); } }
    return initialTareas;
  });

  const [fotos, setFotos] = useState<Foto[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FOTOS) || localStorage.getItem("cultiva_v1_fotos");
    if (saved) { try { return JSON.parse(saved); } catch (e) { console.error(e); } }
    return initialFotos;
  });

  const [eventos, setEventos] = useState<Evento[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EVENTOS) || localStorage.getItem("cultiva_v1_eventos");
    if (saved) { try { return JSON.parse(saved); } catch (e) { console.error(e); } }
    return initialEventos;
  });

  const [learningProgress, setLearningProgress] = useState<UserLearningProgress>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LEARNING);
    if (saved) { try { return JSON.parse(saved); } catch (e) { console.error(e); } }
    return initialLearningProgress;
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    if (saved) { try { return JSON.parse(saved); } catch (e) { console.error(e); } }
    return initialAchievements;
  });

  const [userPreferences, setUserPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PREFERENCES) || localStorage.getItem("cultiva_v1_prefs");
    if (saved) { try { return JSON.parse(saved); } catch (e) { console.error(e); } }
    return {
      theme: "dark",
      tempUnit: "C",
      onboardingCompleted: true,
      activeCropId: "cultivo-1",
      notificationsEnabled: true,
      knowledgeLevel: "Principiante",
      cultivationSystem: "Tierra",
      showAdvancedContent: false,
      enableEducationalRecommendations: true,
      preferredSourcesOnly: true,
    };
  });

  const [currentTab, setCurrentTab] = useState<NavTab>("dashboard");
  const [isQuickAddOpen, setIsQuickAddOpenState] = useState(false);
  const [quickAddDefaultType, setQuickAddDefaultType] = useState<QuickAddType>("registro");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAdjustChronologyOpen, setIsAdjustChronologyOpen] = useState(false);
  const [isDateSettingsOpen, setIsDateSettingsOpen] = useState(false);
  const [isCustomStagesOpen, setIsCustomStagesOpen] = useState(false);
  const [selectedPlantIdForModal, setSelectedPlantIdForModal] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CULTIVOS, JSON.stringify(cultivos)); }, [cultivos]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PLANTAS, JSON.stringify(plantas)); }, [plantas]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.REGISTROS, JSON.stringify(registros)); }, [registros]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.FERTILIZATIONS, JSON.stringify(fertilizationLogs)); }, [fertilizationLogs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.USER_FERTILIZERS, JSON.stringify(userFertilizers)); }, [userFertilizers]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TAREAS, JSON.stringify(tareas)); }, [tareas]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.FOTOS, JSON.stringify(fotos)); }, [fotos]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.EVENTOS, JSON.stringify(eventos)); }, [eventos]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.LEARNING, JSON.stringify(learningProgress)); }, [learningProgress]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements)); }, [achievements]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(userPreferences)); }, [userPreferences]);

  const activeCrop = cultivos.find((c) => c.id === activeCropId) || null;
  const activeCropPlants = plantas.filter((p) => p.cultivoId === activeCropId);
  const activeCropLogs = registros.filter((r) => r.cultivoId === activeCropId);
  const activeCropFertilizations = fertilizationLogs.filter((f) => f.cultivoId === activeCropId);
  const activeCropTasks = tareas.filter((t) => t.cultivoId === activeCropId);
  const activeCropPhotos = fotos.filter((f) => f.cultivoId === activeCropId);
  const activeCropEvents = eventos.filter((e) => e.cultivoId === activeCropId);

  const alerts: Alerta[] = calculateAlerts(activeCrop, activeCropLogs, activeCropTasks);

  const toggleTheme = () => {
    setUserPreferences((prev) => {
      const nextTheme = prev.theme === "dark" ? "light" : "dark";
      if (nextTheme === "dark") document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      return { ...prev, theme: nextTheme };
    });
  };

  const updatePreferences = (prefs: Partial<UserPreferences>) => {
    setUserPreferences((prev) => ({ ...prev, ...prefs }));
  };

  const completeOnboarding = () => {
    updatePreferences({ onboardingCompleted: true });
    setIsOnboardingOpen(false);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  };

  const setIsQuickAddOpen = (open: boolean, defaultType: QuickAddType = "registro") => {
    setQuickAddDefaultType(defaultType);
    setIsQuickAddOpenState(open);
  };

  const addCultivo = (cultivoData: Omit<Cultivo, "id">): Cultivo => {
    const newCrop: Cultivo = { ...cultivoData, id: "cultivo-" + Date.now() };
    setCultivos((prev) => [newCrop, ...prev]);
    setActiveCropId(newCrop.id);
    return newCrop;
  };

  const updateCultivo = (id: string, data: Partial<Cultivo>) => {
    setCultivos((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  };

  const deleteCultivo = (id: string) => {
    setCultivos((prev) => prev.filter((c) => c.id !== id));
    if (activeCropId === id) {
      const remaining = cultivos.filter((c) => c.id !== id);
      setActiveCropId(remaining[0]?.id || null);
    }
  };

  const archiveCultivo = (id: string) => {
    setCultivos((prev) => prev.map((c) => (c.id === id ? { ...c, status: "archivado" as const } : c)));
  };

  const updateCropDates = (id: string, dates: CultivoDates) => {
    updateCultivo(id, { dates });
  };

  const adjustCropChronology = (id: string, newStartDate: string, reason?: string) => {
    updateCultivo(id, { startDate: newStartDate });
    if (reason) {
      addRegistro({
        cultivoId: id,
        date: new Date().toISOString(),
        notes: "Ajuste de cronología: fecha modificada a " + newStartDate + ". Motivo: " + reason,
        tags: ["etapa", "mantenimiento"],
        images: [],
      });
    }
  };

  const updateCropStages = (id: string, stages: CustomStage[]) => {
    updateCultivo(id, { customStages: stages });
  };

  const addPlanta = (plantaData: Omit<Planta, "id">): Planta => {
    const newPlant: Planta = { ...plantaData, id: "planta-" + Date.now() };
    setPlantas((prev) => [...prev, newPlant]);
    return newPlant;
  };

  const updatePlanta = (id: string, data: Partial<Planta>) => {
    setPlantas((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  };

  const deletePlanta = (id: string) => {
    setPlantas((prev) => prev.filter((p) => p.id !== id));
  };

  const addRegistro = (regData: Omit<Registro, "id">): Registro => {
    const newReg: Registro = { ...regData, id: "reg-" + Date.now() };
    setRegistros((prev) => [newReg, ...prev]);
    return newReg;
  };

  const deleteRegistro = (id: string) => {
    setRegistros((prev) => prev.filter((r) => r.id !== id));
  };

  const addFertilizationLog = (logData: Omit<FertilizationLog, "id">): FertilizationLog => {
    const newLog: FertilizationLog = { ...logData, id: "fert-" + Date.now() };
    setFertilizationLogs((prev) => [newLog, ...prev]);

    const diaryEntry: Registro = {
      id: "reg-fert-" + Date.now(),
      cultivoId: logData.cultivoId,
      plantaId: logData.plantaId,
      date: new Date(logData.date).toISOString(),
      notes: "🧪 Fertilización: " + logData.productName + " (" + logData.doseMlPerL + " ml/L en " + logData.volumeWaterLiters + "L = " + logData.totalProductMl + " ml total). " + (logData.notes || ""),
      watering: {
        performed: true,
        amountLiters: logData.volumeWaterLiters,
        volumeMl: logData.volumeWaterLiters * 1000,
        nutrients: logData.productName + " (" + logData.doseMlPerL + " ml/L)",
      },
      tags: ["fertilizacion", "riego"],
      images: logData.photoUrl ? [logData.photoUrl] : [],
    };
    setRegistros((prev) => [diaryEntry, ...prev]);
    return newLog;
  };

  const deleteFertilizationLog = (id: string) => {
    setFertilizationLogs((prev) => prev.filter((f) => f.id !== id));
  };

  const addUserFertilizer = (data: Omit<UserFertilizer, "id" | "createdAt">): UserFertilizer => {
    const newFert: UserFertilizer = {
      ...data,
      id: "user-fert-" + Date.now(),
      createdAt: new Date().toISOString().split("T")[0],
    };
    setUserFertilizers((prev) => [newFert, ...prev]);
    return newFert;
  };

  const updateUserFertilizer = (id: string, data: Partial<UserFertilizer>) => {
    setUserFertilizers((prev) => prev.map((f) => (f.id === id ? { ...f, ...data } : f)));
  };

  const deleteUserFertilizer = (id: string) => {
    setUserFertilizers((prev) => prev.filter((f) => f.id !== id));
  };

  const addTarea = (tareaData: Omit<Tarea, "id">): Tarea => {
    const newTask: Tarea = { ...tareaData, id: "task-" + Date.now() };
    setTareas((prev) => [newTask, ...prev]);
    return newTask;
  };

  const toggleTarea = (id: string) => {
    setTareas((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : undefined } : t)));
  };

  const updateTarea = (id: string, data: Partial<Tarea>) => {
    setTareas((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
  };

  const deleteTarea = (id: string) => {
    setTareas((prev) => prev.filter((t) => t.id !== id));
  };

  const addFoto = (fotoData: Omit<Foto, "id">): Foto => {
    const newFoto: Foto = { ...fotoData, id: "foto-" + Date.now() };
    setFotos((prev) => [newFoto, ...prev]);
    return newFoto;
  };

  const deleteFoto = (id: string) => {
    setFotos((prev) => prev.filter((f) => f.id !== id));
  };

  const addEvento = (eventoData: Omit<Evento, "id">): Evento => {
    const newEvento: Evento = { ...eventoData, id: "evento-" + Date.now() };
    setEventos((prev) => [newEvento, ...prev]);
    return newEvento;
  };

  const deleteEvento = (id: string) => {
    setEventos((prev) => prev.filter((e) => e.id !== id));
  };

  const markArticleAsRead = (articleId: string) => {
    setLearningProgress((prev) => prev.readArticleIds.includes(articleId) ? prev : { ...prev, readArticleIds: [...prev.readArticleIds, articleId] });
  };

  const toggleFavoriteArticle = (articleId: string) => {
    setLearningProgress((prev) => {
      const isFav = prev.favoriteArticleIds.includes(articleId);
      return { ...prev, favoriteArticleIds: isFav ? prev.favoriteArticleIds.filter((id) => id !== articleId) : [...prev.favoriteArticleIds, articleId] };
    });
  };

  const toggleFavoriteProduct = (productId: string) => {
    setLearningProgress((prev) => {
      const isFav = prev.favoriteProductIds.includes(productId);
      return { ...prev, favoriteProductIds: isFav ? prev.favoriteProductIds.filter((id) => id !== productId) : [...prev.favoriteProductIds, productId] };
    });
  };

  const toggleFavoriteSource = (sourceId: string) => {
    setLearningProgress((prev) => {
      const isFav = prev.favoriteSourceIds.includes(sourceId);
      return { ...prev, favoriteSourceIds: isFav ? prev.favoriteSourceIds.filter((id) => id !== sourceId) : [...prev.favoriteSourceIds, sourceId] };
    });
  };

  const toggleFavoriteLog = (logId: string) => {
    setLearningProgress((prev) => {
      const isFav = prev.favoriteLogIds.includes(logId);
      return { ...prev, favoriteLogIds: isFav ? prev.favoriteLogIds.filter((id) => id !== logId) : [...prev.favoriteLogIds, logId] };
    });
  };

  const updateKnowledgeLevel = (level: UserKnowledgeLevel) => {
    setLearningProgress((prev) => ({ ...prev, currentLevel: level }));
    setUserPreferences((prev) => ({ ...prev, knowledgeLevel: level }));
  };

  const clearAllData = () => {
    localStorage.clear();
    setCultivos([]);
    setPlantas([]);
    setRegistros([]);
    setFertilizationLogs([]);
    setUserFertilizers([]);
    setTareas([]);
    setFotos([]);
    setEventos([]);
    setActiveCropId(null);
  };

  const resetAllData = () => { clearAllData(); };

  const loadDemoData = () => {
    setCultivos([initialCultivo, mockArchivedCrop]);
    setPlantas(initialPlantas);
    setRegistros(initialRegistros);
    setFertilizationLogs(initialFertilizationLogs);
    setUserFertilizers(initialUserFertilizers);
    setTareas(initialTareas);
    setFotos(initialFotos);
    setEventos(initialEventos);
    setAchievements(initialAchievements);
    setLearningProgress(initialLearningProgress);
    setActiveCropId("cultivo-1");
  };

  return (
    <CultivaContext.Provider
      value={{
        cultivos,
        activeCrop,
        activeCropId,
        plantas,
        activeCropPlants,
        registros,
        activeCropLogs,
        fertilizationLogs,
        activeCropFertilizations,
        userFertilizers,
        tareas,
        activeCropTasks,
        fotos,
        activeCropPhotos,
        eventos,
        activeCropEvents,
        learningProgress,
        achievements,
        alerts,
        userPreferences,
        currentTab,
        isQuickAddOpen,
        quickAddDefaultType,
        isSearchOpen,
        isOnboardingOpen,
        isAdjustChronologyOpen,
        isDateSettingsOpen,
        isCustomStagesOpen,
        selectedPlantIdForModal,

        setCurrentTab,
        setActiveCropId,
        setIsQuickAddOpen,
        setIsSearchOpen,
        setIsOnboardingOpen,
        setIsAdjustChronologyOpen,
        setIsDateSettingsOpen,
        setIsCustomStagesOpen,
        setSelectedPlantIdForModal,
        toggleTheme,
        updatePreferences,
        completeOnboarding,

        updateCultivo,
        updateCropDates,
        adjustCropChronology,
        updateCropStages,
        addCultivo,
        deleteCultivo,
        archiveCultivo,

        addPlanta,
        updatePlanta,
        deletePlanta,

        addRegistro,
        deleteRegistro,

        addFertilizationLog,
        deleteFertilizationLog,

        addUserFertilizer,
        updateUserFertilizer,
        deleteUserFertilizer,

        addTarea,
        toggleTarea,
        updateTarea,
        deleteTarea,

        addFoto,
        deleteFoto,

        addEvento,
        deleteEvento,

        markArticleAsRead,
        toggleFavoriteArticle,
        toggleFavoriteProduct,
        toggleFavoriteSource,
        toggleFavoriteLog,
        updateKnowledgeLevel,

        clearAllData,
        resetAllData,
        loadDemoData,
      }}
    >
      {children}
    </CultivaContext.Provider>
  );
};

export const useCultiva = () => {
  const context = useContext(CultivaContext);
  if (!context) {
    throw new Error("useCultiva must be used within a CultivaProvider");
  }
  return context;
};
