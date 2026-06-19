/* ─── Smart Time™ Engine — logique métier pure ──────────────── */

/** Add N minutes to a 'HH:MM' string */
export function addMinutes(timeStr, mins) {
  if (!timeStr || mins === 0) return timeStr;
  let [h, m] = timeStr.split(':').map(Number);
  m += mins;
  h += Math.floor(m / 60);
  m = ((m % 60) + 60) % 60;
  h = Math.min(Math.max(h, 0), 23);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Difference in minutes: t2 - t1 (can be negative) */
export function timeDiffMinutes(t1, t2) {
  const toMins = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  return toMins(t2) - toMins(t1);
}

/** 'HH:MM' → '9h00' */
export function formatTimeDisplay(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  return `${parseInt(h, 10)}h${m}`;
}

/** Current time as 'HH:MM' */
export function currentTimeStr() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/**
 * Cascade a delay to all future/today bookings of a pro.
 * Uses `estimatedStartTime` as the original anchor so repeated calls
 * are idempotent (delay is always relative to original, not cascaded).
 */
export function applyDelayToBookings(bookings, proId, referenceDate, referenceTime, delayMinutes) {
  return bookings.map(b => {
    if (b.proId !== proId) return b;
    if (b.status === 'cancelled') return b;

    const isToday  = b.date === referenceDate;
    const isFuture = b.date > referenceDate;
    const isAfterNow = isToday && b.startTime >= referenceTime;

    if (!isFuture && !isAfterNow) return b;

    const originalStart = b.estimatedStartTime ?? b.startTime;
    const originalEnd   = b.estimatedEndTime   ?? b.endTime;

    if (delayMinutes === 0) {
      return {
        ...b,
        startTime: originalStart,
        endTime:   originalEnd,
        delayMinutes: 0,
        status: b.status === 'late' ? 'scheduled' : b.status,
      };
    }

    return {
      ...b,
      estimatedStartTime: originalStart,
      estimatedEndTime:   originalEnd,
      startTime:    addMinutes(originalStart, delayMinutes),
      endTime:      addMinutes(originalEnd,   delayMinutes),
      delayMinutes,
      status: 'late',
    };
  });
}

/**
 * Smart Time badge status based on current delay.
 * 0–10 min → green, 11–25 min → orange, 26+ → red
 */
export function getSmartTimeStatus(delayMinutes = 0) {
  if (delayMinutes <= 10) {
    return { color: '#059669', bg: '#ECFDF5', emoji: '🟢', label: 'À l\'heure', level: 'green', border: '#6EE7B7' };
  }
  if (delayMinutes <= 25) {
    return { color: '#D97706', bg: '#FFFBEB', emoji: '🟠', label: 'Léger retard', level: 'orange', border: '#FDE68A' };
  }
  return { color: '#DC2626', bg: '#FEF2F2', emoji: '🔴', label: 'Retard important', level: 'red', border: '#FECACA' };
}

/**
 * Reliability score for a pro.
 * Returns { score: 0-100, label, breakdown }
 */
export function calculateReliability(proId, bookings, reviews) {
  const proBookings = bookings.filter(b => b.proId === proId);
  const total = proBookings.length;

  if (total === 0) {
    return { score: 100, label: 'Nouveau', breakdown: { total: 0, completed: 0, cancelled: 0, late: 0, avgRating: 5 } };
  }

  const cancelled = proBookings.filter(b => b.status === 'cancelled').length;
  const late      = proBookings.filter(b => b.status === 'late').length;
  const completed = total - cancelled;

  const proReviews = reviews.filter(r => r.proId === proId);
  const avgRating  = proReviews.length
    ? proReviews.reduce((s, r) => s + r.rating, 0) / proReviews.length
    : 5;

  let score = 100;
  score -= (cancelled / total) * 30;
  score -= (late / total) * 15;
  score *= (avgRating / 5) * 0.4 + 0.6;
  score = Math.round(Math.max(0, Math.min(100, score)));

  let label;
  if (score >= 95)     label = 'Excellent';
  else if (score >= 90) label = 'Très fiable';
  else if (score >= 80) label = 'Correct';
  else                  label = 'À améliorer';

  return { score, label, breakdown: { total, completed, cancelled, late, avgRating } };
}

/** Reliability score color */
export function reliabilityColor(score) {
  if (score >= 95) return '#059669';
  if (score >= 90) return '#D97706';
  if (score >= 80) return '#F59E0B';
  return '#EF4444';
}
