/**
 * MatchAfro — Data Access Layer
 *
 * Toutes les opérations de lecture/écriture passent par ce module.
 * - Supabase quand disponible (isSupabaseEnabled = true)
 * - localStorage en fallback automatique
 *
 * Les fonctions sont async mais non bloquantes : l'UI se met à jour
 * immédiatement via React state, Supabase est sync en arrière-plan.
 */

import { supabase } from './supabase.js';

/* ─── Mappers DB ↔ JS ──────────────────────────────────────────────── */

export function proFromDB(r) {
  return {
    id: r.id, slug: r.slug, name: r.name,
    salonName:    r.salon_name    ?? '',
    phone:        r.phone         ?? '',
    whatsapp:     r.whatsapp      ?? '',
    instagram:    r.instagram     ?? '',
    email:        r.email         ?? '',
    city:         r.city          ?? '',
    address:      r.address       ?? '',
    description:  r.description   ?? '',
    categories:   r.categories    ?? [],
    services:     r.services      ?? [],
    homeService:  r.home_service  ?? false,
    photos:       r.photos        ?? [],
    gradient:     r.gradient      ?? 'linear-gradient(135deg,#D97706,#B45309)',
    initials:     r.initials      ?? (r.name?.[0] ?? '?'),
    verified:     r.verified      ?? false,
    founder:      r.founder       ?? false,
    founderNumber: r.founder_number ?? null,
    active:       r.active        ?? true,
    suspended:    r.suspended     ?? false,
    createdAt:    r.created_at,
    views:        r.views         ?? 0,
    lat:          r.lat           ?? null,
    lng:          r.lng           ?? null,
    availability:  r.availability  ?? {},
    blockedDates:  r.blocked_dates ?? [],
    pays_id:      r.pays_id,
    region_id:    r.region_id,
    dept_id:      r.dept_id,
    ville_id:     r.ville_id,
    arr_id:       r.arr_id,
  };
}

export function proToDB(p) {
  return {
    id:             p.id,
    slug:           p.slug,
    name:           p.name,
    salon_name:     p.salonName     ?? '',
    phone:          p.phone         ?? '',
    whatsapp:       p.whatsapp      ?? '',
    instagram:      p.instagram     ?? '',
    email:          p.email         ?? '',
    city:           p.city          ?? '',
    address:        p.address       ?? '',
    description:    p.description   ?? '',
    categories:     p.categories    ?? [],
    services:       p.services      ?? [],
    home_service:   p.homeService   ?? false,
    photos:         p.photos        ?? [],
    gradient:       p.gradient,
    initials:       p.initials,
    verified:       p.verified      ?? false,
    founder:        p.founder       ?? false,
    founder_number: p.founderNumber ?? null,
    active:         p.active        ?? true,
    suspended:      p.suspended     ?? false,
    views:          p.views         ?? 0,
    lat:            p.lat           ?? null,
    lng:            p.lng           ?? null,
    availability:   p.availability  ?? {},
    blocked_dates:  p.blockedDates  ?? [],
    pays_id:        p.pays_id       ?? null,
    region_id:      p.region_id     ?? null,
    dept_id:        p.dept_id       ?? null,
    ville_id:       p.ville_id      ?? null,
    arr_id:         p.arr_id        ?? null,
  };
}

export function bookingFromDB(r) {
  return {
    id:                      r.id,
    proId:                   r.pro_id,
    clientName:              r.client_name,
    clientPhone:             r.client_phone             ?? '',
    clientEmail:             r.client_email             ?? '',
    service:                 r.service,
    serviceId:               r.service_id               ?? '',
    date:                    r.date,
    startTime:               r.start_time,
    endTime:                 r.end_time                 ?? '',
    status:                  r.status,
    createdAt:               r.created_at,
    delayMinutes:            r.delay_minutes            ?? 0,
    estimatedStartTime:      r.estimated_start_time     ?? null,
    estimatedEndTime:        r.estimated_end_time       ?? null,
    clientLateMinutes:       r.client_late_minutes      ?? null,
    estimatedClientArrival:  r.estimated_client_arrival ?? null,
    completionPhotoUrl:      r.completion_photo_url     ?? null,
    clientValidated:         r.client_validated         ?? null,
    clientValidatedAt:       r.client_validated_at      ?? null,
    clientThumbsUp:          r.client_thumbs_up         ?? null,
    clientReviewComment:     r.client_review_comment    ?? null,
  };
}

export function bookingToDB(b) {
  return {
    id:                       b.id,
    pro_id:                   b.proId,
    client_name:              b.clientName,
    client_phone:             b.clientPhone             ?? '',
    client_email:             b.clientEmail             ?? '',
    service:                  b.service,
    service_id:               b.serviceId               ?? '',
    date:                     b.date,
    start_time:               b.startTime,
    end_time:                 b.endTime                 ?? '',
    status:                   b.status,
    delay_minutes:            b.delayMinutes            ?? 0,
    estimated_start_time:     b.estimatedStartTime      ?? null,
    estimated_end_time:       b.estimatedEndTime        ?? null,
    client_late_minutes:      b.clientLateMinutes       ?? null,
    estimated_client_arrival: b.estimatedClientArrival  ?? null,
    completion_photo_url:     b.completionPhotoUrl      ?? null,
    client_validated:         b.clientValidated         ?? null,
    client_validated_at:      b.clientValidatedAt       ?? null,
    client_thumbs_up:         b.clientThumbsUp          ?? null,
    client_review_comment:    b.clientReviewComment     ?? null,
  };
}

