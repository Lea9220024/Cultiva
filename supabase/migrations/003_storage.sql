-- ============================================================================
-- CULTIVA 3.0 — MIGRATION 003: SECURE PRIVATE STORAGE & BUCKET POLICIES
-- ============================================================================
-- Description: Sets up the private 'crop-media' bucket and configures fine-grained
-- folder-level security rules in storage.objects.
-- Enforces the folder convention: crop-media/{user_id}/{crop_id}/{photo_id}.webp
-- ============================================================================

-- 1. Create the private 'crop-media' bucket if it does not already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'crop-media',
  'crop-media',
  false, -- Strict private access
  10485760, -- 10 MB per file limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

-- ----------------------------------------------------------------------------
-- 2. STORAGE ROW LEVEL SECURITY POLICIES
-- ----------------------------------------------------------------------------

-- Policy 1: Authenticated users can upload photos strictly into their own folder: crop-media/{user_id}/...
CREATE POLICY "Users can upload crop photos into their user directory"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'crop-media' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 2: Users can view and download photos strictly from their own folder
CREATE POLICY "Users can view their own crop photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'crop-media' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 3: Users can update photos strictly within their own folder
CREATE POLICY "Users can update their own crop photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'crop-media' AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'crop-media' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 4: Users can delete photos strictly from their own folder
CREATE POLICY "Users can delete their own crop photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'crop-media' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );