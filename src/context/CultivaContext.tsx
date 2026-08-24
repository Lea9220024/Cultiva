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
  // State
  cultivos: Cultivo[];
  activeCrop: Cultivo | null;
  activeCropId: string | null;
  plantas: Planta[];
  activeCropPlants: Planta[];
  registros: Registro[];
  activeCropLogs: Registro[];
  fertilizationLogs: FertilizationLog[];
  activeCropFertilizations: FertilizationLog[];
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

  // Actions
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

  // Dates & Chronology Actions
  updateCultivo: (id: string, data: Partial<Cultivo>) => void;
  updateCropDates: (id: string, dates: CultivoDates) => void;
  adjustCropChronology: (id: string, newStartDate: string, reason?: string) => void;
  updateCropStages: (id: string, stages: CustomStage[]) => void;

  // CRUD
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

  addTarea: (tarea: Omit<Tarea, "id">) => Tarea;
  toggleTarea: (id: string) => void;
  updateTarea: (id: string, data: Partial<Tarea>) => void;
  deleteTarea: (id: string) => void;

  addFoto: (foto: Omit<Foto, "id">) => Foto;
  deleteFoto: (id: string) => void;

  addEvento: (evento: Omit<Evento, "id">) => Evento;
  deleteEvento: (id: string) => void;

  // Learning & Favorites Actions
  markArticleAsRead: (articleId: string) => void;
  toggleFavoriteArticle: (articleId: string) => void;
  toggleFavoriteProduct: (productId: string) => void;
  toggleFavoriteSource: (sourceId: string) => void;
  toggleFavoriteLog: (logId: string) => void;
  updateKnowledgeLevel: (level: UserKnowledgeLevel) => void;

  // Reset / Backup
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
  TAREAS: "cultiva_v2_tareas",
  FOTOS: "cultiva_v2_fotos",
  EVENTOS: "cultiva_v2_eventos",
  LEARNING: "cultiva_v2_learning",
  ACHIEVEMENTS: "cultiva_v2_achievements",
  PREFERENCES: "cultiva_v2_preferences",
};

