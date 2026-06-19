import { supabase, isSupabaseEnabled } from './supabase.js';

const BUCKET      = 'matchafro-photos';
const MAX_BYTES   = 10 * 1024 * 1024; // 10 Mo
const MAX_PHOTOS  = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

export { MAX_PHOTOS, MAX_BYTES, ALLOWED_TYPES };

/* ─── Validation côté client ──────────────────────────────────────── */
export function validatePhotoFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `Format non supporté (${file.type || 'inconnu'}). Utilisez JPG, PNG ou WEBP.`;
  }
  if (file.size > MAX_BYTES) {
    return `Fichier trop lourd : ${(file.size / 1024 / 1024).toFixed(1)} Mo (max 10 Mo).`;
  }
  return null; // valide
}

/* ─── URL publique sans requête réseau ────────────────────────────── */
export function getPublicUrl(path) {
  if (!supabase) return null;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl ?? null;
}

/* ─── Upload d'une photo ──────────────────────────────────────────── */
/**
 * @param {string} proId     - ID du professionnel (dossier de destination)
 * @param {string} fileId    - identifiant unique du fichier (évite les collisions)
 * @param {File}   file      - objet File sélectionné par l'utilisateur
 * @returns {{ url: string|null, path: string|null, error: string|null, devMode: boolean }}
 */
export async function uploadPhoto(proId, fileId, file) {
  // Mode développement sans Supabase → signaler à l'appelant (fallback blob URL)
  if (!isSupabaseEnabled || !supabase) {
    return { url: null, path: null, error: null, devMode: true };
  }

  const rawExt = file.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '');
  const ext    = rawExt || 'jpg';
  const path   = `professionals/${proId}/${fileId}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: true });

  if (uploadError) {
    console.error('[storage] uploadPhoto:', uploadError.message);
    const message = uploadError.message === 'Bucket not found'
      ? `Bucket Supabase Storage "${BUCKET}" introuvable. Exécutez supabase-schema.sql dans Supabase avant d'utiliser les uploads photo.`
      : uploadError.message;
    return { url: null, path, error: message, devMode: false };
  }

  const url = getPublicUrl(path);
  return { url, path, error: null, devMode: false };
}

/* ─── Suppression d'une photo ─────────────────────────────────────── */
/**
 * @param {string} path  - chemin complet dans le bucket (ex: professionals/pro_abc/img.jpg)
 * @returns {{ error: string|null }}
 */
export async function deletePhoto(path) {
  if (!isSupabaseEnabled || !supabase || !path) return { error: null };
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) console.warn('[storage] deletePhoto:', error.message);
  return { error: error?.message ?? null };
}
