-- ============================================================================
-- CULTIVA 3.0 — MIGRATION 001: INITIAL RELATIONAL SCHEMA
-- ============================================================================
-- Description: Core tables, relational schemas, constraints, foreign keys,
-- indexes, and automatic timestamp update triggers.
-- Compatible with PostgreSQL 15+ / Supabase.
-- ============================================================================

-- 1. Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Utility function for auto-updating 'updated_at' column
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 3. PROFILES & USER PREFERENCES
-- ----------------------------------------------------------------------------

-- User public profile linked 1:1 to Supabase auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Cultivador',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- User preferences (Theme, units, active system, notifications, etc.)
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'system')),
  temp_unit TEXT NOT NULL DEFAULT 'C' CHECK (temp_unit IN ('C', 'F')),
  knowledge_level TEXT NOT NULL DEFAULT 'Intermedio' CHECK (knowledge_level IN ('Principiante', 'Intermedio', 'Avanzado')),
  cultivation_system TEXT NOT NULL DEFAULT 'Tierra' CHECK (cultivation_system IN ('Tierra', 'Coco', 'Hidroponia', 'Living Soil', 'Auto', 'Exterior', 'Mixto')),
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  active_crop_id UUID,
  show_advanced_content BOOLEAN NOT NULL DEFAULT true,
  enable_educational_recommendations BOOLEAN NOT NULL DEFAULT true,
  preferred_sources_only BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 4. STRAINS & VARIETIES LIBRARY (Global Catalog + User Strains)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.strains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  breeder_or_origin TEXT,
  type TEXT NOT NULL DEFAULT 'Híbrida' CHECK (type IN ('Índica', 'Sativa', 'Híbrida', 'Ruderalis', 'Fotoperiódica', 'Autofloreciente', 'Esqueje', 'Variedad Botánica')),
  thc_cbd_ratio TEXT,
  flowering_weeks NUMERIC(4, 1),
  growth_characteristics TEXT,
  description TEXT,
  image_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_curated BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_strains_updated_at
BEFORE UPDATE ON public.strains
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.strain_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strain_id UUID NOT NULL REFERENCES public.strains(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  publisher TEXT NOT NULL,
  url TEXT NOT NULL,
  consultation_date DATE,
  reliability TEXT DEFAULT '🟢 Fuente oficial',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_strain_favorites (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strain_id UUID NOT NULL REFERENCES public.strains(id) ON DELETE CASCADE,
  is_favorite BOOLEAN NOT NULL DEFAULT true,
  personal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, strain_id)
);