export const CultivaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Cultivos
  const [cultivos, setCultivos] = useState<Cultivo[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CULTIVOS) || localStorage.getItem("cultiva_v1_cultivos");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [initialCultivo, mockArchivedCrop];
  });

  // 2. Active Crop ID
  const [activeCropId, setActiveCropId] = useState<string | null>(() => {
    return cultivos[0]?.id || "cultivo-1";
  });

  // 3. Plantas
  const [plantas, setPlantas] = useState<Planta[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLANTAS) || localStorage.getItem("cultiva_v1_plantas");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialPlantas;
  });

  // 4. Registros
  const [registros, setRegistros] = useState<Registro[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REGISTROS) || localStorage.getItem("cultiva_v1_registros");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialRegistros;
  });

  // 5. Fertilization Logs (V2)
  const [fertilizationLogs, setFertilizationLogs] = useState<FertilizationLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FERTILIZATIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialFertilizationLogs;
  });

  // 6. Tareas
  const [tareas, setTareas] = useState<Tarea[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TAREAS) || localStorage.getItem("cultiva_v1_tareas");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialTareas;
  });

  // 7. Fotos
  const [fotos, setFotos] = useState<Foto[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FOTOS) || localStorage.getItem("cultiva_v1_fotos");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialFotos;
  });

  // 8. Eventos
  const [eventos, setEventos] = useState<Evento[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EVENTOS) || localStorage.getItem("cultiva_v1_eventos");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialEventos;
  });

  // 9. Learning Progress (V2)
  const [learningProgress, setLearningProgress] = useState<UserLearningProgress>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LEARNING);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialLearningProgress;
  });

  // 10. Achievements
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS) || localStorage.getItem("cultiva_v1_achievements");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialAchievements;
  });

  // 11. User Preferences
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PREFERENCES) || localStorage.getItem("cultiva_v1_preferences");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {
      theme: "light",
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

  // Navigation & Modals
  const [currentTab, setCurrentTab] = useState<NavTab>("dashboard");
  const [isQuickAddOpen, setIsQuickAddOpenState] = useState(false);
  const [quickAddDefaultType, setQuickAddDefaultType] = useState<QuickAddType>("registro");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAdjustChronologyOpen, setIsAdjustChronologyOpen] = useState(false);
  const [isDateSettingsOpen, setIsDateSettingsOpen] = useState(false);
  const [isCustomStagesOpen, setIsCustomStagesOpen] = useState(false);
  const [selectedPlantIdForModal, setSelectedPlantIdForModal] = useState<string | null>(null);

  // Persistence Sync
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CULTIVOS, JSON.stringify(cultivos));
  }, [cultivos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLANTAS, JSON.stringify(plantas));
  }, [plantas]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REGISTROS, JSON.stringify(registros));
  }, [registros]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FERTILIZATIONS, JSON.stringify(fertilizationLogs));
  }, [fertilizationLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TAREAS, JSON.stringify(tareas));
  }, [tareas]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FOTOS, JSON.stringify(fotos));
  }, [fotos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EVENTOS, JSON.stringify(eventos));
  }, [eventos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LEARNING, JSON.stringify(learningProgress));
  }, [learningProgress]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(userPreferences));
    if (userPreferences.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [userPreferences]);

  // Derived Active Crop State
  const activeCrop = cultivos.find((c) => c.id === activeCropId) || cultivos[0] || null;
  const activeCropPlants = plantas.filter((p) => p.cultivoId === activeCrop?.id);
  const activeCropLogs = registros.filter((r) => r.cultivoId === activeCrop?.id);
  const activeCropFertilizations = fertilizationLogs.filter((f) => f.cultivoId === activeCrop?.id);
  const activeCropTasks = tareas.filter((t) => t.cultivoId === activeCrop?.id);
  const activeCropPhotos = fotos.filter((f) => f.cultivoId === activeCrop?.id);
  const activeCropEvents = eventos.filter((e) => e.cultivoId === activeCrop?.id);

  // Dynamic Alerts
  const alerts = activeCrop ? calculateAlerts(activeCrop, activeCropLogs, activeCropTasks) : [];

  // Toggle Theme
  const toggleTheme = () => {
    setUserPreferences((prev) => ({
      ...prev,
      theme: prev.theme === "dark" ? "light" : "dark",
    }));
  };

  const updatePreferences = (prefs: Partial<UserPreferences>) => {
    setUserPreferences((prev) => ({ ...prev, ...prefs }));
  };

  const completeOnboarding = () => {
    setUserPreferences((prev) => ({ ...prev, onboardingCompleted: true }));
    setIsOnboardingOpen(false);
  };

  const setIsQuickAddOpen = (open: boolean, defaultType?: QuickAddType) => {
    if (defaultType) {
      setQuickAddDefaultType(defaultType);
    }
    setIsQuickAddOpenState(open);
  };

  // ----------------------------------------------------
  // DATES & CHRONOLOGY ACTIONS (V2)
  // ----------------------------------------------------
  const updateCropDates = (cropId: string, dates: CultivoDates) => {
    setCultivos((prev) =>
      prev.map((c) => {
        if (c.id === cropId) {
          return {
            ...c,
            startDate: dates.startDate || c.startDate,
            dates: {
              ...(c.dates || { startDate: c.startDate }),
              ...dates,
            },
          };
        }
        return c;
      })
    );

    // Record Event without altering log timestamps
    const evt: Evento = {
      id: "evt-dates-" + Date.now(),
      cultivoId: cropId,
      date: new Date().toISOString(),
      title: "Actualización de Fechas de Cultivo",
      description: `Fechas recalculadas: Inicio (${dates.startDate}), Floración (${dates.floweringStartDate || "N/D"}), Estimada Cosecha (${dates.estimatedHarvestDate || "N/D"}).`,
      type: "hito",
    };
    setEventos((prev) => [evt, ...prev]);
  };

  const adjustCropChronology = (cropId: string, newStartDate: string, reason?: string) => {
    setCultivos((prev) =>
      prev.map((c) => {
        if (c.id === cropId) {
          const oldStartDate = c.dates?.startDate || c.startDate;
          return {
            ...c,
            startDate: newStartDate,
            dates: {
              ...(c.dates || { startDate: oldStartDate }),
              startDate: newStartDate,
            },
          };
        }
        return c;
      })
    );

    // Add milestone without changing historical log dates
    const evt: Evento = {
      id: "evt-chrono-" + Date.now(),
      cultivoId: cropId,
      date: new Date().toISOString(),
      title: "⚙️ Ajuste de Cronología Aplicado",
      description: `Fecha de inicio del cultivo redefinida a ${newStartDate}. ${reason ? `Motivo: ${reason}` : "Recálculo automático de edades derivado."}`,
      type: "hito",
    };
    setEventos((prev) => [evt, ...prev]);
  };

  const updateCropStages = (cropId: string, stages: CustomStage[]) => {
    setCultivos((prev) =>
      prev.map((c) => {
        if (c.id === cropId) {
          const current = stages.find((s) => s.isCurrent);
          return {
            ...c,
            stage: current ? current.name : c.stage,
            customStages: stages,
          };
        }
        return c;
      })
    );
  };

  // ----------------------------------------------------
  // CRUD OPERATIONS
  // ----------------------------------------------------
  const addCultivo = (cultivoData: Omit<Cultivo, "id">): Cultivo => {
    const newId = "cultivo-" + Date.now();
    const newCrop: Cultivo = {
      ...cultivoData,
      id: newId,
      dates: cultivoData.dates || { startDate: cultivoData.startDate },
    };
    setCultivos((prev) => [newCrop, ...prev]);
    setActiveCropId(newId);
    return newCrop;
  };

  const updateCultivo = (id: string, data: Partial<Cultivo>) => {
    setCultivos((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c))
    );
  };

  const deleteCultivo = (id: string) => {
    setCultivos((prev) => prev.filter((c) => c.id !== id));
    if (activeCropId === id) {
      const remaining = cultivos.filter((c) => c.id !== id);
      setActiveCropId(remaining[0]?.id || null);
    }
  };

  const archiveCultivo = (id: string) => {
    setCultivos((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "archivado" as const,
              endDate: new Date().toISOString().split("T")[0],
            }
          : c
      )
    );
  };

  const addPlanta = (plantaData: Omit<Planta, "id">): Planta => {
    const newPlant: Planta = {
      ...plantaData,
      id: "planta-" + Date.now(),
    };
    setPlantas((prev) => [...prev, newPlant]);
    return newPlant;
  };

  const updatePlanta = (id: string, data: Partial<Planta>) => {
    setPlantas((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    );
  };

  const deletePlanta = (id: string) => {
    setPlantas((prev) => prev.filter((p) => p.id !== id));
  };

  const addRegistro = (regData: Omit<Registro, "id">): Registro => {
    const newReg: Registro = {
      ...regData,
      id: "reg-" + Date.now(),
    };
    setRegistros((prev) => [newReg, ...prev]);
    return newReg;
  };

  const deleteRegistro = (id: string) => {
    setRegistros((prev) => prev.filter((r) => r.id !== id));
  };

  // Fertilization CRUD
  const addFertilizationLog = (logData: Omit<FertilizationLog, "id">): FertilizationLog => {
    const newLog: FertilizationLog = {
      ...logData,
      id: "fert-" + Date.now(),
    };
    setFertilizationLogs((prev) => [newLog, ...prev]);

    // Also link a summary record in the diary
    const diaryEntry: Registro = {
      id: "reg-fert-" + Date.now(),
      cultivoId: logData.cultivoId,
      plantaId: logData.plantaId,
      date: new Date(logData.date).toISOString(),
      notes: `🧪 Fertilización registrada: ${logData.productName} (${logData.doseMlPerL} ml/L en ${logData.volumeWaterLiters}L de agua = ${logData.totalProductMl} ml total). ${logData.notes || ""}`,
      watering: {
        performed: true,
        amountLiters: logData.volumeWaterLiters,
        volumeMl: logData.volumeWaterLiters * 1000,
        nutrients: `${logData.productName} (${logData.doseMlPerL} ml/L)`,
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

  const addTarea = (tareaData: Omit<Tarea, "id">): Tarea => {
    const newTask: Tarea = {
      ...tareaData,
      id: "task-" + Date.now(),
    };
    setTareas((prev) => [newTask, ...prev]);
    return newTask;
  };

  const toggleTarea = (id: string) => {
    setTareas((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date().toISOString() : undefined,
            }
          : t
      )
    );
  };

  const updateTarea = (id: string, data: Partial<Tarea>) => {
    setTareas((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data } : t))
    );
  };

  const deleteTarea = (id: string) => {
    setTareas((prev) => prev.filter((t) => t.id !== id));
  };

  const addFoto = (fotoData: Omit<Foto, "id">): Foto => {
    const newFoto: Foto = {
      ...fotoData,
      id: "foto-" + Date.now(),
    };
    setFotos((prev) => [newFoto, ...prev]);
    return newFoto;
  };

  const deleteFoto = (id: string) => {
    setFotos((prev) => prev.filter((f) => f.id !== id));
  };

  const addEvento = (eventoData: Omit<Evento, "id">): Evento => {
    const newEvt: Evento = {
      ...eventoData,
      id: "evt-" + Date.now(),
    };
    setEventos((prev) => [newEvt, ...prev]);
    return newEvt;
  };

  const deleteEvento = (id: string) => {
    setEventos((prev) => prev.filter((e) => e.id !== id));
  };

  // Learning Progress & Favorites
  const markArticleAsRead = (articleId: string) => {
    setLearningProgress((prev) => {
      if (prev.readArticleIds.includes(articleId)) return prev;
      return {
        ...prev,
        readArticleIds: [...prev.readArticleIds, articleId],
        pendingArticleIds: prev.pendingArticleIds.filter((id) => id !== articleId),
      };
    });
  };

  const toggleFavoriteArticle = (articleId: string) => {
    setLearningProgress((prev) => {
      const isFav = prev.favoriteArticleIds.includes(articleId);
      return {
        ...prev,
        favoriteArticleIds: isFav
          ? prev.favoriteArticleIds.filter((id) => id !== articleId)
          : [...prev.favoriteArticleIds, articleId],
      };
    });
  };

  const toggleFavoriteProduct = (productId: string) => {
    setLearningProgress((prev) => {
      const isFav = prev.favoriteProductIds.includes(productId);
      return {
        ...prev,
        favoriteProductIds: isFav
          ? prev.favoriteProductIds.filter((id) => id !== productId)
          : [...prev.favoriteProductIds, productId],
      };
    });
  };

  const toggleFavoriteSource = (sourceId: string) => {
    setLearningProgress((prev) => {
      const isFav = prev.favoriteSourceIds.includes(sourceId);
      return {
        ...prev,
        favoriteSourceIds: isFav
          ? prev.favoriteSourceIds.filter((id) => id !== sourceId)
          : [...prev.favoriteSourceIds, sourceId],
      };
    });
  };

  const toggleFavoriteLog = (logId: string) => {
    setLearningProgress((prev) => {
      const isFav = prev.favoriteLogIds.includes(logId);
      return {
        ...prev,
        favoriteLogIds: isFav
          ? prev.favoriteLogIds.filter((id) => id !== logId)
          : [...prev.favoriteLogIds, logId],
      };
    });
  };

  const updateKnowledgeLevel = (level: UserKnowledgeLevel) => {
    setLearningProgress((prev) => ({ ...prev, currentLevel: level }));
    setUserPreferences((prev) => ({ ...prev, knowledgeLevel: level }));
  };

  // Reset & Demo
  const clearAllData = () => {
    localStorage.clear();
    setCultivos([]);
    setPlantas([]);
    setRegistros([]);
    setFertilizationLogs([]);
    setTareas([]);
    setFotos([]);
    setEventos([]);
    setActiveCropId(null);
  };

  const resetAllData = () => {
    clearAllData();
  };

  const loadDemoData = () => {
    setCultivos([initialCultivo, mockArchivedCrop]);
    setPlantas(initialPlantas);
    setRegistros(initialRegistros);
    setFertilizationLogs(initialFertilizationLogs);
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