export function reviewFromDB(r) {
  return {
    id:        r.id,
    proId:     r.pro_id,
    author:    r.author,
    rating:    r.rating,
    comment:   r.comment,
    service:   r.service    ?? '',
    createdAt: r.created_at,
    verified:  r.verified   ?? false,
    bookingId: r.booking_id ?? null,
    thumbsUp:  r.thumbs_up  ?? null,
  };
}

export function reviewToDB(r) {
  return {
    id:         r.id,
    pro_id:     r.proId,
    author:     r.author,
    rating:     r.rating,
    comment:    r.comment,
    service:    r.service    ?? '',
    verified:   r.verified   ?? false,
    booking_id: r.bookingId  ?? null,
    thumbs_up:  r.thumbsUp   ?? null,
  };
}

export function notifFromDB(r) {
  return {
    id:               r.id,
    type:             r.type,
    proId:            r.pro_id,
    bookingId:        r.booking_id        ?? null,
    date:             r.date              ?? '',
    clientName:       r.client_name       ?? '',
    originalTime:     r.original_time     ?? null,
    newTime:          r.new_time          ?? null,
    delayMinutes:     r.delay_minutes     ?? null,
    estimatedArrival: r.estimated_arrival ?? null,
    lateMinutes:      r.late_minutes      ?? null,
    message:          r.message,
    createdAt:        r.created_at,
    read:             r.read              ?? false,
  };
}

export function notifToDB(n) {
  return {
    id:                n.id,
    type:              n.type,
    pro_id:            n.proId,
    booking_id:        n.bookingId        ?? null,
    date:              n.date             ?? '',
    client_name:       n.clientName       ?? '',
    original_time:     n.originalTime     ?? null,
    new_time:          n.newTime          ?? null,
    delay_minutes:     n.delayMinutes     ?? null,
    estimated_arrival: n.estimatedArrival ?? null,
    late_minutes:      n.lateMinutes      ?? null,
    message:           n.message,
    read:              n.read             ?? false,
  };
}

/* ─── Professionals ────────────────────────────────────────────────── */

export async function dbFetchPros() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('professionals')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) { console.error('[db] fetchPros:', error.message); return null; }
  return data.map(proFromDB);
}

export async function dbUpsertPro(pro) {
  if (!supabase) return;
  const { error } = await supabase.from('professionals').upsert(proToDB(pro));
  if (error) console.error('[db] upsertPro:', error.message);
}

export async function dbDeletePro(id) {
  if (!supabase) return;
  const { error } = await supabase.from('professionals').delete().eq('id', id);
  if (error) console.error('[db] deletePro:', error.message);
}

export async function dbIncrementViews(proId) {
  if (!supabase) return;
  const { data } = await supabase.from('professionals').select('views').eq('id', proId).single();
  if (data) await supabase.from('professionals').update({ views: (data.views || 0) + 1 }).eq('id', proId);
}

/* ─── Bookings ─────────────────────────────────────────────────────── */

export async function dbFetchBookings() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('date', { ascending: true });
  if (error) { console.error('[db] fetchBookings:', error.message); return null; }
  return data.map(bookingFromDB);
}

export async function dbInsertBooking(booking) {
  if (!supabase) return;
  const { error } = await supabase.from('bookings').insert(bookingToDB(booking));
  if (error) console.error('[db] insertBooking:', error.message);
}

export async function dbUpsertBookings(bookings) {
  if (!supabase) return;
  const { error } = await supabase.from('bookings').upsert(bookings.map(bookingToDB));
  if (error) console.error('[db] upsertBookings:', error.message);
}

export async function dbUpdateBooking(id, fields) {
  if (!supabase) return;
  const row = {};
  if (fields.status                  !== undefined) row.status                   = fields.status;
  if (fields.delayMinutes            !== undefined) row.delay_minutes            = fields.delayMinutes;
  if (fields.estimatedStartTime      !== undefined) row.estimated_start_time     = fields.estimatedStartTime;
  if (fields.estimatedEndTime        !== undefined) row.estimated_end_time       = fields.estimatedEndTime;
  if (fields.clientLateMinutes       !== undefined) row.client_late_minutes      = fields.clientLateMinutes;
  if (fields.estimatedClientArrival  !== undefined) row.estimated_client_arrival = fields.estimatedClientArrival;
  if (fields.completionPhotoUrl      !== undefined) row.completion_photo_url     = fields.completionPhotoUrl;
  if (fields.clientValidated         !== undefined) row.client_validated         = fields.clientValidated;
  if (fields.clientValidatedAt       !== undefined) row.client_validated_at      = fields.clientValidatedAt;
  if (fields.clientThumbsUp          !== undefined) row.client_thumbs_up         = fields.clientThumbsUp;
  if (fields.clientReviewComment     !== undefined) row.client_review_comment    = fields.clientReviewComment;
  const { error } = await supabase.from('bookings').update(row).eq('id', id);
  if (error) console.error('[db] updateBooking:', error.message);
}