CREATE TRIGGER set_user_strain_favorites_updated_at
BEFORE UPDATE ON public.user_strain_favorites
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 5. CROPS & PLANTS (Core Cultivation Layer)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strain_id UUID REFERENCES public.strains(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'activo' CHECK (status IN ('activo', 'archivado')),
  stage TEXT NOT NULL DEFAULT 'Vegetativo',
  method TEXT NOT NULL DEFAULT 'Indoor (Carpa)',
  space TEXT,
  image_url TEXT,
  dates JSONB NOT NULL DEFAULT '{}',
  custom_stages JSONB NOT NULL DEFAULT '[]',
  genetic_name TEXT,
  genetic_type TEXT,
  genetic_origin TEXT,
  notes TEXT,
  harvest_notes TEXT,
  yield_grams NUMERIC(8, 2),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_crops_updated_at
BEFORE UPDATE ON public.crops
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id UUID NOT NULL REFERENCES public.crops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date_added DATE NOT NULL DEFAULT CURRENT_DATE,
  stage TEXT NOT NULL DEFAULT 'Vegetativo',
  status TEXT NOT NULL DEFAULT 'Óptimo' CHECK (status IN ('Óptimo', 'En observación', 'En tratamiento', 'Cosechada', 'Descartada')),
  image_url TEXT,
  height_cm NUMERIC(6, 2),
  pot_size TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_plants_updated_at
BEFORE UPDATE ON public.plants
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 6. DIARY LOGS, TASKS, EVENTS, PHOTOS & FERTILIZATION
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.diary_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id UUID NOT NULL REFERENCES public.crops(id) ON DELETE CASCADE,
  plant_id UUID REFERENCES public.plants(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  temperature NUMERIC(4, 1),
  humidity NUMERIC(4, 1),
  ph NUMERIC(3, 1),
  ec NUMERIC(4, 2),
  height_cm NUMERIC(6, 2),
  measurements JSONB NOT NULL DEFAULT '{}',
  watering JSONB NOT NULL DEFAULT '{}',
  notes TEXT,
  photo_url TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_diary_logs_updated_at
BEFORE UPDATE ON public.diary_logs
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id UUID NOT NULL REFERENCES public.crops(id) ON DELETE CASCADE,
  plant_id UUID REFERENCES public.plants(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time TEXT,
  repeat TEXT NOT NULL DEFAULT 'ninguna' CHECK (repeat IN ('ninguna', 'diaria', 'cada_2_dias', 'semanal', 'cada_15_dias')),
  priority TEXT NOT NULL DEFAULT 'media' CHECK (priority IN ('baja', 'media', 'alta')),
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  is_nutrition_task BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id UUID NOT NULL REFERENCES public.crops(id) ON DELETE CASCADE,
  plant_id UUID REFERENCES public.plants(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'otro' CHECK (type IN ('hito', 'etapa', 'poda', 'trasplante', 'cosecha', 'fertilizacion', 'otro')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id UUID NOT NULL REFERENCES public.crops(id) ON DELETE CASCADE,
  plant_id UUID REFERENCES public.plants(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  crop_day INT NOT NULL DEFAULT 1,
  stage TEXT NOT NULL DEFAULT 'Vegetativo',
  storage_path TEXT NOT NULL,
  image_url TEXT,
  notes TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fertilization_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id UUID NOT NULL REFERENCES public.crops(id) ON DELETE CASCADE,
  plant_id UUID REFERENCES public.plants(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  fertilizer_type TEXT NOT NULL DEFAULT 'generic' CHECK (fertilizer_type IN ('custom', 'generic', 'natural', 'historical_top_crop')),
  volume_water_liters NUMERIC(6, 2) NOT NULL DEFAULT 1.0,
  dose_ml_per_l NUMERIC(6, 2) NOT NULL DEFAULT 1.0,
  total_product_ml NUMERIC(6, 2) NOT NULL DEFAULT 1.0,
  stage TEXT NOT NULL DEFAULT 'Vegetativo',
  npk TEXT,
  notes TEXT,
  photo_url TEXT,
  warning_notice TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_fertilizers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT,
  npk TEXT,
  form TEXT NOT NULL DEFAULT 'Líquido' CHECK (form IN ('Líquido', 'Polvo hidrosoluble', 'Granulado', 'Enmienda sólida', 'Otro')),
  target_phase TEXT NOT NULL DEFAULT 'Vegetativo' CHECK (target_phase IN ('Vegetativo', 'Floración', 'Todo el ciclo', 'Enraizamiento', 'Corrector', 'Maduración')),
  nutrients_additional TEXT,
  manufacturer_dose TEXT,
  manufacturer_frequency TEXT,
  application_method TEXT NOT NULL DEFAULT 'Riego a sustrato' CHECK (application_method IN ('Riego a sustrato', 'Foliar', 'Mezcla en sustrato', 'Hidropónico')),
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_user_fertilizers_updated_at
BEFORE UPDATE ON public.user_fertilizers
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 7. LEARNING PROGRESS & GAMIFICATION
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.user_learning_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_level TEXT NOT NULL DEFAULT 'Principiante' CHECK (current_level IN ('Principiante', 'Intermedio', 'Avanzado')),
  read_article_ids TEXT[] NOT NULL DEFAULT '{}',
  completed_categories TEXT[] NOT NULL DEFAULT '{}',
  favorite_article_ids TEXT[] NOT NULL DEFAULT '{}',
  favorite_product_ids TEXT[] NOT NULL DEFAULT '{}',
  favorite_source_ids TEXT[] NOT NULL DEFAULT '{}',
  favorite_log_ids TEXT[] NOT NULL DEFAULT '{}',
  pending_article_ids TEXT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_user_learning_progress_updated_at
BEFORE UPDATE ON public.user_learning_progress
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.achievement_definitions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🌱',
  max_progress INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES public.achievement_definitions(id) ON DELETE CASCADE,
  unlocked BOOLEAN NOT NULL DEFAULT false,
  unlocked_at TIMESTAMPTZ,
  progress INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);

CREATE TRIGGER set_user_achievements_updated_at
BEFORE UPDATE ON public.user_achievements
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 8. PERFORMANCE INDEXES
-- ----------------------------------------------------------------------------

-- Indexes on crops and plants
CREATE INDEX IF NOT EXISTS idx_crops_user_id ON public.crops(user_id);
CREATE INDEX IF NOT EXISTS idx_crops_status ON public.crops(user_id, status);
CREATE INDEX IF NOT EXISTS idx_crops_strain_id ON public.crops(strain_id);
CREATE INDEX IF NOT EXISTS idx_plants_crop_id ON public.plants(crop_id);
CREATE INDEX IF NOT EXISTS idx_plants_user_id ON public.plants(user_id);

-- Indexes on time-series queries (Diary, Tasks, Events, Photos, Nutrition)
CREATE INDEX IF NOT EXISTS idx_diary_logs_crop_date ON public.diary_logs(crop_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_diary_logs_user_id ON public.diary_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_crop_date ON public.tasks(crop_id, date);
CREATE INDEX IF NOT EXISTS idx_tasks_user_pending ON public.tasks(user_id, completed, date);
CREATE INDEX IF NOT EXISTS idx_events_crop_date ON public.events(crop_id, date);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.events(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_crop_id ON public.photos(crop_id, crop_day);
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON public.photos(user_id);
CREATE INDEX IF NOT EXISTS idx_fertilization_logs_crop_date ON public.fertilization_logs(crop_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_fertilization_logs_user_id ON public.fertilization_logs(user_id);

-- Indexes on strains and products
CREATE INDEX IF NOT EXISTS idx_strains_name ON public.strains(name);
CREATE INDEX IF NOT EXISTS idx_strains_type ON public.strains(type);
CREATE INDEX IF NOT EXISTS idx_strains_curated ON public.strains(is_curated);
CREATE INDEX IF NOT EXISTS idx_user_fertilizers_user_id ON public.user_fertilizers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_strain_favorites_user ON public.user_strain_favorites(user_id);