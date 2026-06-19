-- ══════════════════════════════════════════════════════════════════════
-- MatchAfro — Migration Phase 2 (compatible Supabase Cloud)
-- À coller dans : https://supabase.com/dashboard/project/tuapfdgyidxweemefkip/sql
-- Toutes les instructions sont idempotentes.
-- NE PAS exécuter ALTER TABLE storage.objects (non propriétaire).
-- ══════════════════════════════════════════════════════════════════════

-- ─── 1. Colonnes Phase 2 sur bookings ────────────────────────────────
-- (IF NOT EXISTS = idempotent, pas d'erreur si déjà présent)

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS completion_photo_url  TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS client_validated      BOOLEAN   DEFAULT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS client_validated_at   TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS client_thumbs_up      BOOLEAN;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS client_review_comment TEXT;

-- ─── 2. Colonnes Phase 2 sur reviews ─────────────────────────────────

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS booking_id TEXT REFERENCES bookings(id) ON DELETE SET NULL;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS thumbs_up  BOOLEAN;

-- ─── 3. Bucket Storage matchafro-photos ──────────────────────────────
-- ON CONFLICT = idempotent, aucune erreur si le bucket existe déjà.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'matchafro-photos',
  'matchafro-photos',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ─── 4. Policies Storage ─────────────────────────────────────────────
-- RLS sur storage.objects est déjà activé par Supabase Cloud.
-- On utilise des blocs DO pour ne créer que si absent (pas de DROP).

-- Lecture publique de toutes les photos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'storage_matchafro_photos_select'
  ) THEN
    CREATE POLICY "storage_matchafro_photos_select"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'matchafro-photos');
  END IF;
END $$;

-- Upload autorisé dans professionals/
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'storage_matchafro_photos_insert'
  ) THEN
    CREATE POLICY "storage_matchafro_photos_insert"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'matchafro-photos' AND name LIKE 'professionals/%');
  END IF;
END $$;

-- Mise à jour dans professionals/
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'storage_matchafro_photos_update'
  ) THEN
    CREATE POLICY "storage_matchafro_photos_update"
      ON storage.objects FOR UPDATE
      USING  (bucket_id = 'matchafro-photos' AND name LIKE 'professionals/%')
      WITH CHECK (bucket_id = 'matchafro-photos' AND name LIKE 'professionals/%');
  END IF;
END $$;

-- Suppression dans professionals/
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'storage_matchafro_photos_delete'
  ) THEN
    CREATE POLICY "storage_matchafro_photos_delete"
      ON storage.objects FOR DELETE
      USING (bucket_id = 'matchafro-photos' AND name LIKE 'professionals/%');
  END IF;
END $$;

-- ─── Fin de migration ─────────────────────────────────────────────────
-- Résultat attendu : 11 statements OK (7 ALTER + 1 INSERT + 4 DO blocks)