export async function dbCancelBooking(id) {
  if (!supabase) return;
  const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id);
  if (error) console.error('[db] cancelBooking:', error.message);
}

/* ─── Reviews ──────────────────────────────────────────────────────── */

export async function dbFetchReviews() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('[db] fetchReviews:', error.message); return null; }
  return data.map(reviewFromDB);
}

export async function dbInsertReview(review) {
  if (!supabase) return;
  const { error } = await supabase.from('reviews').insert(reviewToDB(review));
  if (error) console.error('[db] insertReview:', error.message);
}

export async function dbUpdateReview(id, fields) {
  if (!supabase) return;
  const row = {};
  if (fields.verified  !== undefined) row.verified   = fields.verified;
  if (fields.thumbsUp  !== undefined) row.thumbs_up  = fields.thumbsUp;
  if (fields.bookingId !== undefined) row.booking_id = fields.bookingId;
  const { error } = await supabase.from('reviews').update(row).eq('id', id);
  if (error) console.error('[db] updateReview:', error.message);
}

/* ─── Notifications ────────────────────────────────────────────────── */

export async function dbFetchNotifications() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('[db] fetchNotifications:', error.message); return null; }
  return data.map(notifFromDB);
}

export async function dbInsertNotifications(notifs) {
  if (!supabase || !notifs.length) return;
  const { error } = await supabase.from('notifications').insert(notifs.map(notifToDB));
  if (error) console.error('[db] insertNotifications:', error.message);
}

export async function dbMarkNotifRead(id) {
  if (!supabase) return;
  const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
  if (error) console.error('[db] markNotifRead:', error.message);
}

export async function dbMarkAllNotifsRead(proId) {
  if (!supabase) return;
  const { error } = await supabase.from('notifications').update({ read: true })
    .eq('pro_id', proId).eq('read', false);
  if (error) console.error('[db] markAllNotifsRead:', error.message);
}

export async function dbDeleteOldDelayNotifs(proId, date) {
  if (!supabase) return;
  const { error } = await supabase.from('notifications')
    .delete().eq('pro_id', proId).eq('type', 'delay').eq('date', date);
  if (error) console.error('[db] deleteOldDelayNotifs:', error.message);
}

/* ─── Pro Delays ───────────────────────────────────────────────────── */

export async function dbFetchProDelays() {
  if (!supabase) return null;
  const { data, error } = await supabase.from('pro_delays').select('*');
  if (error) { console.error('[db] fetchProDelays:', error.message); return null; }
  return data.reduce((acc, r) => { acc[r.pro_id] = r.delay_minutes; return acc; }, {});
}

export async function dbUpsertProDelay(proId, delayMinutes) {
  if (!supabase) return;
  const { error } = await supabase.from('pro_delays')
    .upsert({ pro_id: proId, delay_minutes: delayMinutes, updated_at: new Date().toISOString() });
  if (error) console.error('[db] upsertProDelay:', error.message);
}

/* ─── Smart Time Events ────────────────────────────────────────────── */

export async function dbLogSmartTimeEvent(proId, eventType, delayMinutes, affectedBookingIds, refDate, refTime) {
  if (!supabase) return;
  const { error } = await supabase.from('smart_time_events').insert({
    pro_id:            proId,
    event_type:        eventType,
    delay_minutes:     delayMinutes,
    affected_bookings: affectedBookingIds,
    reference_date:    refDate,
    reference_time:    refTime,
  });
  if (error) console.error('[db] logSmartTimeEvent:', error.message);
}

/* ─── Seed initial data ────────────────────────────────────────────── */

export async function dbSeedIfEmpty(demoPros, demoBookings, demoReviews) {
  if (!supabase) return false;

  // Check if professionals table is empty
  const { data: existing, error } = await supabase
    .from('professionals').select('id').limit(1);
  if (error) { console.error('[db] seedCheck:', error.message); return false; }
  if (existing && existing.length > 0) return false; // Already seeded

  console.log('[db] Seeding demo data into Supabase...');

  const { error: e1 } = await supabase.from('professionals').insert(demoPros.map(proToDB));
  if (e1) { console.error('[db] seedPros:', e1.message); return false; }

  const { error: e2 } = await supabase.from('bookings').insert(demoBookings.map(bookingToDB));
  if (e2) { console.error('[db] seedBookings:', e2.message); return false; }

  const { error: e3 } = await supabase.from('reviews').insert(demoReviews.map(reviewToDB));
  if (e3) { console.error('[db] seedReviews:', e3.message); return false; }

  console.log('[db] Demo data seeded successfully.');
  return true;
}
