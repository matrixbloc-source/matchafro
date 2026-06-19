-- MatchAfro — Schéma Supabase
-- Exécuter dans l'éditeur SQL du Dashboard Supabase
-- https://supabase.com/dashboard/project/tuapfdgyidxweemefkip/sql

-- ─── Extensions ───────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── TABLE : professionals ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS professionals (
  id              TEXT        PRIMARY KEY,
  slug            TEXT        UNIQUE NOT NULL,
  name            TEXT        NOT NULL,
  salon_name      TEXT        DEFAULT '',
  phone           TEXT        DEFAULT '',
  whatsapp        TEXT        DEFAULT '',
  instagram       TEXT        DEFAULT '',
  email           TEXT        DEFAULT '',
  city            TEXT        DEFAULT '',
  address         TEXT        DEFAULT '',
  description     TEXT        DEFAULT '',
  categories      TEXT[]      DEFAULT '{}',
  services        JSONB       DEFAULT '[]',
  home_service    BOOLEAN     DEFAULT false,
  photos          TEXT[]      DEFAULT '{}',
  gradient        TEXT,
  initials        TEXT,
  verified        BOOLEAN     DEFAULT false,
  founder         BOOLEAN     DEFAULT false,
  founder_number  INTEGER,
  active          BOOLEAN     DEFAULT true,
  suspended       BOOLEAN     DEFAULT false,
  views           INTEGER     DEFAULT 0,
  lat             FLOAT,
  lng             FLOAT,
  availability    JSONB       DEFAULT '{}',
  blocked_dates   TEXT[]      DEFAULT '{}',
  pays_id         TEXT,
  region_id       TEXT,
  dept_id         TEXT,
  ville_id        TEXT,
  arr_id          TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TABLE : bookings ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id                        TEXT        PRIMARY KEY,
  pro_id                    TEXT        NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  client_name               TEXT        NOT NULL,
  client_phone              TEXT        DEFAULT '',
  client_email              TEXT        DEFAULT '',
  service                   TEXT        NOT NULL,
  service_id                TEXT        DEFAULT '',
  date                      TEXT        NOT NULL,
  start_time                TEXT        NOT NULL,
  end_time                  TEXT        DEFAULT '',
  status                    TEXT        DEFAULT 'confirmed'
                              CHECK (status IN ('scheduled','in_progress','completed','late','cancelled','client_late','confirmed','pending')),
  delay_minutes             INTEGER     DEFAULT 0,
  estimated_start_time      TEXT,
  estimated_end_time        TEXT,
  client_late_minutes       INTEGER,
  estimated_client_arrival  TEXT,
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TABLE : reviews ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id         TEXT        PRIMARY KEY,
  pro_id     TEXT        NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  author     TEXT        NOT NULL,
  rating     INTEGER     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT        NOT NULL,
  service    TEXT        DEFAULT '',
  verified   BOOLEAN     DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TABLE : notifications ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id                  TEXT        PRIMARY KEY,
  type                TEXT        NOT NULL CHECK (type IN ('delay','client_late','booking','system')),
  pro_id              TEXT        NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  booking_id          TEXT        REFERENCES bookings(id) ON DELETE SET NULL,
  date                TEXT        DEFAULT '',
  client_name         TEXT        DEFAULT '',
  original_time       TEXT,
  new_time            TEXT,
  delay_minutes       INTEGER,
  estimated_arrival   TEXT,
  late_minutes        INTEGER,
  message             TEXT        NOT NULL,
  read                BOOLEAN     DEFAULT false,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TABLE : featured_slots ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS featured_slots (
  id         TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  pro_id     TEXT        NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  type       TEXT        NOT NULL CHECK (type IN ('founder','daily','weekly','monthly')),
  price      DECIMAL(10,2) DEFAULT 0,
  active     BOOLEAN     DEFAULT true,
  starts_at  TIMESTAMPTZ,
  ends_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TABLE : smart_time_events ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS smart_time_events (
  id                TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  pro_id            TEXT        NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  event_type        TEXT        NOT NULL CHECK (event_type IN ('delay_applied','delay_reset','client_late')),
  delay_minutes     INTEGER     DEFAULT 0,
  affected_bookings TEXT[]      DEFAULT '{}',
  reference_date    TEXT,
  reference_time    TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TABLE : pro_delays ───────────────────────────────────────────────
-- Délai courant par professionnel (clé primaire = pro_id → upsert facile)
CREATE TABLE IF NOT EXISTS pro_delays (
  pro_id        TEXT        PRIMARY KEY REFERENCES professionals(id) ON DELETE CASCADE,
  delay_minutes INTEGER     DEFAULT 0,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Trigger : updated_at auto ────────────────────────────────────────
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_professionals_updated_at ON professionals;
CREATE TRIGGER trg_professionals_updated_at
  BEFORE UPDATE ON professionals
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS trg_bookings_updated_at ON bookings;
CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- Storage bucket attendu par src/lib/storage.js : matchafro-photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'matchafro-photos',
  'matchafro-photos',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ─── Row Level Security ───────────────────────────────────────────────
ALTER TABLE professionals     ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews           ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_slots    ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_time_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE pro_delays        ENABLE ROW LEVEL SECURITY;

-- Professionals : lecture publique, écriture publique (mode anon — à restreindre après auth)
DROP POLICY IF EXISTS "pros_select" ON professionals;
CREATE POLICY "pros_select" ON professionals FOR SELECT USING (true);
DROP POLICY IF EXISTS "pros_insert" ON professionals;
CREATE POLICY "pros_insert" ON professionals FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "pros_update" ON professionals;
CREATE POLICY "pros_update" ON professionals FOR UPDATE USING (true);
DROP POLICY IF EXISTS "pros_delete" ON professionals;
CREATE POLICY "pros_delete" ON professionals FOR DELETE USING (true);

-- Bookings : toutes opérations (clients anon + pros)
DROP POLICY IF EXISTS "bookings_all" ON bookings;
CREATE POLICY "bookings_all" ON bookings FOR ALL USING (true) WITH CHECK (true);

-- Reviews : lecture + création + mise à jour (vérification admin)
DROP POLICY IF EXISTS "reviews_select" ON reviews;
CREATE POLICY "reviews_select" ON reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "reviews_insert" ON reviews;
CREATE POLICY "reviews_insert" ON reviews FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "reviews_update" ON reviews;
CREATE POLICY "reviews_update" ON reviews FOR UPDATE USING (true);

-- Notifications : toutes opérations
DROP POLICY IF EXISTS "notifs_all" ON notifications;
CREATE POLICY "notifs_all" ON notifications FOR ALL USING (true) WITH CHECK (true);

-- Featured slots : lecture publique
DROP POLICY IF EXISTS "featured_select" ON featured_slots;
CREATE POLICY "featured_select" ON featured_slots FOR SELECT USING (active = true);
DROP POLICY IF EXISTS "featured_insert" ON featured_slots;
CREATE POLICY "featured_insert" ON featured_slots FOR INSERT WITH CHECK (true);

-- Smart time events : toutes opérations
DROP POLICY IF EXISTS "st_events_all" ON smart_time_events;
CREATE POLICY "st_events_all" ON smart_time_events FOR ALL USING (true) WITH CHECK (true);

-- Pro delays : toutes opérations
DROP POLICY IF EXISTS "pro_delays_all" ON pro_delays;
CREATE POLICY "pro_delays_all" ON pro_delays FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "storage_matchafro_photos_select" ON storage.objects;
CREATE POLICY "storage_matchafro_photos_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'matchafro-photos');

DROP POLICY IF EXISTS "storage_matchafro_photos_insert" ON storage.objects;
CREATE POLICY "storage_matchafro_photos_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'matchafro-photos' AND name LIKE 'professionals/%');

DROP POLICY IF EXISTS "storage_matchafro_photos_update" ON storage.objects;
CREATE POLICY "storage_matchafro_photos_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'matchafro-photos' AND name LIKE 'professionals/%')
  WITH CHECK (bucket_id = 'matchafro-photos' AND name LIKE 'professionals/%');

DROP POLICY IF EXISTS "storage_matchafro_photos_delete" ON storage.objects;
CREATE POLICY "storage_matchafro_photos_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'matchafro-photos' AND name LIKE 'professionals/%');

-- ─── Phase 2 : colonnes ajoutées sur bookings ─────────────────────────
-- Exécuter après la création initiale des tables (ALTER TABLE est idempotent avec IF NOT EXISTS)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS completion_photo_url  TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS client_validated      BOOLEAN   DEFAULT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS client_validated_at   TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS client_thumbs_up      BOOLEAN;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS client_review_comment TEXT;

-- reviews : lien optionnel vers la réservation source (avis automatiques)
ALTER TABLE reviews  ADD COLUMN IF NOT EXISTS booking_id TEXT REFERENCES bookings(id) ON DELETE SET NULL;
ALTER TABLE reviews  ADD COLUMN IF NOT EXISTS thumbs_up  BOOLEAN;

-- ─── Index pour les requêtes fréquentes ───────────────────────────────
CREATE INDEX IF NOT EXISTS idx_bookings_pro_date   ON bookings(pro_id, date);
CREATE INDEX IF NOT EXISTS idx_reviews_pro         ON reviews(pro_id);
CREATE INDEX IF NOT EXISTS idx_notifs_pro_unread   ON notifications(pro_id, read);
CREATE INDEX IF NOT EXISTS idx_featured_active     ON featured_slots(pro_id, active);
