/**
 * MatchAfro Smart Calendar — V4 Premium
 * Design: ultra-premium dark, palette or champagne MatchAfro
 * Logique métier: 100% préservée (Smart Time, Supabase, réservations, filtres)
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TIME_SLOTS, toDateKey, todayKey,
  getWeekStart, getWeekDays, getProSlots, getSlotMap,
  findNearestSlot, filterPros, humanDate, slotToMinutes,
} from '../data/calendarData.js';

/* ── Smart Time™ imports (dashboard + profile modes) ── */
import { useApp } from '../context/AppContext.jsx';
import { useSmartTime } from '../hooks/useSmartTime.js';
import BookingCalendar from './BookingCalendar.jsx';
import SmartTimeBadge from './smarttime/SmartTimeBadge.jsx';
import _LiveClock from './smarttime/LiveClock.jsx';
import DelayManager from './smarttime/DelayManager.jsx';
import FeaturedTicker from './smarttime/FeaturedTicker.jsx';
import ReliabilityScore from './smarttime/ReliabilityScore.jsx';
import { formatTimeDisplay, addMinutes } from '../lib/smartTimeEngine.js';
import CompletionModal from './CompletionModal.jsx';

/* ─── STATUS MAP (booking statuses) ─────────────────────────────── */
const STATUS_MAP = {
  scheduled:   { label: 'Prévu',            color: '#374151', bg: '#F9FAFB', border: '#E5E7EB' },
  confirmed:   { label: 'Confirmé',          color: '#374151', bg: '#F9FAFB', border: '#E5E7EB' },
  pending:     { label: 'En attente',         color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  in_progress: { label: 'En cours',          color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  late:        { label: null,                 color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  client_late: { label: 'Cliente en retard', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  completed:   { label: 'Terminé',           color: '#059669', bg: '#ECFDF5', border: '#6EE7B7' },
  cancelled:   { label: 'Annulé',            color: '#9CA3AF', bg: '#F9FAFB', border: '#E5E7EB' },
};

/* ═══════════════════════════════════════════════════════════════════
   DASHBOARD / PROFILE COMPONENTS — inchangés (logique pro)
═══════════════════════════════════════════════════════════════════ */

function TodayBookingCard({ booking, onComplete }) {
  const s = STATUS_MAP[booking.status] || STATUS_MAP.confirmed;
  const lbl = booking.status === 'late' ? `+${booking.delayMinutes ?? 0} min` : s.label;
  const isActive = !['completed', 'cancelled'].includes(booking.status);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: s.bg, borderRadius: 12, border: `1px solid ${s.border}` }}>
      <div style={{ flexShrink: 0, minWidth: 48 }}>
        <p style={{ fontSize: 15, fontWeight: 800, color: s.color, margin: 0, fontFamily: 'Inter, sans-serif' }}>{booking.startTime}</p>
        {booking.estimatedStartTime && booking.estimatedStartTime !== booking.startTime && (
          <p style={{ fontSize: 10, color: '#9CA3AF', textDecoration: 'line-through', margin: 0, fontFamily: 'Inter, sans-serif' }}>{booking.estimatedStartTime}</p>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: 0, fontFamily: 'Inter, sans-serif' }}>{booking.clientName}</p>
        <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0, fontFamily: 'Inter, sans-serif' }}>
          {booking.service}
          {booking.status === 'client_late' && booking.estimatedClientArrival ? ` · Arrivée : ${formatTimeDisplay(booking.estimatedClientArrival)}` : ''}
          {booking.status === 'completed' && booking.completionPhotoUrl ? ' · 📸 Photo ajoutée' : ''}
        </p>
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {lbl && <span style={{ fontSize: 11, fontWeight: 700, color: s.color, background: s.color + '18', border: `1px solid ${s.color}30`, borderRadius: 6, padding: '2px 7px', fontFamily: 'Inter, sans-serif' }}>{lbl}</span>}
        {isActive && onComplete && (
          <button
            onClick={() => onComplete(booking)}
            aria-label={`Terminer RDV de ${booking.clientName}`}
            style={{ background: 'linear-gradient(135deg,#C9863A,#8A4F26)', border: 'none', borderRadius: 8, padding: '4px 10px', fontSize: 11, color: '#fff', cursor: 'pointer', fontWeight: 700, fontFamily: 'Inter, sans-serif', boxShadow: '0 2px 8px rgba(137,79,38,0.3)' }}
          >
            ✓ Terminer
          </button>
        )}
      </div>
    </div>
  );
}

function NotifCard({ notif, onClear }) {
  const isClientLate = notif.type === 'client_late';
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, background: isClientLate ? '#FEF2F2' : '#FFFBEB', border: `1px solid ${isClientLate ? '#FECACA' : '#FDE68A'}`, borderRadius: 10, padding: '10px 14px', fontSize: 13, color: isClientLate ? '#DC2626' : '#92400E', fontFamily: 'Inter, sans-serif' }}>
      <p style={{ margin: 0, lineHeight: 1.5 }}>{notif.message}</p>
      <button onClick={() => onClear(notif.id)} aria-label="Fermer" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'inherit', opacity: 0.5, flexShrink: 0 }}>×</button>
    </div>
  );
}

