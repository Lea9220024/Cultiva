export type Stage =
  | "Germinación"
  | "Plántula"
  | "Vegetativo"
  | "Pre-floración"
  | "Floración"
  | "Lavado"
  | "Secado"
  | "Curado"
  | "Cosechado";

export type Method =
  | "Indoor (Carpa)"
  | "Indoor (Espacio abierto)"
  | "Exterior (Suelo)"
  | "Exterior (Macetas)"
  | "Invernadero"
  | "Hidroponía"
  | "Aeroponía"
  | "Living Soil"
  | "Coco"
  | "Tierra";

export type PlantStatus = "Óptimo" | "En observación" | "En tratamiento" | "Cosechada" | "Descartada";

export type Priority = "baja" | "media" | "alta";

export type TaskRepeat = "ninguna" | "diaria" | "cada_2_dias" | "semanal" | "cada_15_dias";

export type TagType =
  | "crecimiento"
  | "ambiente"
  | "riego"
  | "observacion"
  | "incidencia"
  | "mantenimiento"
  | "fotografia"
  | "poda"
  | "fertilizacion"
  | "etapa"
  | "otro";

export type UserKnowledgeLevel = "Principiante" | "Intermedio" | "Avanzado";
export type ArticleLevel = "Principiante" | "Intermedio" | "Avanzado";
export type CultivationSystem = "Tierra" | "Coco" | "Hidroponia" | "Auto" | "Exterior" | "Mixto";

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  tempUnit: "C" | "F";
  onboardingCompleted: boolean;
  activeCropId: string | null;
  notificationsEnabled: boolean;
  knowledgeLevel: UserKnowledgeLevel;
  cultivationSystem: CultivationSystem;
  showAdvancedContent: boolean;
  enableEducationalRecommendations: boolean;
  preferredSourcesOnly: boolean;
}

export interface User {
  id: string;
  name: string;
  preferences: UserPreferences;
}

export interface CustomStage {
  id: string;
  name: string;
  startDate?: string;
  durationDays?: number;
  order: number;
  isCurrent?: boolean;
}

export interface CultivoDates {
  startDate: string; // Fecha de inicio
  germinationDate?: string; // Fecha de germinación
  plantAddedDate?: string; // Fecha de incorporación de la planta
  vegetativeStartDate?: string; // Fecha de inicio de crecimiento
  floweringStartDate?: string; // Fecha de inicio de floración
  estimatedHarvestDate?: string; // Fecha estimada de cosecha
  realHarvestDate?: string; // Fecha real de cosecha
  curingStartDate?: string; // Fecha de inicio de curado
  curingEndDate?: string; // Fecha de finalización del curado
}

export interface Cultivo {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;
  status: "activo" | "archivado";
  stage: Stage | string;
  description: string;
  method: Method;
  space: string;
  image: string;
  // Advanced Dates (V2)
  dates?: CultivoDates;
  customStages?: CustomStage[];
  // Genetics info
  geneticName?: string;
  geneticType?: "Feminizada" | "Autofloreciente" | "Regular" | "Fotoperiódica" | "Esqueje" | "Variedad Botánica";
  geneticOrigin?: string;
  notes?: string;
  harvestNotes?: string;
  yieldGrams?: number;
  rating?: number;
}

export interface Planta {
  id: string;
  cultivoId: string;
  name: string;
  dateAdded: string;
  stage: Stage | string;
  status: PlantStatus;
  image: string;
  heightCm?: number;
  notes?: string;
  potSize?: string;
}

export interface Registro {
  id: string;
  cultivoId: string;
  plantaId?: string;
  date: string;
  temperature?: number;
  humidity?: number;
  ph?: number;
  ec?: number;
  heightCm?: number;
  measurements?: {
    heightCm?: number;
    nodeCount?: number;
    leafCount?: number;
  };
  watering?: {
    performed: boolean;
    amountLiters?: number;
    volumeMl?: number;
    ph?: number;
    ec?: number;
    nutrients?: string;
    productsUsed?: { productId: string; name: string; doseMlPerL: number }[];
  };
  notes: string;
  photoUrl?: string;
  images?: string[];
  tags: TagType[];
}

export interface Tarea {
  id: string;
  cultivoId: string;
  plantaId?: string;
  title: string;
  date: string;
  time?: string;
  repeat: TaskRepeat;
  priority: Priority;
  completed: boolean;
  completedAt?: string;
  notes?: string;
  isNutritionTask?: boolean;
}

export interface Foto {
  id: string;
  cultivoId: string;
  plantaId?: string;
  date: string;
  cropDay: number;
  image: string;
  stage: Stage | string;
  notes?: string;
  tags?: string[];
}

export interface Evento {
  id: string;
  cultivoId: string;
  plantaId?: string;
  date: string;
  title: string;
  description: string;
  type: "hito" | "etapa" | "poda" | "trasplante" | "cosecha" | "fertilizacion" | "otro";
}

