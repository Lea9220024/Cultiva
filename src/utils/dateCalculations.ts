import { Cultivo, Planta, CultivoDates, CustomStage } from "../types";

export interface ChronologyCalculations {
  totalDays: number;
  currentDay: number;
  germinationDays: number;
  vegetativeDays: number;
  floweringDays: number;
  curingDays: number;
  daysToHarvest: number | null;
  currentStageName: string;
  currentStageDays: number;
  isHarvested: boolean;
  progressPercent: number;
}

export function parseDateSafe(dateStr?: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export function diffDays(startDateStr: string, endDateStr?: string | Date): number {
  const start = new Date(startDateStr);
  const end = endDateStr ? (typeof endDateStr === "string" ? new Date(endDateStr) : endDateStr) : new Date();
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  
  // Set both to midnight UTC for clean day boundary diffs
  const utc1 = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const utc2 = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  
  const diffTime = utc2 - utc1;
  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
}

export function calculateCropChronology(crop: Cultivo, customReferenceDate?: Date): ChronologyCalculations {
  const now = customReferenceDate || new Date();
  const dates = crop.dates || { startDate: crop.startDate };
  const startDateStr = dates.startDate || crop.startDate;

  const totalDays = diffDays(startDateStr, crop.status === "archivado" && crop.endDate ? crop.endDate : now);
  const currentDay = totalDays + 1;

  // Vegetative days
  let vegDays = 0;
  if (dates.vegetativeStartDate) {
    const endVeg = dates.floweringStartDate ? new Date(dates.floweringStartDate) : now;
    vegDays = diffDays(dates.vegetativeStartDate, endVeg);
  } else if (dates.germinationDate) {
    const endVeg = dates.floweringStartDate ? new Date(dates.floweringStartDate) : now;
    vegDays = diffDays(dates.germinationDate, endVeg);
  } else {
    vegDays = Math.min(totalDays, 28);
  }

  // Flowering days
  let flowerDays = 0;
  if (dates.floweringStartDate) {
    const endFlower = dates.realHarvestDate
      ? new Date(dates.realHarvestDate)
      : dates.estimatedHarvestDate && new Date(dates.estimatedHarvestDate) < now
      ? new Date(dates.estimatedHarvestDate)
      : now;
    flowerDays = diffDays(dates.floweringStartDate, endFlower);
  }

  // Germination days
  let germDays = 0;
  if (dates.germinationDate) {
    const endGerm = dates.vegetativeStartDate ? new Date(dates.vegetativeStartDate) : now;
    germDays = diffDays(dates.germinationDate, endGerm);
  }

  // Curing days
  let cureDays = 0;
  if (dates.curingStartDate) {
    const endCure = dates.curingEndDate ? new Date(dates.curingEndDate) : now;
    cureDays = diffDays(dates.curingStartDate, endCure);
  }

  // Remaining days to harvest
  let daysToHarvest: number | null = null;
  if (dates.estimatedHarvestDate && !dates.realHarvestDate) {
    const estDate = new Date(dates.estimatedHarvestDate);
    const diff = Math.ceil((estDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    daysToHarvest = diff > 0 ? diff : 0;
  }

  // Current stage duration
  let currentStageName = crop.stage || "Vegetativo";
  let currentStageDays = 0;

  if (currentStageName === "Floración" && dates.floweringStartDate) {
    currentStageDays = flowerDays;
  } else if (currentStageName === "Vegetativo" && dates.vegetativeStartDate) {
    currentStageDays = vegDays;
  } else if (currentStageName === "Curado" && dates.curingStartDate) {
    currentStageDays = cureDays;
  } else {
    currentStageDays = totalDays;
  }

  const isHarvested = !!dates.realHarvestDate || crop.stage === "Cosechado" || crop.stage === "Curado";
  const progressPercent = dates.estimatedHarvestDate
    ? Math.min(100, Math.round((totalDays / (totalDays + (daysToHarvest || 1))) * 100))
    : Math.min(100, Math.round((totalDays / 75) * 100));

  return {
    totalDays,
    currentDay,
    germinationDays: germDays,
    vegetativeDays: vegDays,
    floweringDays: flowerDays,
    curingDays: cureDays,
    daysToHarvest,
    currentStageName,
    currentStageDays,
    isHarvested,
    progressPercent,
  };
}

export function calculatePlantAge(plant: Planta, crop: Cultivo): { plantDays: number; plantDayNumber: number } {
  const addedDate = plant.dateAdded || crop.startDate;
  const plantDays = diffDays(addedDate);
  return {
    plantDays,
    plantDayNumber: plantDays + 1,
  };
}

export interface ChronologyComparison {
  before: {
    startDate: string;
    totalDays: number;
    currentDay: number;
    floweringDays: number;
    vegetativeDays: number;
  };
  after: {
    startDate: string;
    totalDays: number;
    currentDay: number;
    floweringDays: number;
    vegetativeDays: number;
  };
  dayDifference: number;
}

export function compareChronologyChange(
  crop: Cultivo,
  newDates: Partial<CultivoDates>
): ChronologyComparison {
  const beforeCalc = calculateCropChronology(crop);
  
  const modifiedCrop: Cultivo = {
    ...crop,
    startDate: newDates.startDate || crop.startDate,
    dates: {
      ...(crop.dates || { startDate: crop.startDate }),
      ...newDates,
      startDate: newDates.startDate || crop.startDate,
    },
  };

  const afterCalc = calculateCropChronology(modifiedCrop);
  const dayDifference = afterCalc.currentDay - beforeCalc.currentDay;

  return {
    before: {
      startDate: crop.dates?.startDate || crop.startDate,
      totalDays: beforeCalc.totalDays,
      currentDay: beforeCalc.currentDay,
      floweringDays: beforeCalc.floweringDays,
      vegetativeDays: beforeCalc.vegetativeDays,
    },
    after: {
      startDate: newDates.startDate || crop.startDate,
      totalDays: afterCalc.totalDays,
      currentDay: afterCalc.currentDay,
      floweringDays: afterCalc.floweringDays,
      vegetativeDays: afterCalc.vegetativeDays,
    },
    dayDifference,
  };
}
