/* ─── MatchAfro Smart Calendar — Data Layer ──────────────────────────
   Deterministic slot generation: same proId+date+time always yields
   the same availability, ensuring consistent UI across re-renders.
──────────────────────────────────────────────────────────────────── */

/* ── Helpers ──────────────────────────────────────────────────────── */
export const toDateKey = d => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dy = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dy}`;
};

/** Current time in Europe/Paris as minutes since midnight — single source of truth */
export function nowParisMinutes() {
  const now = new Date();
  const parisDt = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
  return parisDt.getHours() * 60 + parisDt.getMinutes();
}

function _parisToday() {
  const now = new Date();
  const parisDt = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
  parisDt.setHours(0, 0, 0, 0);
  return parisDt;
}
const _today = _parisToday();
export const todayKey = toDateKey(_today);

/** Get Monday of the week containing `date`, then offset by N weeks */
export function getWeekStart(date, weekOffset = 0) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay(); // 0=Sun
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + diff + weekOffset * 7);
  return d;
}

export function getWeekDays(weekStart) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
}

/** Humanize a date relative to today */
export function humanDate(dateKey) {
  if (dateKey === todayKey) return "Aujourd'hui";
  const tomorrow = new Date(_today);
  tomorrow.setDate(_today.getDate() + 1);
  if (dateKey === toDateKey(tomorrow)) return 'Demain';
  const d = new Date(dateKey);
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' });
}

/** All half-hour time slots the system offers */
export const TIME_SLOTS = [
  '09:00','09:30','10:00','10:30','11:00','11:30',
  '12:00','12:30','13:00','13:30','14:00','14:30',
  '15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30',
];

export function slotToMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/* ── Deterministic availability ───────────────────────────────────── */
function simHash(str) {
  let h = 0;
  for (const c of str) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

/** Returns true ~65% of the time for a given pro/date/slot */
export function slotIsAvailable(proId, dateKey, time) {
  return simHash(proId + '|' + dateKey + '|' + time) % 100 < 65;
}

/* ── Slot queries ─────────────────────────────────────────────────── */

/** Available slots for one pro on one date (filters past + taken bookings) */
export function getProSlots(pro, dateKey, isSlotTakenFn = null) {
  const dow = new Date(dateKey).getDay();
  if (!pro.workDays.includes(dow)) return [];

  // Use per-day hours if adapter provided them, fall back to union hours
  const dayHours = pro.availabilityByDay?.[dow] ?? pro.hours;

  const nowMin = nowParisMinutes();

  return dayHours.filter(time => {
    if (dateKey === todayKey && slotToMinutes(time) <= nowMin + 20) return false;
    if (isSlotTakenFn?.(pro.id, dateKey, time)) return false;
    return true;
  });
}

/**
 * For a given date, returns:
 *   { [timeSlot]: [pro, pro, ...] }
 */
export function getSlotMap(dateKey, pros = [], isSlotTakenFn = null) {
  const map = {};
  for (const pro of pros) {
    for (const time of getProSlots(pro, dateKey, isSlotTakenFn)) {
      if (!map[time]) map[time] = [];
      map[time].push(pro);
    }
  }
  return map;
}

/** Find the nearest available slot across a list of pros */
export function findNearestSlot(pros = [], isSlotTakenFn = null) {
  const nowMin = nowParisMinutes();

  for (let d = 0; d < 14; d++) {
    const date = new Date(_today);
    date.setDate(_today.getDate() + d);
    const dateKey = toDateKey(date);
    const dow = date.getDay();

    for (const time of TIME_SLOTS) {
      const tMin = slotToMinutes(time);
      if (d === 0 && tMin <= nowMin + 20) continue;

      for (const pro of pros) {
        if (!pro.workDays.includes(dow)) continue;
        const dayHours = pro.availabilityByDay?.[dow] ?? pro.hours;
        if (!dayHours.includes(time)) continue;
        if (isSlotTakenFn?.(pro.id, dateKey, time)) continue;
        return { pro, dateKey, time };
      }
    }
  }
  return null;
}

/* ── Filter helpers ───────────────────────────────────────────────── */
export function filterPros(pros, { query = '', filters = new Set() } = {}, isSlotTakenFn = null) {
  const q = query.toLowerCase().trim();
  const nowMin = nowParisMinutes();

  // Weekend = Sat + Sun keys this week
  const sat = new Date(_today);
  const curDow = _today.getDay();
  sat.setDate(_today.getDate() + (6 - (curDow === 0 ? 7 : curDow)));
  const sun = new Date(sat); sun.setDate(sat.getDate() + 1);
  const satKey = toDateKey(sat), sunKey = toDateKey(sun);

  return pros.filter(pro => {
    // Text search
    if (q) {
      const searchable = [pro.name, pro.city, pro.district, pro.craft, pro.category].join(' ').toLowerCase();
      if (!searchable.includes(q)) return false;
    }

    if (filters.has('verified') && !pro.verified) return false;
    if (filters.has('founder') && !pro.founder) return false;
    if (filters.has('home') && !pro.homeService) return false;

    // "Disponible maintenant" — has a slot within the next 90 minutes today
    if (filters.has('now')) {
      const todaySlots = getProSlots(pro, todayKey, isSlotTakenFn);
      const soon = todaySlots.some(t => {
        const m = slotToMinutes(t);
        return m > nowMin && m <= nowMin + 90;
      });
      if (!soon) return false;
    }

    // "Aujourd'hui"
    if (filters.has('today')) {
      if (getProSlots(pro, todayKey, isSlotTakenFn).length === 0) return false;
    }

    // "Ce week-end"
    if (filters.has('weekend')) {
      const hasSat = getProSlots(pro, satKey, isSlotTakenFn).length > 0;
      const hasSun = getProSlots(pro, sunKey, isSlotTakenFn).length > 0;
      if (!hasSat && !hasSun) return false;
    }

    return true;
  });
}