function ClientLateModal({ booking, onClose }) {
  const { markClientLate } = useApp();
  const [sent, setSent] = useState(false);
  function handleLate(mins) { markClientLate(booking.id, mins); setSent(true); setTimeout(onClose, 2000); }
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 20, padding: 28, maxWidth: 360, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#059669', fontFamily: 'Inter, sans-serif' }}>Votre professionnel a été prévenu.</p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#0F0F0F', marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>⚠️ Je suis en retard</p>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 20, fontFamily: 'Inter, sans-serif' }}>De combien de temps estimez-vous votre retard ?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[5, 10, 15, 30].map(m => (
                <button key={m} onClick={() => handleLate(m)}
                  style={{ padding: '12px', borderRadius: 12, border: '1.5px solid #E5E7EB', background: '#F9FAFB', fontSize: 14, fontWeight: 600, color: '#374151', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#D97706'; e.currentTarget.style.background = '#FFFBEB'; e.currentTarget.style.color = '#92400E'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.color = '#374151'; }}>
                  +{m} minutes
                </button>
              ))}
            </div>
            <button onClick={onClose} style={{ marginTop: 14, width: '100%', padding: '10px', border: 'none', background: 'none', fontSize: 13, color: '#9CA3AF', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Annuler</button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ─── Dashboard view ─────────────────────────────────────────────── */
function DashboardSmartView({ pro }) {
  const { bookings, clearNotification } = useApp();
  const { currentDelay, applyDelay, proNotifications } = useSmartTime(pro.id);
  const [completingBooking, setCompletingBooking] = useState(null);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayBookings = useMemo(() =>
    bookings.filter(b => b.proId === pro.id && b.date === todayStr && b.status !== 'cancelled')
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [bookings, pro.id, todayStr]
  );

  const completedToday = todayBookings.filter(b => b.status === 'completed').length;
  const pendingToday   = todayBookings.filter(b => !['completed','cancelled'].includes(b.status)).length;

  return (
    <div>
      <div style={{ background: '#fff', borderRadius: 18, border: '1.5px solid #E5E7EB', padding: '20px 22px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#0F0F0F', fontFamily: 'Inter, sans-serif' }}>⚡ Smart Time™</span>
            <SmartTimeBadge delayMinutes={currentDelay} />
          </div>
          <_LiveClock />
        </div>
        <DelayManager proId={pro.id} currentDelay={currentDelay} onApply={applyDelay} />
        <AnimatePresence>
          {proNotifications.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginTop: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>🔔 Notifications ({proNotifications.length})</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {proNotifications.slice(0, 4).map(n => <NotifCard key={n.id} notif={n} onClear={clearNotification} />)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {todayBookings.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #E5E7EB', padding: '20px 22px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#0F0F0F', margin: 0, fontFamily: 'Inter, sans-serif' }}>
              🗓️ {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {completedToday > 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, background: '#ECFDF5', color: '#059669', border: '1px solid #6EE7B7', borderRadius: 20, padding: '3px 10px', fontFamily: 'Inter, sans-serif' }}>
                  ✓ {completedToday} terminé{completedToday > 1 ? 's' : ''}
                </span>
              )}
              {pendingToday > 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A', borderRadius: 20, padding: '3px 10px', fontFamily: 'Inter, sans-serif' }}>
                  ⏳ {pendingToday} à venir
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {todayBookings.map(b => (
              <TodayBookingCard key={b.id} booking={b} onComplete={setCompletingBooking} />
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 16 }}><ReliabilityScore proId={pro.id} /></div>
      <BookingCalendar pro={pro} clientMode={false} />

      <AnimatePresence>
        {completingBooking && (
          <CompletionModal booking={completingBooking} onClose={() => setCompletingBooking(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Profile view ───────────────────────────────────────────────── */
function ProfileSmartView({ pro }) {
  const { pros, bookings } = useApp();
  const { currentDelay, status } = useSmartTime(pro.id);
  const [lateBooking, setLateBooking] = useState(null);
  const [selectedPro, setSelectedPro] = useState(pro);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayBookingForClient = useMemo(() =>
    bookings.find(b => b.proId === selectedPro.id && b.date === todayStr && !['cancelled','completed','client_late'].includes(b.status)),
    [bookings, selectedPro.id, todayStr]
  );

  return (
    <div>
      <ProfileSearchBar pros={pros} onResult={setSelectedPro} />
      <AnimatePresence>
        {currentDelay > 0 && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            style={{ background: status.bg, border: `1px solid ${status.border}`, borderRadius: 12, padding: '10px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>{status.emoji}</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: status.color, margin: 0, fontFamily: 'Inter, sans-serif' }}>{selectedPro.name} — {status.label} (+{currentDelay} min)</p>
              <p style={{ fontSize: 11, color: status.color, opacity: 0.8, margin: 0, fontFamily: 'Inter, sans-serif' }}>Les créneaux ont été mis à jour.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <BookingCalendar pro={selectedPro} clientMode />
      {todayBookingForClient && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ marginTop: 12, padding: '11px 16px', background: '#F9FAFB', borderRadius: 14, border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <p style={{ fontSize: 13, color: '#374151', margin: 0, fontFamily: 'Inter, sans-serif' }}>RDV aujourd'hui à {todayBookingForClient.startTime}</p>
          <button onClick={() => setLateBooking(todayBookingForClient)}
            style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            ⚠️ Je suis en retard
          </button>
        </motion.div>
      )}
      <div style={{ marginTop: 18 }}><FeaturedTicker /></div>
      <AnimatePresence>
        {lateBooking && <ClientLateModal booking={lateBooking} onClose={() => setLateBooking(null)} />}
      </AnimatePresence>
    </div>
  );
}

function ProfileSearchBar({ pros, onResult }) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return pros.filter(p => p.active && !p.suspended).filter(p =>
      p.name?.toLowerCase().includes(q) || p.city?.toLowerCase().includes(q) ||
      (p.categories || []).some(c => c.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [query, pros]);

  return (
    <div style={{ position: 'relative', marginBottom: 14 }}>
      <input type="search" value={query} onChange={e => setQuery(e.target.value)}
        placeholder="Rechercher un nom, une ville, une spécialité..." aria-label="Rechercher un professionnel"
        style={{ display: 'block', width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 12, padding: '10px 14px 10px 36px', fontSize: 14, color: '#111', background: '#F9FAFB', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }} />
      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>🔍</span>
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.10)', overflow: 'hidden', marginTop: 4 }}>
            {results.map(p => (
              <button key={p.id} onClick={() => { onResult(p); setQuery(''); }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter, sans-serif', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: p.gradient || '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{p.initials || p.name?.[0]}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: 0 }}>{p.name}</p>
                  <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>{p.city} · {(p.categories || []).slice(0,2).join(', ')}</p>
                </div>
                {p.founder && <span style={{ fontSize: 10, background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A', borderRadius: 10, padding: '1px 6px', fontWeight: 700, flexShrink: 0 }}>⭐ Fondateur</span>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HOME VIEW — PREMIUM DARK
═══════════════════════════════════════════════════════════════════ */

/* ─── Design tokens — Premium Dark ──────────────────────────────── */
const F    = "'Fraunces', Georgia, serif";
const INK  = '#F8F2EA';
const BG   = '#0B0B0B';
const CARD = '#111111';
const BRNZ = '#D4A574';
const DEEP = '#A87E3C';
const LITE = '#E8C99B';
const CRM  = 'rgba(212,165,116,0.10)';
const MIST = '#181818';
const LINE = 'rgba(255,255,255,0.07)';
const EASE = [0.22, 1, 0.36, 1];

/* ─── Timezone ───────────────────────────────────────────────────── */
function getTz() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = -new Date().getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const abs = Math.abs(offset);
    const h = String(Math.floor(abs / 60)).padStart(2, '0');
    const m = String(abs % 60).padStart(2, '0');
    return `${tz} · UTC${sign}${h}:${m}`;
  } catch { return 'Europe/Paris · UTC+02:00'; }
}

/* ─── LiveClock (home view — re-renders chaque seconde) ──────────── */
function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <span style={{ position: 'relative', width: 8, height: 8, display: 'inline-flex', flexShrink: 0 }}>
        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: BRNZ, animation: 'sc-ping 2s cubic-bezier(0,0,0.2,1) infinite' }} />
        <span style={{ position: 'relative', width: 8, height: 8, borderRadius: '50%', background: BRNZ }} />
      </span>
      <span style={{ fontSize: 20, fontWeight: 700, color: INK, fontFamily: "'IBM Plex Mono','Courier New',monospace", letterSpacing: '0.01em', lineHeight: 1 }}>
        {time}
      </span>
    </div>
  );
}

/* ─── Quick filters config ───────────────────────────────────────── */
const SUGGESTIONS = [
  'Tresses', 'Box braids', 'Locks', 'Perruques', 'Barber',
  'Maquillage', 'Onglerie', 'Paris', 'Lyon', 'Marseille', 'Bruxelles',
  '18e', '10e', 'À domicile', 'Aïssata', 'Studio Naïla',
];

const QUICK_FILTERS = [
  { key: 'now',      label: 'Disponible maintenant', icon: '●' },
  { key: 'today',    label: "Aujourd'hui",            icon: '◈' },
  { key: 'weekend',  label: 'Ce week-end',            icon: '◆' },
  { key: 'home',     label: 'À domicile',             icon: '⌂' },
  { key: 'verified', label: 'Vérifié MatchAfro',      icon: '✓' },
  { key: 'founder',  label: 'Fondateur',              icon: '★' },
];

/* ─── Pro avatar pill ────────────────────────────────────────────── */
function ProPill({ pro, size = 24 }) {
  return (
    <span
      title={pro.name}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: size, height: size, borderRadius: '50%',
        background: pro.color || '#A87E3C',
        color: '#fff',
        fontSize: size * 0.36, fontWeight: 800,
        border: '1.5px solid rgba(212,165,116,0.45)',
        flexShrink: 0,
        boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.5)',
        fontFamily: 'Inter, sans-serif',
        letterSpacing: '-0.02em',
      }}
    >
      {pro.initials}
    </span>
  );
}

/* ─── Slot cell ──────────────────────────────────────────────────── */
function SlotCell({ pros, dateKey, time, isNowRow, onBook, onHover, onLeave }) {
  const [hov, setHov] = useState(false);
  const ref = useRef(null);
  const count = pros.length;

  if (count === 0) {
    return (
      <div style={{
        height: 38,
        borderBottom: `1px solid ${LINE}`,
        borderRight: `1px solid ${LINE}`,
        background: isNowRow ? 'rgba(212,165,116,0.04)' : 'transparent',
        transition: 'background 0.2s',
      }} />
    );
  }

  const shown = pros.slice(0, 2);
  const extra = count - 2;

  function handleEnter() {
    setHov(true);
    if (onHover && ref.current) {
      onHover(pros, dateKey, time, ref.current.getBoundingClientRect());
    }
  }
  function handleLeave() {
    setHov(false);
    if (onLeave) onLeave();
  }

  return (
    <div
      ref={ref}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={() => onBook(pros[0], dateKey, time)}
      style={{
        position: 'relative', height: 38,
        borderBottom: `1px solid ${LINE}`,
        borderRight: `1px solid ${LINE}`,
        background: hov
          ? 'rgba(212,165,116,0.22)'
          : isNowRow
            ? 'rgba(212,165,116,0.12)'
            : 'rgba(212,165,116,0.07)',
        cursor: 'pointer',
        transition: 'background 0.15s',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 3, padding: '0 4px',
        boxShadow: hov ? 'inset 0 0 0 1px rgba(212,165,116,0.35)' : 'none',
      }}
    >
      {shown.map(p => <ProPill key={p.id} pro={p} size={22} />)}
      {extra > 0 && (
        <span style={{
          fontSize: 9, fontWeight: 800, color: BRNZ,
          background: 'rgba(212,165,116,0.15)',
          borderRadius: 999, padding: '1px 5px',
          border: `1px solid rgba(212,165,116,0.3)`,
        }}>
          +{extra}
        </span>
      )}
    </div>
  );
}

/* ─── Slot tooltip ───────────────────────────────────────────────── */
function SlotTooltip({ pros, dateKey, time, rect, onEnter, onLeave }) {
  if (!pros || !rect) return null;
  const p = pros[0];
  if (!p) return null;

  const winW = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const winH = typeof window !== 'undefined' ? window.innerHeight : 800;
  const TW = 228;
  const TH = 220;
  const x = rect.right + 10 + TW > winW ? rect.left - TW - 10 : rect.right + 10;
  const y = Math.min(Math.max(rect.top - 10, 12), winH - TH - 12);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -4 }}
      transition={{ duration: 0.18, ease: EASE }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        position: 'fixed', left: x, top: y, zIndex: 500,
        width: TW,
        background: 'linear-gradient(160deg, #1A1812 0%, #111009 100%)',
        border: '1px solid rgba(212,165,116,0.25)',
        borderRadius: 16,
        boxShadow: '0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        cursor: 'default',
      }}
    >
      {/* Photo / gradient */}
      <div style={{ height: 72, position: 'relative', overflow: 'hidden' }}>
        {p.img
          ? <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <div style={{ width: '100%', height: '100%', background: p.color || DEEP }} />
        }
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(11,9,5,0.85))' }} />
        {p.verified && (
          <span style={{ position: 'absolute', top: 8, right: 8, fontSize: 10, fontWeight: 700, color: BRNZ, background: 'rgba(0,0,0,0.6)', borderRadius: 999, padding: '2px 7px', border: `1px solid rgba(212,165,116,0.3)` }}>
            ✓ Vérifié
          </span>
        )}
        <div style={{ position: 'absolute', bottom: 8, left: 10 }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: '#fff', margin: 0, fontFamily: 'Inter, sans-serif', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>{p.name}</p>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '10px 12px' }}>
        <p style={{ fontSize: 11, color: 'rgba(212,165,116,0.85)', margin: '0 0 6px', fontFamily: 'Inter, sans-serif' }}>
          {p.craft} · {p.city}{p.district ? ` ${p.district}` : ''}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#F59E0B' }}>★</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: INK }}>{p.rating?.toFixed(2) ?? '—'}</span>
          {p.founder && <span style={{ fontSize: 10, color: BRNZ, background: 'rgba(212,165,116,0.12)', borderRadius: 4, padding: '1px 5px', fontWeight: 700 }}>★ Fondateur</span>}
        </div>
        <div style={{ background: 'rgba(212,165,116,0.08)', borderRadius: 8, padding: '6px 10px', border: '1px solid rgba(212,165,116,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Inter, sans-serif' }}>Prochain créneau</p>
            <p style={{ fontSize: 14, fontWeight: 800, color: BRNZ, margin: 0, fontFamily: "'IBM Plex Mono','Courier New',monospace" }}>{time}</p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', margin: '1px 0 0', fontFamily: 'Inter, sans-serif' }}>{humanDate(dateKey)}</p>
          </div>
          <p style={{ fontSize: 12, fontWeight: 700, color: INK, margin: 0, fontFamily: 'Inter, sans-serif' }}>dès {p.from}€</p>
        </div>
        {p.slug && (
          <Link
            to={`/pro/${p.slug}`}
            style={{
              display: 'block', marginTop: 10,
              textAlign: 'center', fontSize: 11, fontWeight: 700,
              color: BRNZ, textDecoration: 'none', letterSpacing: '0.04em',
              padding: '5px 0',
              borderTop: '1px solid rgba(212,165,116,0.12)',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#F4C16F'}
            onMouseLeave={e => e.currentTarget.style.color = BRNZ}
          >
            Voir le profil →
          </Link>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Booking modal — dark premium ──────────────────────────────── */
function BookingModal({ booking, onClose }) {
  const [chosen, setChosen] = useState(booking?.pro ?? null);
  const navigate = useNavigate();
  if (!booking) return null;
  const { pro, dateKey, time, allPros } = booking;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(5,4,2,0.85)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(12px,4vw,24px)',
      }}
    >
      <motion.div
        initial={{ scale: 0.93, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 24 }}
        transition={{ duration: 0.3, ease: EASE }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(160deg, #141210 0%, #0C0A08 100%)',
          border: '1px solid rgba(212,165,116,0.2)',
          borderRadius: 'clamp(16px,3vw,28px)',
          padding: 'clamp(18px,4vw,32px)',
          width: '100%', maxWidth: 480,
          maxHeight: '90dvh', overflowY: 'auto',
          boxShadow: '0 60px 100px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ height: 1, width: 24, background: `linear-gradient(90deg,${BRNZ},transparent)` }} />
              <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.18em', color: DEEP, fontFamily: 'Inter, sans-serif' }}>Réservation</span>
            </div>
            <h3 style={{ fontFamily: F, fontSize: 22, fontWeight: 500, letterSpacing: '-0.04em', color: INK, margin: 0 }}>
              {humanDate(dateKey)} à {time}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', fontSize: 16, color: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
          >✕</button>
        </div>

        {/* Pro selector */}
        {allPros.length > 1 && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(248,242,234,0.35)', marginBottom: 10, fontFamily: 'Inter, sans-serif' }}>
              {allPros.length} professionnels disponibles
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {allPros.map(p => (
                <button key={p.id} onClick={() => setChosen(p)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 14,
                  border: `1.5px solid ${chosen.id === p.id ? BRNZ : 'rgba(255,255,255,0.1)'}`,
                  background: chosen.id === p.id ? CRM : 'rgba(255,255,255,0.04)',
                  cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
                }}>
                  <ProPill pro={p} size={36} />
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: INK, margin: 0, fontFamily: 'Inter, sans-serif' }}>{p.name}</p>
                    <p style={{ fontSize: 12, color: DEEP, margin: 0, fontFamily: 'Inter, sans-serif' }}>{p.craft} · {p.city} {p.district}</p>
                  </div>
                  <div style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 600, color: INK, fontFamily: 'Inter, sans-serif' }}>dès {p.from}€</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Single pro info */}
        {allPros.length === 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'rgba(212,165,116,0.07)', borderRadius: 16, marginBottom: 20, border: '1px solid rgba(212,165,116,0.15)' }}>
            {chosen.img
              ? <img src={chosen.img} alt={chosen.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(212,165,116,0.4)' }} />
              : <ProPill pro={chosen} size={48} />
            }
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: INK, margin: 0, fontFamily: 'Inter, sans-serif' }}>{chosen.name}</p>
              <p style={{ fontSize: 12, color: DEEP, margin: '2px 0 0', fontFamily: 'Inter, sans-serif' }}>{chosen.craft} · {chosen.city} {chosen.district}</p>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <p style={{ fontFamily: F, fontSize: 18, fontWeight: 500, color: BRNZ, margin: 0 }}>dès {chosen.from}€</p>
            </div>
          </div>
        )}

        {/* Slot summary */}
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '14px 18px', marginBottom: 24, border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 11, color: 'rgba(248,242,234,0.35)', margin: '0 0 4px', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Créneau sélectionné</p>
              <p style={{ fontFamily: F, fontSize: 20, fontWeight: 500, color: INK, letterSpacing: '-0.03em', margin: 0 }}>
                {humanDate(dateKey)} · {time}
              </p>
            </div>
            <div style={{ fontSize: 28 }}>📅</div>
          </div>
        </div>

        <button
          onClick={() => { onClose(); navigate(`/pro/${chosen.slug}#reservation`); }}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 14,
            background: `linear-gradient(135deg, ${BRNZ}, ${DEEP})`,
            color: '#0B0B0B', border: 'none', cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 800,
            transition: 'opacity 0.2s',
            boxShadow: `0 8px 28px rgba(212,165,116,0.3)`,
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Réserver chez {chosen.name} →
        </button>
        <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(248,242,234,0.28)', marginTop: 12, fontFamily: 'Inter, sans-serif' }}>
          Confirmation immédiate · Annulation gratuite 24h avant
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ─── Mode router ────────────────────────────────────────────────── */
function SmartCalendarRouter({ mode, pro: propPro, compact }) {
  const { currentPro } = useApp();
  const pro = propPro ?? currentPro;
  if (mode === 'dashboard') { if (!pro) return null; return <DashboardSmartView pro={pro} />; }
  if (mode === 'profile')   { if (!pro) return null; return <ProfileSmartView pro={pro} />;   }
  return <SmartCalendarHome compact={compact} />;
}

/* ─── AppContext → Calendar format adapter ───────────────────────── */
function appProToCalendarPro(appPro, rating = 0) {
  const avail = appPro.availability || {};

  const workDays = Object.keys(avail).map(k => {
    const n = Number(k);
    return n === 7 ? 0 : n;
  });

  const hoursSet = new Set();
  Object.values(avail).forEach(slots => {
    (slots || []).forEach(slot => {
      TIME_SLOTS.forEach(t => {
        if (t >= (slot.start || '09:00') && t < (slot.end || '19:00')) hoursSet.add(t);
      });
    });
  });
  const hours = [...hoursSet].sort();

  if (!workDays.length) workDays.push(1, 2, 3, 4, 5);
  if (!hours.length)    hours.push(...TIME_SLOTS.filter(t => t >= '09:00' && t <= '18:00'));

  // Per-day hours (used by getProSlots to show correct ranges per day)
  const availabilityByDay = Object.fromEntries(
    Object.entries(avail).map(([k, slots]) => {
      const dow = Number(k) === 7 ? 0 : Number(k);
      const daySet = new Set();
      (slots || []).forEach(slot => {
        TIME_SLOTS.forEach(t => {
          if (t >= (slot.start || '09:00') && t < (slot.end || '19:00')) daySet.add(t);
        });
      });
      return [dow, [...daySet].sort()];
    })
  );

  const services = appPro.services || [];
  const craft    = services.length > 0
    ? services[0].name
    : (appPro.categories || []).map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(' & ') || 'Beauté afro';
  const category = (appPro.categories || [])[0] || 'beaute';
  const prices   = services.map(s => Number(s.price) || 0).filter(Boolean);
  const from     = prices.length ? Math.min(...prices) : null;

  const colorMatch = (appPro.gradient || '').match(/#[0-9a-fA-F]{6}/);
  const color      = colorMatch ? colorMatch[0] : '#A87E3C';
  const img        = (appPro.photos || []).filter(Boolean)[0] || null;

  const cityParts = (appPro.city || '').trim().split(/\s+/);
  const district  = cityParts.length > 1 ? cityParts[cityParts.length - 1] : '';
  const city      = cityParts.length > 1 ? cityParts.slice(0, -1).join(' ') : appPro.city || '';

  return {
    id:          appPro.id,
    slug:        appPro.slug,
    name:        appPro.name,
    initials:    appPro.initials || appPro.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
    craft,
    category,
    city,
    district,
    rating,
    from,
    verified:    !!appPro.verified,
    founder:     !!appPro.founder,
    homeService: !!appPro.homeService,
    img,
    color,
    workDays,
    hours,
    availabilityByDay,
  };
}

/* ═══════════════════════════════════════════════════════════════════
   ROTATION ÉQUITABLE DES PROFESSIONNELS
   Structure de visibilité — préparée pour monétisation future :
     standard  → rotation équitable (actuel, tous les pros actifs)
     premium   → futur : apparaît 3× plus souvent (abonnement mensuel)
     spotlight → futur : épinglé en 1ère position (sponsorisé)
═══════════════════════════════════════════════════════════════════ */
function useProRotation(matchedPros, slotMaps, weekDays) {
  // Pool : tous les pros avec au moins 1 créneau disponible cette semaine
  const pool = useMemo(() => {
    const entries = [];
    for (const pro of matchedPros) {
      let found = null;
      outer: for (const day of weekDays) {
        const dk = toDateKey(day);
        const map = slotMaps[dk] || {};
        for (const t of TIME_SLOTS) {
          if ((map[t] || []).find(p => p.id === pro.id)) {
            found = { pro, dateKey: dk, time: t };
            break outer;
          }
        }
      }
      if (found) entries.push(found);
    }
    return entries;
  }, [matchedPros, slotMaps, weekDays]);

  // Mélange pseudo-aléatoire à chaque chargement (différent à chaque visite)
  const shuffledPool = useMemo(() => {
    if (pool.length === 0) return [];
    const arr = [...pool];
    // >>> 0 ensures unsigned 32-bit int — prevents negative j index from corrupting the array
    let seed = ((Date.now() ^ (Math.random() * 0xFFFFFF | 0)) >>> 0) % 999983;
    function rand() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [pool.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const [idx, setIdx] = useState(0);

  // Rotation automatique : intervalle aléatoire 10-15s
  useEffect(() => {
    if (shuffledPool.length <= 1) return;
    let timer;
    function schedule() {
      const delay = 10000 + Math.random() * 5000;
      timer = setTimeout(() => { setIdx(i => (i + 1) % shuffledPool.length); schedule(); }, delay);
    }
    schedule();
    return () => clearTimeout(timer);
  }, [shuffledPool]);

  const safeIdx = shuffledPool.length > 0 ? idx % shuffledPool.length : 0;
  const featured    = shuffledPool[safeIdx] ?? null;
  const sidebarSlots = shuffledPool.filter((_, i) => i !== safeIdx).slice(0, 4);

  return { featured, sidebarSlots };
}

/* ═══════════════════════════════════════════════════════════════════
   SMART CALENDAR HOME — FULL PREMIUM DARK
═══════════════════════════════════════════════════════════════════ */
function SmartCalendarHome({ compact = false }) {
  /* ── État (inchangé) ── */
  const [weekOffset, setWeekOffset]   = useState(0);
  const [search, setSearch]           = useState('');
  const [filters, setFilters]         = useState(new Set());
  const [booking, setBooking]         = useState(null);
  const [nearest, setNearest]         = useState(null);
  const [showSugg, setShowSugg]       = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [tooltip, setTooltip]         = useState(null); // { pros, dateKey, time, rect }
  const searchRef        = useRef(null);
  const tooltipHideTimer = useRef(null);

  const { pros: appPros, avgRating } = useApp();
  const basePros    = useMemo(
    () => appPros
      .filter(p => p.active !== false && !p.suspended)
      .map(p => appProToCalendarPro(p, avgRating(p.id))),
    [appPros], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const matchedPros = useMemo(() => filterPros(basePros, { query: search, filters }), [basePros, search, filters]);

  const weekStart = useMemo(() => getWeekStart(new Date(), weekOffset), [weekOffset]);
  const weekDays  = useMemo(() => getWeekDays(weekStart), [weekStart]);

  useEffect(() => {
    setSelectedDay(toDateKey(weekDays.find(d => toDateKey(d) >= todayKey) || weekDays[0]));
  }, [weekStart]);

  useEffect(() => { setNearest(findNearestSlot(matchedPros)); }, [matchedPros]);

  const [nowMin, setNowMin] = useState(() => {
    const n = new Date(); return n.getHours() * 60 + n.getMinutes();
  });
  useEffect(() => {
    const id = setInterval(() => {
      const n = new Date(); setNowMin(n.getHours() * 60 + n.getMinutes());
    }, 60000);
    return () => clearInterval(id);
  }, []);

  const slotMaps = useMemo(() =>
    weekDays.reduce((acc, day) => {
      acc[toDateKey(day)] = getSlotMap(toDateKey(day), matchedPros);
      return acc;
    }, {}),
  [weekDays, matchedPros]);

  /* ── Handlers (inchangés) ── */
  const toggleFilter = useCallback(key => {
    setFilters(prev => { const next = new Set(prev); next.has(key) ? next.delete(key) : next.add(key); return next; });
  }, []);

  const openBooking = useCallback((pro, dateKey, time, allPros) => {
    setBooking({ pro, dateKey, time, allPros: allPros || [pro] });
  }, []);

  const bookNearest = useCallback(() => {
    if (!nearest) return;
    const allAtSlot = (slotMaps[nearest.dateKey]?.[nearest.time]) || [nearest.pro];
    setBooking({ pro: nearest.pro, dateKey: nearest.dateKey, time: nearest.time, allPros: allAtSlot });
  }, [nearest, slotMaps]);

  const suggestions = useMemo(() =>
    search.length < 1
      ? SUGGESTIONS.slice(0, 8)
      : SUGGESTIONS.filter(s => s.toLowerCase().includes(search.toLowerCase())).slice(0, 6),
  [search]);

  /* ── Rotation équitable des pros (sidebar) ── */
  const { featured, sidebarSlots } = useProRotation(matchedPros, slotMaps, weekDays);

  const bookFeatured = useCallback(() => {
    if (!featured) return;
    const allAtSlot = (slotMaps[featured.dateKey]?.[featured.time]) || [featured.pro];
    setBooking({ pro: featured.pro, dateKey: featured.dateKey, time: featured.time, allPros: allAtSlot });
  }, [featured, slotMaps]);

  /* ─── Render ─────────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        @keyframes sc-ping {
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes sc-nowline {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
        @keyframes sc-nowpulse {
          0%,100% { box-shadow: 0 0 0 3px rgba(212,165,116,0.25), 0 0 10px rgba(212,165,116,0.5); }
          50%     { box-shadow: 0 0 0 6px rgba(212,165,116,0.1), 0 0 20px rgba(212,165,116,0.7); }
        }
        @keyframes sc-gold-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .sc-filter-chip:hover {
          background: rgba(212,165,116,0.12) !important;
          border-color: rgba(212,165,116,0.4) !important;
          color: ${LITE} !important;
        }
        .sc-week-btn:hover {
          background: rgba(255,255,255,0.08) !important;
          border-color: rgba(212,165,116,0.3) !important;
        }
        .sc-slot-row:hover .sc-time-label { color: ${BRNZ} !important; }
        .sc-sidebar-pro-card:hover {
          border-color: rgba(212,165,116,0.35) !important;
          background: rgba(212,165,116,0.07) !important;
        }
        .sc-day-col { min-width: 90px; }
        @media (max-width: 900px) {
          .sc-sidebar { display: none !important; }
          /* align-items:stretch = le calendrier occupe 100% de la largeur, pas son contenu */
          .sc-outer { flex-direction: column !important; align-items: stretch !important; width: 100% !important; max-width: 100% !important; }
        }
        @media (max-width: 768px) {
          .sc-desktop-grid { display: none !important; }
          /* min-width:0 neutralise le minWidth:720 inline si display:none échoue */
          .sc-grid-inner   { min-width: 0 !important; width: 100% !important; }
          .sc-mobile-view  { display: flex !important; }
          .sc-header-inner { padding: 10px 14px !important; }
          .sc-subtitle     { display: none !important; }
          .sc-search-section { padding: 8px 14px 0 !important; }
          /* Filtres : 2 lignes wrap, pas de scroll horizontal */
          .sc-filters-row  { flex-wrap: wrap !important; gap: 6px !important; padding-bottom: 8px !important; }
          .sc-filter-chip  { font-size: 10px !important; padding: 3px 9px !important; }
          .sc-filters-count { display: none !important; }
          /* Nav semaine : boutons empilés verticalement */
          .sc-week-nav    { flex-direction: column !important; align-items: stretch !important; gap: 6px !important; padding: 8px 14px !important; }
          .sc-week-center { order: -1 !important; text-align: center !important; font-size: 14px !important; }
          .sc-week-btn    { justify-content: center !important; font-size: 11px !important; padding: 6px 14px !important; }
          /* Jours : flex:1 = 7 pills partagent la largeur, aucun débordement */
          .sc-day-pills   { padding: 8px 14px !important; gap: 5px !important; overflow-x: visible !important; }
          .sc-day-pill    { flex: 1 !important; min-width: 0 !important; padding: 6px 4px !important; }
          .sc-day-pill-name { font-size: 8px !important; }
          .sc-day-pill-num  { font-size: 14px !important; }
          /* Créneaux */
          .sc-slot-list   { padding: 8px 14px !important; max-height: 280px !important; }
          .sc-slot-item   { padding: 7px 10px !important; border-radius: 10px !important; }
          .sc-slot-time   { font-size: 15px !important; min-width: 38px !important; }
          /* Bannière premier créneau */
          .sc-nearest-banner { padding: 10px 14px !important; gap: 10px !important; flex-wrap: wrap !important; }
          .sc-nearest-btn    { padding: 7px 14px !important; font-size: 12px !important; }
        }
        @media (min-width: 769px) {
          .sc-mobile-view { display: none !important; }
        }
        @media (max-width: 520px) {
          .sc-tz-badge   { display: none !important; }
          .sc-tz-sep     { display: none !important; }
          .sc-search-row { flex-direction: column !important; }
          .sc-flash-btn  { width: 100% !important; justify-content: center !important; }
        }
        @media (max-width: 380px) {
          .sc-clock-block  { scale: 0.9; }
          .sc-pros-counter { display: none !important; }
        }
      `}</style>

      {/* ── Outer layout: calendrier + sidebar ─────────────────── */}
      <div className="sc-outer" style={{ display: 'flex', gap: 18, alignItems: 'flex-start', width: '100%', maxWidth: '100%' }}>

        {/* ── Calendrier principal ─────────────────────────────── */}
        <div style={{
          flex: 1, minWidth: 0,
          background: BG,
          border: '1px solid rgba(212,165,116,0.14)',
          borderRadius: compact ? 16 : 24,
          overflow: 'hidden',
          boxShadow: compact ? 'none' : '0 0 0 1px #151208, 0 40px 80px rgba(0,0,0,0.55)',
        }}>

          {/* ── HEADER ────────────────────────────────────────── */}
          <div className="sc-header-inner" style={{
            background: CARD,
            borderBottom: `1px solid ${LINE}`,
            padding: '18px 26px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
              {/* Titre */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ height: 1, width: 20, background: `linear-gradient(90deg,${BRNZ},transparent)` }} />
                  <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: DEEP, fontFamily: 'Inter, sans-serif' }}>MatchAfro</span>
                </div>
                <h1 style={{ fontFamily: F, fontSize: 22, fontWeight: 600, color: INK, margin: 0, letterSpacing: '-0.04em', lineHeight: 1 }}>
                  Smart Calendar
                </h1>
                <p className="sc-subtitle" style={{ fontSize: 11, color: 'rgba(248,242,234,0.38)', margin: '4px 0 0', fontFamily: 'Inter, sans-serif' }}>
                  Trouvez le bon professionnel, au bon moment.
                </p>
              </div>

              {/* Stats temps réel */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {/* Horloge */}
                <div className="sc-clock-block" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${LINE}`, borderRadius: 12, padding: '7px 14px' }}>
                  <LiveClock />
                </div>

                {/* Séparateur */}
                <div className="sc-tz-sep" style={{ width: 1, height: 28, background: LINE, flexShrink: 0 }} />

                {/* Timezone */}
                <div className="sc-tz-badge" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${LINE}`, borderRadius: 999, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11 }}>📍</span>
                  <span style={{ fontSize: 10, color: 'rgba(248,242,234,0.45)', fontFamily: 'Inter, sans-serif', letterSpacing: '0.03em' }}>{getTz()}</span>
                </div>

                {/* Compteur pros */}
                <div className="sc-pros-counter" style={{ background: CRM, border: '1px solid rgba(212,165,116,0.22)', borderRadius: 999, padding: '5px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block', flexShrink: 0, boxShadow: '0 0 6px #22C55E80' }} />
                  <span style={{ fontFamily: F, fontSize: 16, fontWeight: 500, color: BRNZ, lineHeight: 1 }}>{matchedPros.length}</span>
                  <span style={{ fontSize: 10, color: 'rgba(212,165,116,0.7)', fontFamily: 'Inter, sans-serif' }}>disponibles</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── RECHERCHE + FILTRES ────────────────────────────── */}
          <div className="sc-search-section" style={{ padding: '14px 24px 0', borderBottom: `1px solid ${LINE}`, background: BG }}>

            {/* Search + ⚡ */}
            <div className="sc-search-row" style={{ display: 'flex', gap: 10, alignItems: 'stretch', marginBottom: 12 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  border: `1.5px solid ${showSugg || search ? 'rgba(212,165,116,0.55)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 14, padding: '10px 16px',
                  background: showSugg || search ? 'rgba(212,165,116,0.05)' : MIST,
                  transition: 'all 0.2s',
                  boxShadow: showSugg || search ? '0 0 0 3px rgba(212,165,116,0.08)' : 'none',
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ color: showSugg || search ? BRNZ : 'rgba(255,255,255,0.3)', flexShrink: 0, transition: 'color 0.2s' }}>
                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                    <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setShowSugg(true); }}
                    onFocus={() => setShowSugg(true)}
                    onBlur={() => setTimeout(() => setShowSugg(false), 150)}
                    placeholder="Nom, ville, arrondissement, catégorie…"
                    style={{
                      border: 'none', outline: 'none', flex: 1,
                      fontSize: 14, color: INK, background: 'transparent',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  />
                  {search && (
                    <button onClick={() => { setSearch(''); setShowSugg(false); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(248,242,234,0.3)', fontSize: 14, padding: 0, lineHeight: 1 }}>
                      ✕
                    </button>
                  )}
                </div>

                {/* Suggestions */}
                <AnimatePresence>
                  {showSugg && suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.16 }}
                      style={{
                        position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                        background: '#141210', border: '1px solid rgba(212,165,116,0.2)',
                        borderRadius: 14, boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
                        marginTop: 4, overflow: 'hidden',
                      }}
                    >
                      {suggestions.map(s => (
                        <button key={s}
                          onMouseDown={() => { setSearch(s); setShowSugg(false); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            width: '100%', textAlign: 'left',
                            padding: '9px 16px', border: 'none',
                            background: 'transparent', cursor: 'pointer',
                            fontSize: 13, color: 'rgba(248,242,234,0.7)',
                            fontFamily: 'Inter, sans-serif',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = CRM; e.currentTarget.style.color = INK; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(248,242,234,0.7)'; }}
                        >
                          <span style={{ color: BRNZ, fontSize: 10 }}>→</span>{s}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ⚡ Premier créneau */}
              <button
                className="sc-flash-btn"
                onClick={bookNearest}
                disabled={!nearest}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
                  borderRadius: 14, border: 'none', cursor: nearest ? 'pointer' : 'default',
                  background: nearest ? `linear-gradient(135deg, ${BRNZ}, ${DEEP})` : 'rgba(255,255,255,0.06)',
                  color: nearest ? '#0B0B0B' : 'rgba(255,255,255,0.2)',
                  fontSize: 13, fontWeight: 700, fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0,
                  boxShadow: nearest ? `0 6px 20px rgba(212,165,116,0.3)` : 'none',
                }}
                onMouseEnter={e => { if (nearest) e.currentTarget.style.opacity = '0.88'; }}
                onMouseLeave={e => { if (nearest) e.currentTarget.style.opacity = '1'; }}
              >
                <span style={{ fontSize: 14 }}>⚡</span>
                <span>Premier créneau</span>
              </button>
            </div>

            {/* Filtres */}
            <div className="sc-filters-row" style={{ display: 'flex', gap: 7, flexWrap: 'wrap', paddingBottom: 13, alignItems: 'center' }}>
              {QUICK_FILTERS.map(f => {
                const on = filters.has(f.key);
                return (
                  <button
                    key={f.key}
                    className="sc-filter-chip"
                    onClick={() => toggleFilter(f.key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '4px 13px', borderRadius: 999,
                      border: `1px solid ${on ? BRNZ : 'rgba(255,255,255,0.12)'}`,
                      background: on ? CRM : 'transparent',
                      color: on ? BRNZ : 'rgba(248,242,234,0.5)',
                      fontSize: 11, fontWeight: on ? 700 : 400,
                      cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                      transition: 'all 0.18s',
                      boxShadow: on ? `0 0 0 1px rgba(212,165,116,0.15)` : 'none',
                    }}
                  >
                    <span style={{ fontSize: 9, opacity: 0.8 }}>{f.icon}</span>
                    <span>{f.label}</span>
                  </button>
                );
              })}
              <span className="sc-filters-count" style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(248,242,234,0.28)', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Inter, sans-serif' }}>
                <span style={{ fontFamily: F, fontSize: 14, fontWeight: 500, color: 'rgba(212,165,116,0.7)' }}>{matchedPros.length}</span>
                professionnel{matchedPros.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* ── NAVIGATION SEMAINE ─────────────────────────────── */}
          <div className="sc-week-nav" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '11px 24px', borderBottom: `1px solid ${LINE}`,
            background: MIST, gap: 12,
          }}>
            <button className="sc-week-btn" onClick={() => setWeekOffset(o => o - 1)} style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
              padding: '6px 14px', cursor: 'pointer', fontSize: 12, color: 'rgba(248,242,234,0.6)',
              fontFamily: 'Inter, sans-serif', transition: 'all 0.18s', display: 'flex', alignItems: 'center', gap: 6,
            }}>← Sem. précédente</button>

            <span className="sc-week-center" style={{ fontFamily: F, fontSize: 16, fontWeight: 500, color: INK, letterSpacing: '-0.03em', textAlign: 'center', flexShrink: 1, minWidth: 0 }}>
              {weekDays[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              {' – '}
              {weekDays[6].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>

            <button className="sc-week-btn" onClick={() => setWeekOffset(o => o + 1)} style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
              padding: '6px 14px', cursor: 'pointer', fontSize: 12, color: 'rgba(248,242,234,0.6)',
              fontFamily: 'Inter, sans-serif', transition: 'all 0.18s', display: 'flex', alignItems: 'center', gap: 6,
            }}>Sem. suivante →</button>
          </div>

          {/* ── GRILLE DESKTOP ─────────────────────────────────── */}
          <div className="sc-desktop-grid" style={{ overflowX: 'auto', background: BG }}>
            <div className="sc-grid-inner" style={{ minWidth: 720 }}>

              {/* En-têtes jours */}
              <div style={{ display: 'grid', gridTemplateColumns: '56px repeat(7, 1fr)', borderBottom: `1px solid ${LINE}`, background: MIST }}>
                <div style={{ borderRight: `1px solid ${LINE}` }} />
                {weekDays.map(day => {
                  const dk = toDateKey(day);
                  const isToday = dk === todayKey;
                  const isPast  = dk < todayKey;
                  return (
                    <div key={dk} style={{
                      padding: '10px 6px', textAlign: 'center',
                      borderRight: `1px solid ${LINE}`,
                      background: isToday ? CRM : 'transparent',
                      opacity: isPast ? 0.35 : 1,
                      position: 'relative',
                    }}>
                      {isToday && (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${BRNZ}, ${LITE})` }} />
                      )}
                      <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: isToday ? BRNZ : 'rgba(248,242,234,0.35)', margin: 0, fontFamily: 'Inter, sans-serif' }}>
                        {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                      </p>
                      <p style={{ fontFamily: F, fontSize: 20, fontWeight: 500, color: isToday ? BRNZ : INK, letterSpacing: '-0.04em', margin: '2px 0 0', lineHeight: 1 }}>
                        {day.getDate()}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Lignes horaires */}
              <div style={{ maxHeight: 420, overflowY: 'auto' }}>
                {TIME_SLOTS.map(time => {
                  const tMin   = slotToMinutes(time);
                  const isNow  = Math.abs(tMin - nowMin) < 30 && weekOffset === 0;
                  const isPast = tMin < nowMin && weekOffset === 0;

                  return (
                    <div
                      key={time}
                      className="sc-slot-row"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '56px repeat(7, 1fr)',
                        background: isNow ? 'rgba(212,165,116,0.04)' : 'transparent',
                        position: 'relative',
                      }}
                    >
                      {/* Label heure */}
                      <div style={{
                        padding: '0 8px', height: 38,
                        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                        borderRight: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`,
                      }}>
                        <span className="sc-time-label" style={{
                          fontSize: 10, fontWeight: 500,
                          color: isNow ? BRNZ : 'rgba(248,242,234,0.22)',
                          transition: 'color 0.2s', fontFamily: "'IBM Plex Mono','Courier New',monospace",
                        }}>
                          {time}
                        </span>
                      </div>

                      {/* Cellules */}
                      {weekDays.map(day => {
                        const dk   = toDateKey(day);
                        const map  = slotMaps[dk] || {};
                        const pros = map[time] || [];
                        return (
                          <SlotCell
                            key={dk}
                            pros={isPast && dk === todayKey ? [] : pros}
                            dateKey={dk}
                            time={time}
                            isNowRow={isNow}
                            onBook={(p, d, t) => openBooking(p, d, t, map[t])}
                            onHover={(ps, dk, t, r) => {
                              clearTimeout(tooltipHideTimer.current);
                              setTooltip({ pros: ps, dateKey: dk, time: t, rect: r });
                            }}
                            onLeave={() => {
                              tooltipHideTimer.current = setTimeout(() => setTooltip(null), 160);
                            }}
                          />
                        );
                      })}

                      {/* Ligne "maintenant" */}
                      {isNow && (
                        <div style={{
                          position: 'absolute', left: 56, right: 0, height: 2,
                          background: `linear-gradient(90deg, ${BRNZ} 0%, rgba(212,165,116,0.4) 60%, transparent 100%)`,
                          top: '50%', pointerEvents: 'none', zIndex: 2,
                          animation: 'sc-nowline 2.5s ease-in-out infinite',
                        }}>
                          <div style={{
                            position: 'absolute', left: -6, top: -5,
                            width: 12, height: 12, borderRadius: '50%',
                            background: BRNZ,
                            animation: 'sc-nowpulse 2s ease-in-out infinite',
                          }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── MOBILE : sélecteur jour + liste créneaux ──────── */}
          <div className="sc-mobile-view" style={{ flexDirection: 'column', display: 'none' }}>
            {/* Pills jours */}
            <div className="sc-day-pills" style={{ display: 'flex', gap: 6, padding: '12px 18px', overflowX: 'auto', borderBottom: `1px solid ${LINE}`, background: MIST }}>
              {weekDays.map(day => {
                const dk = toDateKey(day);
                const active = dk === selectedDay;
                const isToday = dk === todayKey;
                const isPast = dk < todayKey;
                return (
                  <button key={dk} className="sc-day-pill" onClick={() => !isPast && setSelectedDay(dk)} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0,
                    padding: '8px 12px', borderRadius: 12, cursor: isPast ? 'default' : 'pointer',
                    border: `1.5px solid ${active ? BRNZ : 'rgba(255,255,255,0.1)'}`,
                    background: active ? CRM : 'transparent',
                    opacity: isPast ? 0.28 : 1, transition: 'all 0.2s',
                  }}>
                    <span className="sc-day-pill-name" style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: active ? BRNZ : 'rgba(248,242,234,0.38)', fontFamily: 'Inter, sans-serif' }}>
                      {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                    </span>
                    <span className="sc-day-pill-num" style={{ fontFamily: F, fontSize: 18, fontWeight: 500, color: active ? BRNZ : INK }}>
                      {day.getDate()}
                    </span>
                    {isToday && <span style={{ width: 4, height: 4, borderRadius: '50%', background: BRNZ, marginTop: 2 }} />}
                  </button>
                );
              })}
            </div>

            {/* Liste créneaux */}
            <div className="sc-slot-list" style={{ padding: '14px 18px', maxHeight: 360, overflowY: 'auto', background: BG }}>
              {selectedDay && (() => {
                const map = slotMaps[selectedDay] || {};
                const filledSlots = TIME_SLOTS.filter(t => (map[t] || []).length > 0);
                if (filledSlots.length === 0) {
                  return <p style={{ textAlign: 'center', color: 'rgba(248,242,234,0.25)', fontSize: 13, padding: '24px 0', fontFamily: 'Inter, sans-serif' }}>Aucun créneau disponible ce jour</p>;
                }
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {filledSlots.map(time => {
                      const pros = map[time];
                      return (
                        <button
                          key={time}
                          className="sc-slot-item"
                          onClick={() => openBooking(pros[0], selectedDay, time, pros)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14,
                            background: 'rgba(255,255,255,0.04)',
                            cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = CRM; e.currentTarget.style.borderColor = 'rgba(212,165,116,0.4)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                        >
                          <span className="sc-slot-time" style={{ fontFamily: F, fontSize: 18, fontWeight: 500, color: BRNZ, minWidth: 50 }}>{time}</span>
                          <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                            {pros.slice(0, 3).map(p => <ProPill key={p.id} pro={p} size={28} />)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {pros.length === 1
                              ? <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>{pros[0].name}</p>
                              : <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: 0, fontFamily: 'Inter, sans-serif' }}>{pros.length} professionnels</p>
                            }
                            <p style={{ fontSize: 11, color: DEEP, margin: 0, fontFamily: 'Inter, sans-serif' }}>
                              {pros.length === 1 ? `${pros[0].craft} · dès ${pros[0].from}€` : `dès ${Math.min(...pros.map(p => p.from))}€`}
                            </p>
                          </div>
                          <span style={{ color: 'rgba(212,165,116,0.4)', fontSize: 13 }}>→</span>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* ── BANNIÈRE PREMIER CRÉNEAU ───────────────────────── */}
          <AnimatePresence>
            {nearest && (
              <motion.div
                key="nearest"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="sc-nearest-banner"
                style={{
                  borderTop: `1px solid rgba(212,165,116,0.18)`,
                  padding: '16px 24px',
                  background: 'linear-gradient(135deg, #141210 0%, #0D0C09 50%, #141210 100%)',
                  display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
                }}
              >
                {/* Photo pro */}
                <div style={{ flexShrink: 0 }}>
                  {nearest.pro.img
                    ? <img src={nearest.pro.img} alt={nearest.pro.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: `2px solid rgba(212,165,116,0.45)`, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }} />
                    : <div style={{ width: 44, height: 44, borderRadius: '50%', background: nearest.pro.color || DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff', border: `2px solid rgba(212,165,116,0.45)`, fontFamily: 'Inter, sans-serif' }}>{nearest.pro.initials}</div>
                  }
                </div>

                {/* Infos */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(212,165,116,0.45)', margin: '0 0 3px', fontFamily: 'Inter, sans-serif' }}>
                    Premier créneau disponible
                  </p>
                  <p style={{ fontFamily: F, fontSize: 15, fontWeight: 500, color: INK, letterSpacing: '-0.03em', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span style={{ color: LITE }}>{nearest.pro.name}</span>
                    <span style={{ color: 'rgba(248,242,234,0.3)' }}> · </span>{nearest.pro.craft}
                    <span style={{ color: 'rgba(248,242,234,0.3)' }}> · </span>
                    <span style={{ color: BRNZ, fontFamily: "'IBM Plex Mono','Courier New',monospace", fontSize: 13 }}>{humanDate(nearest.dateKey)} à {nearest.time}</span>
                  </p>
                  <p style={{ fontSize: 11, color: 'rgba(248,242,234,0.35)', margin: '2px 0 0', fontFamily: 'Inter, sans-serif' }}>
                    {nearest.pro.city}{nearest.pro.district ? ` · ${nearest.pro.district}` : ''}
                    {nearest.pro.rating ? ` · ★ ${nearest.pro.rating.toFixed(2)}` : ''}
                    {nearest.pro.from ? ` · dès ${nearest.pro.from}€` : ''}
                  </p>
                </div>

                {/* CTA */}
                <button
                  className="sc-nearest-btn"
                  onClick={bookNearest}
                  style={{
                    padding: '9px 22px', borderRadius: 12,
                    background: `linear-gradient(135deg, ${BRNZ}, ${DEEP})`,
                    color: '#0B0B0B', border: 'none', cursor: 'pointer',
                    fontSize: 13, fontWeight: 800, fontFamily: 'Inter, sans-serif',
                    transition: 'all 0.2s', flexShrink: 0,
                    boxShadow: `0 6px 20px rgba(212,165,116,0.35)`,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}
                >
                  Réserver maintenant
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── SIDEBAR DROITE ───────────────────────────────────── */}
        <div className="sc-sidebar" style={{ width: 288, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Recommandation — rotation automatique équitable */}
          <AnimatePresence mode="wait">
            {featured && (
              <motion.div
                key={featured.pro.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: EASE }}
                style={{
                  background: 'linear-gradient(160deg, #141210 0%, #0C0A08 100%)',
                  border: '1px solid rgba(212,165,116,0.2)',
                  borderRadius: 20,
                  overflow: 'hidden',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                }}
              >
                {/* Badge */}
                <div style={{ padding: '12px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 13 }}>🔥</span>
                    <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: BRNZ, fontFamily: 'Inter, sans-serif' }}>Recommandation MatchAfro</span>
                  </div>
                  <span style={{ fontSize: 9, color: 'rgba(212,165,116,0.38)', fontFamily: 'Inter, sans-serif', letterSpacing: '0.04em' }}>En rotation</span>
                </div>

                {/* Photo */}
                <div style={{ margin: '12px 16px 0', borderRadius: 14, overflow: 'hidden', height: 128, position: 'relative' }}>
                  {featured.pro.img
                    ? <img src={featured.pro.img} alt={featured.pro.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    : <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${featured.pro.color || DEEP}, #0B0B0B)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 800, color: '#ffffff80', fontFamily: 'Inter, sans-serif' }}>{featured.pro.initials}</div>
                  }
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(8,6,4,0.9))' }} />
                  {featured.pro.verified && (
                    <span style={{ position: 'absolute', top: 8, right: 8, fontSize: 10, fontWeight: 700, color: BRNZ, background: 'rgba(0,0,0,0.75)', borderRadius: 999, padding: '2px 8px', border: '1px solid rgba(212,165,116,0.3)', fontFamily: 'Inter, sans-serif' }}>✓ Vérifié</span>
                  )}
                  {featured.pro.founder && (
                    <span style={{ position: 'absolute', top: 8, left: 8, fontSize: 10, fontWeight: 700, color: '#F59E0B', background: 'rgba(0,0,0,0.75)', borderRadius: 999, padding: '2px 8px', border: '1px solid rgba(245,158,11,0.3)', fontFamily: 'Inter, sans-serif' }}>★ Fondateur</span>
                  )}
                </div>

                {/* Infos */}
                <div style={{ padding: '12px 16px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 800, color: INK, margin: 0, fontFamily: 'Inter, sans-serif' }}>{featured.pro.name}</p>
                      <p style={{ fontSize: 11, color: 'rgba(212,165,116,0.8)', margin: '2px 0 0', fontFamily: 'Inter, sans-serif' }}>{featured.pro.craft}</p>
                    </div>
                    {featured.pro.rating && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: '3px 8px', flexShrink: 0 }}>
                        <span style={{ fontSize: 11, color: '#F59E0B' }}>★</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: INK, fontFamily: 'Inter, sans-serif' }}>{featured.pro.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* Ville + tags */}
                  <p style={{ fontSize: 11, color: 'rgba(248,242,234,0.4)', margin: '0 0 12px', fontFamily: 'Inter, sans-serif' }}>
                    📍 {featured.pro.city}{featured.pro.district ? `, ${featured.pro.district}` : ''}
                    {featured.pro.from ? ` · dès ${featured.pro.from}€` : ''}
                  </p>

                  {/* Disponibilité */}
                  <div style={{ background: 'rgba(212,165,116,0.08)', border: '1px solid rgba(212,165,116,0.15)', borderRadius: 10, padding: '8px 12px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: 9, color: 'rgba(248,242,234,0.35)', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Inter, sans-serif' }}>Disponible</p>
                      <p style={{ fontSize: 16, fontWeight: 800, color: BRNZ, margin: 0, fontFamily: "'IBM Plex Mono','Courier New',monospace" }}>{featured.time}</p>
                      <p style={{ fontSize: 10, color: 'rgba(248,242,234,0.4)', margin: '1px 0 0', fontFamily: 'Inter, sans-serif' }}>{humanDate(featured.dateKey)}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {featured.pro.homeService && (
                        <span style={{ fontSize: 9, color: '#86EFAC', background: 'rgba(134,239,172,0.1)', border: '1px solid rgba(134,239,172,0.2)', borderRadius: 6, padding: '2px 7px', fontWeight: 700, fontFamily: 'Inter, sans-serif', display: 'block', marginBottom: 4 }}>🏠 À domicile</span>
                      )}
                      <span style={{ fontSize: 9, color: '#93C5FD', fontFamily: 'Inter, sans-serif' }}>Réponse rapide</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={bookFeatured}
                    style={{
                      width: '100%', padding: '11px 0', borderRadius: 12,
                      background: `linear-gradient(135deg, ${BRNZ} 0%, ${DEEP} 100%)`,
                      color: '#0B0B0B', border: 'none', cursor: 'pointer',
                      fontSize: 14, fontWeight: 800, fontFamily: 'Inter, sans-serif',
                      boxShadow: `0 8px 24px rgba(212,165,116,0.35)`,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}
                  >
                    Réserver maintenant
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Autres disponibilités — rotation */}
          <AnimatePresence mode="wait">
            {sidebarSlots.length > 0 && (
              <motion.div
                key={sidebarSlots.map(s => s.pro.id).join('-')}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  background: 'linear-gradient(160deg, #141210 0%, #0C0A08 100%)',
                  border: `1px solid ${LINE}`,
                  borderRadius: 20,
                  overflow: 'hidden',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
                }}
              >
                <div style={{ padding: '14px 16px', borderBottom: `1px solid ${LINE}` }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(248,242,234,0.5)', textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0, fontFamily: 'Inter, sans-serif' }}>
                    Autres créneaux disponibles
                  </p>
                </div>
                <div style={{ padding: '8px 8px' }}>
                  {sidebarSlots.map(({ pro, dateKey, time }) => (
                    <div
                      key={pro.id}
                      className="sc-sidebar-pro-card"
                      onClick={() => {
                        const allAtSlot = (slotMaps[dateKey]?.[time]) || [pro];
                        openBooking(pro, dateKey, time, allAtSlot);
                      }}
                      role="button"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        width: '100%', padding: '10px 10px', borderRadius: 12,
                        border: '1px solid transparent', background: 'transparent',
                        cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s',
                      }}
                    >
                      {/* Photo */}
                      <div style={{ flexShrink: 0, position: 'relative' }}>
                        {pro.img
                          ? <img src={pro.img} alt={pro.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(212,165,116,0.3)' }} />
                          : <div style={{ width: 40, height: 40, borderRadius: '50%', background: pro.color || DEEP, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', border: '1.5px solid rgba(212,165,116,0.3)', fontFamily: 'Inter, sans-serif' }}>{pro.initials}</div>
                        }
                        {pro.verified && (
                          <span style={{ position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, background: BRNZ, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, color: '#0B0B0B', fontWeight: 900, border: '1.5px solid #0C0A08' }}>✓</span>
                        )}
                      </div>

                      {/* Infos */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: INK, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>{pro.name}</p>
                        <p style={{ fontSize: 10, color: 'rgba(212,165,116,0.65)', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>{pro.craft} · {pro.city}</p>
                      </div>

                      {/* Horaire + prix + lien profil */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontSize: 11, fontWeight: 800, color: BRNZ, margin: 0, fontFamily: "'IBM Plex Mono','Courier New',monospace" }}>
                          {humanDate(dateKey) === "Aujourd'hui" ? 'Auj.' : humanDate(dateKey).slice(0,3)} {time}
                        </p>
                        {pro.rating && (
                          <p style={{ fontSize: 9, color: 'rgba(248,242,234,0.35)', margin: '2px 0 0', fontFamily: 'Inter, sans-serif' }}>★ {pro.rating.toFixed(1)}</p>
                        )}
                        {pro.from && (
                          <p style={{ fontSize: 9, color: 'rgba(212,165,116,0.55)', margin: '1px 0 0', fontFamily: 'Inter, sans-serif' }}>{pro.from}€+</p>
                        )}
                        {pro.slug && (
                          <Link
                            to={`/pro/${pro.slug}`}
                            onClick={e => e.stopPropagation()}
                            style={{ fontSize: 9, fontWeight: 700, color: BRNZ, textDecoration: 'none', display: 'block', marginTop: 3, opacity: 0.7 }}
                            onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
                            onMouseLeave={e => { e.currentTarget.style.opacity = '0.7'; }}
                          >
                            Profil →
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Voir plus */}
                <div style={{ padding: '8px 16px 12px' }}>
                  <button
                    onClick={bookNearest}
                    style={{ width: '100%', padding: '9px', borderRadius: 10, border: '1px solid rgba(212,165,116,0.2)', background: CRM, color: BRNZ, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.18s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,165,116,0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = CRM; }}
                  >
                    Voir plus de disponibilités →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Tooltip fixe sur hover cellule ───────────────────────── */}
      <AnimatePresence>
        {tooltip && (
          <SlotTooltip
            key={tooltip.dateKey + tooltip.time}
            pros={tooltip.pros}
            dateKey={tooltip.dateKey}
            time={tooltip.time}
            rect={tooltip.rect}
            onEnter={() => clearTimeout(tooltipHideTimer.current)}
            onLeave={() => { tooltipHideTimer.current = setTimeout(() => setTooltip(null), 160); }}
          />
        )}
      </AnimatePresence>

      {/* ── Modal réservation ─────────────────────────────────────── */}
      <AnimatePresence>
        {booking && <BookingModal booking={booking} onClose={() => setBooking(null)} />}
      </AnimatePresence>
    </>
  );
}

/* ─── Export ─────────────────────────────────────────────────────── */
export default function SmartCalendar(props) {
  return <SmartCalendarRouter {...props} />;
}
