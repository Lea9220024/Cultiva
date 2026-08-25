-- ============================================================================
-- CULTIVA 3.0 — MIGRATION 002: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Description: Enforces strict data isolation by authenticated user ID (auth.uid()).
-- Guarantees cross-table verification so users can only access their own crops,
-- plants, diary logs, photos, tasks and customized strains.
-- ============================================================================

-- 1. Enable RLS on all user and domain tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strain_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_strain_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fertilization_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_fertilizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 2. PROFILES & PREFERENCES POLICIES
-- ----------------------------------------------------------------------------

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can manage their own preferences"
  ON public.user_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 3. STRAINS & SOURCES POLICIES (Public Curated Catalog + Private Custom Strains)
-- ----------------------------------------------------------------------------

CREATE POLICY "Users can view curated strains and their own custom strains"
  ON public.strains FOR SELECT
  USING (is_curated = true OR auth.uid() = created_by);

CREATE POLICY "Authenticated users can create custom strains"
  ON public.strains FOR INSERT
  WITH CHECK (auth.uid() = created_by AND is_curated = false);

CREATE POLICY "Users can update their own custom strains"
  ON public.strains FOR UPDATE
  USING (auth.uid() = created_by AND is_curated = false)
  WITH CHECK (auth.uid() = created_by AND is_curated = false);

CREATE POLICY "Users can delete their own custom strains"
  ON public.strains FOR DELETE
  USING (auth.uid() = created_by AND is_curated = false);

CREATE POLICY "Users can view sources of accessible strains"
  ON public.strain_sources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.strains s
      WHERE s.id = strain_id AND (s.is_curated = true OR s.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can manage their strain favorites"
  ON public.user_strain_favorites FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 4. CROPS & PLANTS POLICIES
-- ----------------------------------------------------------------------------

CREATE POLICY "Users can manage their own crops"
  ON public.crops FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage plants belonging to their crops"
  ON public.plants FOR ALL
  USING (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.crops c WHERE c.id = crop_id AND c.user_id = auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.crops c WHERE c.id = crop_id AND c.user_id = auth.uid())
  );

-- ----------------------------------------------------------------------------
-- 5. DIARY LOGS, TASKS, EVENTS, PHOTOS & FERTILIZATION POLICIES
-- ----------------------------------------------------------------------------

CREATE POLICY "Users can manage diary logs belonging to their crops"
  ON public.diary_logs FOR ALL
  USING (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.crops c WHERE c.id = crop_id AND c.user_id = auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.crops c WHERE c.id = crop_id AND c.user_id = auth.uid())
  );

CREATE POLICY "Users can manage tasks belonging to their crops"
  ON public.tasks FOR ALL
  USING (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.crops c WHERE c.id = crop_id AND c.user_id = auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.crops c WHERE c.id = crop_id AND c.user_id = auth.uid())
  );

CREATE POLICY "Users can manage events belonging to their crops"
  ON public.events FOR ALL
  USING (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.crops c WHERE c.id = crop_id AND c.user_id = auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.crops c WHERE c.id = crop_id AND c.user_id = auth.uid())
  );

CREATE POLICY "Users can manage photos belonging to their crops"
  ON public.photos FOR ALL
  USING (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.crops c WHERE c.id = crop_id AND c.user_id = auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.crops c WHERE c.id = crop_id AND c.user_id = auth.uid())
  );

CREATE POLICY "Users can manage fertilization logs belonging to their crops"
  ON public.fertilization_logs FOR ALL
  USING (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.crops c WHERE c.id = crop_id AND c.user_id = auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.crops c WHERE c.id = crop_id AND c.user_id = auth.uid())
  );

CREATE POLICY "Users can manage their custom fertilizers"
  ON public.user_fertilizers FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 6. LEARNING & ACHIEVEMENTS POLICIES
-- ----------------------------------------------------------------------------

CREATE POLICY "Users can manage their learning progress"
  ON public.user_learning_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone authenticated can view achievement catalog"
  ON public.achievement_definitions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their own unlocked achievements"
  ON public.user_achievements FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);