export interface Alerta {
  id: string;
  cultivoId: string;
  type: "warning" | "info" | "urgent";
  title: string;
  message: string;
  date: string;
  dismissed?: boolean;
  actionPath?: string;
}

// ----------------------------------------------------
// V2: FERTILIZACIÓN & TOP CROP TYPES
// ----------------------------------------------------

export type TopCropCategory =
  | "Estimulador Radicular"
  | "Fertilizante de Crecimiento"
  | "Fertilizante de Floración"
  | "Estimulador de Floración"
  | "Potenciador de Engorde"
  | "Carbohidratos y Azúcares"
  | "Microorganismos Benéficos"
  | "Estimulador Foliar"
  | "Refuerzo y Protección"
  | "Nutriente Base Coco"
  | "Automáticas"
  | "Limpieza y Lavado";

export interface OfficialSource {
  id: string;
  title: string;
  publisher: string;
  url: string;
  consultationDate: string;
  reliability: "🟢 Fuente oficial" | "🔵 Fuente técnica" | "🟡 Fuente comunitaria";
  description?: string;
}

export interface FertilizerProduct {
  id: string;
  name: string;
  brand: "Top Crop" | "Otro";
  category: TopCropCategory;
  recommendedStage: string;
  description: string;
  composition: string;
  compositionNpk?: string;
  manufacturerDose: string;
  minDoseMlPerL: number;
  maxDoseMlPerL: number;
  defaultDoseMlPerL?: number;
  doseRangeMlPerL?: string;
  frequency: string;
  applicationMethod: "Riego radicular" | "Foliar" | "Sustrato" | "Riego o Foliar" | string;
  compatibilities: string;
  warnings: string;
  keyBenefit?: string;
  icon?: string;
  officialSource: OfficialSource;
  officialGuideUrl?: string;
  lastUpdated: string;
  image: string;
  npk?: string;
  organicCertified?: boolean;
}

export interface TopCropScheduleWeek {
  weekNumber: number;
  stageName: string;
  phase: string;
  dosages: {
    productId: string;
    productName: string;
    doseMlPerL: number;
    frequency?: string;
  }[];
  phRecommended: string;
  ecRecommended: string;
  photoperiod: string;
  notes?: string;
}

export interface TopCropSchedule {
  system: CultivationSystem | string;
  title: string;
  description: string;
  weeks: TopCropScheduleWeek[];
}

export interface TopCropScheduleEntry {
  weekNumber: number;
  stageName: string;
  method: "Tierra" | "Coco" | "Auto";
  products: {
    productId: string;
    productName: string;
    dose: string;
    frequency: string;
    applicationMethod: string;
  }[];
  phRecommended: string;
  ecRecommended: string;
  photoperiod: string;
  notes?: string;
}

export interface FertilizationLog {
  id: string;
  cultivoId: string;
  plantaId?: string;
  date: string;
  productId: string;
  productName: string;
  volumeWaterLiters: number;
  doseMlPerL: number;
  totalProductMl: number;
  stage: Stage | string;
  notes?: string;
  photoUrl?: string;
  warningNotice?: string;
}

// ----------------------------------------------------
// V2: ENCICLOPEDIA EDUCATIVA & SOURCES TYPES
// ----------------------------------------------------

export type EncyclopediaCategory =
  | "biologia"
  | "riego"
  | "sustratos"
  | "nutricion"
  | "iluminacion"
  | "ambiente"
  | "desarrollo"
  | "observacion"
  | "plagas"
  | "medicion"
  | "equipamiento"
  | "planificacion"
  | "etapas"
  | "legislacion";

export interface EncyclopediaArticle {
  id: string;
  title: string;
  slug: string;
  level: ArticleLevel;
  levelDifficulty: "🟢 Fácil" | "🟡 Intermedio" | "🔴 Avanzado";
  category: EncyclopediaCategory;
  categoryLabel: string;
  categoryIcon: string;
  stageRelation?: (Stage | string)[];
  cropTypeRelation?: string[];
  summary: string;
  definition?: string;
  content: string;
  keyTakeaways: string[];
  nextContentId?: string;
  nextContentTitle?: string;
  relatedArticleIds: string[];
  sources: OfficialSource[];
  tags: string[];
  readTimeMinutes: number;
}

export interface BibliotecaItem {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  author?: string;
}

export interface UserLearningProgress {
  readArticleIds: string[];
  completedCategories: string[];
  currentLevel: UserKnowledgeLevel;
  favoriteArticleIds: string[];
  favoriteProductIds: string[];
  favoriteSourceIds: string[];
  favoriteLogIds: string[];
  pendingArticleIds: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface CropSummaryAI {
  summary: string;
  changes: string;
  missingRecords: string;
  tasksOverview: string;
  recommendations: string[];
}

export interface PhotoAnalysisAI {
  observations: string;
  visualFeatures: string[];
  pointsToWatch: string;
  cautiousNote: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
