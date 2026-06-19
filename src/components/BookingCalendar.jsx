import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext.jsx';
import ClientLoginModal from './ClientLoginModal.jsx';
import { slotToMinutes, nowParisMinutes } from '../data/calendarData.js';

const DAYS   = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

function buildSlots(start, end) {
  const slots = [];
  let [h, m] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  while (h * 60 + m < eh * 60 + em) {
    slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
    m += 30;
    if (m >= 60) { h++; m = 0; }
  }
  return slots;
}

function fmt(y, m, d) {
  return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

function today() {
  const parisDt = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
  return fmt(parisDt.getFullYear(), parisDt.getMonth(), parisDt.getDate());
}

/**
 * BookingCalendar
 * Props:
 *   pro        : objet professionnel complet
 *   clientMode : true = cliente réserve, false = pro gère disponibilités
 *   onBook     : callback(bookingData) appelé à la confirmation
 */
export default function BookingCalendar({ pro, clientMode = true, onBook }) {
  const { isSlotTaken, book, updatePro, currentClient, updateClientProfile } = useApp();

  const now = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selDay,  setSelDay]   = useState(null);
  const [selSlot, setSelSlot]  = useState(null);
  const [selService, setSelService] = useState(pro.services?.[0]?.id ?? null);
  const [step, setStep] = useState('calendar'); // calendar | confirm | success

  /* Pré-remplissage depuis le compte client, modifiables */
  const [clientName,  setClientName]  = useState(currentClient?.name  || '');
  const [clientPhone, setClientPhone] = useState(currentClient?.phone || '');

  /* Modal connexion client (ouvert depuis la mur de login) */
  const [showClientLogin, setShowClientLogin] = useState(false);

  /* Tick toutes les 60s pour invalider les créneaux passés sans rechargement */
  const [minuteTick, setMinuteTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setMinuteTick(t => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  /* Sync async : currentClient peut arriver après le mount (Supabase auth) */
  useEffect(() => {
    if (currentClient) {
      setClientName(currentClient.name || '');
      setClientPhone(currentClient.phone || '');
    }
  }, [currentClient?.name, currentClient?.phone]);

  const firstDow     = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const availability = pro.availability ?? {};
  const blockedDates = pro.blockedDates ?? [];

  function isAvailable(day) {
    const dateStr = fmt(year, month, day);
    if (dateStr < today()) return false;
    if (blockedDates.includes(dateStr)) return false;
    const dow = (new Date(year, month, day).getDay() + 6) % 7 + 1;
    const rules = availability[dow] ?? [];
    if (!rules.length) return false;
    // Pour aujourd'hui : vérifier qu'au moins un créneau est encore futur
    if (dateStr === today()) {
      const nowMin = nowParisMinutes();
      return rules.flatMap(r => buildSlots(r.start, r.end))
                  .some(slot => slotToMinutes(slot) > nowMin + 20);
    }
    return true;
  }

  const slotsForDay = useMemo(() => {
    if (!selDay) return [];
    const [y, mo, d] = selDay.split('-').map(Number);
    const dow = (new Date(y, mo - 1, d).getDay() + 6) % 7 + 1;
    const rules = availability[dow] ?? [];
    const allSlots = rules.flatMap(r => buildSlots(r.start, r.end));
    // Filtrer les créneaux passés pour aujourd'hui (Europe/Paris)
    if (selDay === today()) {
      const nowMin = nowParisMinutes();
      return allSlots.filter(slot => slotToMinutes(slot) > nowMin + 20);
    }
    return allSlots;
  }, [selDay, availability, minuteTick]);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelDay(null); setSelSlot(null); setStep('calendar');
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelDay(null); setSelSlot(null); setStep('calendar');
  }

  function selectDay(d) {
    if (!isAvailable(d)) return;
    /* En mode client, bloquer si non connecté */
    if (clientMode && !currentClient) { setShowClientLogin(true); return; }
    setSelDay(fmt(year, month, d));
    setSelSlot(null);
    setStep('calendar');
  }

  function handleBook() {
    if (!selDay || !selSlot) return;
    if (clientMode && !currentClient) return;

    const name  = clientName.trim()  || currentClient?.name  || '';
    const phone = clientPhone.trim() || currentClient?.phone || '';
    if (!name || !phone) return;

    const service = pro.services?.find(s => s.id === selService);
    const booking = {
      proId:       pro.id,
      clientId:    currentClient?.email || null,
      clientName:  name,
      clientPhone: phone,
      clientEmail: currentClient?.email || '',
      service:     service?.name ?? '',
      serviceId:   selService,
      date:        selDay,
      startTime:   selSlot,
      endTime:     addMinutes(selSlot, service?.duration ?? 60),
    };

    if (currentClient && (name !== currentClient.name || phone !== currentClient.phone)) {
      updateClientProfile({ name, phone });
    }

    const saved = book(booking);
    onBook?.(saved);
    setStep('success');
  }

  function toggleBlockDate(dateStr) {
    const blocked = blockedDates.includes(dateStr)
      ? blockedDates.filter(d => d !== dateStr)
      : [...blockedDates, dateStr];
    updatePro(pro.id, { blockedDates: blocked });
  }

  const todayStr = today();
  const needsProfile = clientMode && currentClient && (!currentClient.name || !currentClient.phone);

  return (
    <>
      <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #F3F4F6', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

        {/* Header mois */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #F3F4F6' }}>
          <button onClick={prevMonth} style={navBtn} aria-label="Mois précédent">‹</button>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#0F0F0F' }} aria-live="polite">{MONTHS[month]} {year}</p>
          <button onClick={nextMonth} style={navBtn} aria-label="Mois suivant">›</button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap' }}>

          {/* Calendrier */}
          <div style={{ flex: '1 1 280px', padding: 16 }}>
            <div role="row" style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 8 }}>
              {DAYS.map(d => (
                <div key={d} role="columnheader"
                  style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#9CA3AF', padding: '4px 0' }}>{d}</div>
              ))}
            </div>
            <div role="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
              {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} role="gridcell" aria-hidden="true" />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
                const dateStr = fmt(year, month, d);
                const avail    = isAvailable(d);
                const selected = selDay === dateStr;
                const isToday  = dateStr === todayStr;
                const blocked  = blockedDates.includes(dateStr);
                const past     = dateStr < todayStr;

                return (
                  <button key={d} role="gridcell"
                    aria-pressed={selected}
                    aria-disabled={clientMode && (!avail || past)}
                    onClick={() => {
                      if (!clientMode && !past) { setSelDay(dateStr); toggleBlockDate(dateStr); return; }
                      selectDay(d);
                    }}
                    disabled={clientMode && (!avail || past)}
                    style={{
                      aspectRatio: '1', borderRadius: 10, border: 'none', cursor: avail || !clientMode ? 'pointer' : 'default',
                      background: selected ? '#D97706' : blocked ? '#1a1a1a' : avail ? '#FFFBEB' : 'transparent',
                      color: selected ? '#fff' : blocked ? '#fff' : avail ? '#92400E' : past ? '#D1D5DB' : '#374151',
                      fontSize: 13, fontWeight: selected ? 700 : isToday ? 700 : 400,
                      outline: isToday && !selected ? '2px solid #D97706' : 'none',
                      outlineOffset: -2, transition: 'all 0.15s',
                      position: 'relative', minWidth: 32, minHeight: 32,
                    }}>
                    {d}
                    {avail && !selected && !blocked && (
                      <span aria-hidden="true" style={{ position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: '#D97706' }} />
                    )}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 14, marginTop: 14, flexWrap: 'wrap' }}>
              {[
                { color: '#FFFBEB', border: '#FDE68A', text: 'Disponible' },
                { color: '#D97706', border: '#D97706', text: 'Sélectionné' },
                { color: '#1a1a1a', border: '#1a1a1a', text: clientMode ? 'Indisponible' : 'Bloqué' },
              ].map(l => (
                <div key={l.text} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color, border: `1px solid ${l.border}` }} />
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>{l.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Créneaux */}
          <AnimatePresence mode="wait">
            {selDay && (
              <motion.div key={selDay}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                style={{ flex: '1 1 200px', borderLeft: '1px solid #F3F4F6', padding: 16, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#0F0F0F', marginBottom: 12 }}>
                  {new Date(selDay + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>

                {slotsForDay.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#9CA3AF' }}>Aucun créneau disponible</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 6, maxHeight: 300, overflowY: 'auto' }}>
                    {slotsForDay.map(slot => {
                      const taken    = isSlotTaken(pro.id, selDay, slot);
                      const selected = selSlot === slot;
                      return (
                        <button key={slot} disabled={taken}
                          onClick={() => {
                            if (taken) return;
                            /* Bloquer si non connecté */
                            if (clientMode && !currentClient) { setShowClientLogin(true); return; }
                            setSelSlot(slot);
                            /* Pré-remplir depuis le compte client */
                            if (currentClient) {
                              setClientName(currentClient.name || '');
                              setClientPhone(currentClient.phone || '');
                            }
                            setStep('confirm');
                          }}
                          style={{
                            padding: '8px 6px', borderRadius: 9, fontSize: 12, fontWeight: 600,
                            border: `1.5px solid ${selected ? '#D97706' : taken ? '#F3F4F6' : '#E5E7EB'}`,
                            background: selected ? '#D97706' : taken ? '#F9FAFB' : '#fff',
                            color: selected ? '#fff' : taken ? '#D1D5DB' : '#374151',
                            cursor: taken ? 'default' : 'pointer',
                            transition: 'all 0.15s',
                            textDecoration: taken ? 'line-through' : 'none',
                            fontFamily: 'Inter, sans-serif',
                          }}>
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                )}

                {!clientMode && selDay && (
                  <button onClick={() => toggleBlockDate(selDay)}
                    style={{
                      marginTop: 14, width: '100%', padding: '8px', borderRadius: 10,
                      border: '1.5px solid #E5E7EB', background: '#F9FAFB',
                      fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif',
                    }}>
                    {blockedDates.includes(selDay) ? '🔓 Débloquer ce jour' : '🔒 Bloquer ce jour'}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Panel confirmation (mode client) ── */}
        <AnimatePresence>
          {clientMode && step === 'confirm' && selDay && selSlot && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={{ borderTop: '1px solid #F3F4F6', overflow: 'hidden' }}>
              <div style={{ padding: 20 }}>

                {/* Bandeau client connecté */}
                {currentClient && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#ECFDF5', border: '1px solid #6EE7B7', borderRadius: 10, padding: '8px 14px', marginBottom: 16 }}>
                    <span style={{ fontSize: 16 }}>✓</span>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#059669', margin: 0, fontFamily: 'Inter, sans-serif' }}>
                        Connecté en tant que client
                      </p>
                      <p style={{ fontSize: 11, color: '#6B7280', margin: 0, fontFamily: 'Inter, sans-serif' }}>{currentClient.email}</p>
                    </div>
                  </div>
                )}

                <p style={{ fontSize: 14, fontWeight: 700, color: '#0F0F0F', marginBottom: 14 }}>Vos informations</p>

                {/* Prestation */}
                {pro.services?.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <label htmlFor="booking-service" style={labelStyle}>Prestation</label>
                    <select id="booking-service" value={selService ?? ''} onChange={e => setSelService(e.target.value)} style={inputStyle}>
                      {pro.services.map(s => (
                        <option key={s.id} value={s.id}>{s.name} — {s.price}€ ({s.duration} min)</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Identité client */}
                {needsProfile ? (
                  /* Profil incomplet → saisir uniquement les champs manquants */
                  <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#92400E', margin: '0 0 4px', fontFamily: 'Inter, sans-serif' }}>
                      ✏️ Complétez votre profil pour réserver
                    </p>
                    <p style={{ fontSize: 11, color: '#92400E', margin: '0 0 10px', fontFamily: 'Inter, sans-serif' }}>
                      Ces informations seront sauvegardées pour vos prochaines réservations.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: !currentClient?.name && !currentClient?.phone ? '1fr 1fr' : '1fr', gap: 10 }}>
                      {!currentClient?.name && (
                        <div>
                          <label htmlFor="booking-name" style={labelStyle}>Votre prénom / nom *</label>
                          <input id="booking-name" value={clientName} onChange={e => setClientName(e.target.value)}
                            placeholder="Mariama Traoré" style={inputStyle} required />
                        </div>
                      )}
                      {!currentClient?.phone && (
                        <div>
                          <label htmlFor="booking-phone" style={labelStyle}>Téléphone *</label>
                          <input id="booking-phone" value={clientPhone} onChange={e => setClientPhone(e.target.value)}
                            placeholder="+33 6 xx xx xx xx" style={inputStyle} required />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Profil complet → badge identité, aucun champ de saisie */
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #D4A574, #A87E3C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {(currentClient.name || currentClient.email)?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#0F0F0F', margin: 0, fontFamily: 'Inter, sans-serif' }}>
                        {currentClient.name}
                      </p>
                      <p style={{ fontSize: 11, color: '#6B7280', margin: '2px 0 0', fontFamily: 'Inter, sans-serif' }}>
                        {currentClient.phone}{currentClient.phone && currentClient.email ? ' · ' : ''}{currentClient.email}
                      </p>
                    </div>
                  </div>
                )}

                {/* Récap */}
                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12, padding: '12px 14px', margin: '14px 0', fontSize: 13, color: '#92400E' }}>
                  <p style={{ fontWeight: 700, marginBottom: 4 }}>Récapitulatif</p>
                  <p>📅 {new Date(selDay + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p>🕐 {selSlot} — {pro.services?.find(s => s.id === selService)?.name}</p>
                  <p>👩‍🎨 {pro.name}{pro.city ? ` · ${pro.city}` : ''}</p>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setStep('calendar')} style={{ ...cancelBtn, flex: 1 }}>Annuler</button>
                  <button onClick={handleBook}
                    disabled={needsProfile ? (!clientName.trim() || !clientPhone.trim()) : false}
                    className="btn-primary"
                    style={{ flex: 2, borderRadius: 12, padding: '11px', fontSize: 14, opacity: (needsProfile && (!clientName.trim() || !clientPhone.trim())) ? 0.5 : 1 }}>
                    Confirmer la réservation
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {clientMode && step === 'success' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ borderTop: '1px solid #F3F4F6', padding: 28, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
              <p style={{ fontSize: 17, fontWeight: 700, color: '#059669', marginBottom: 6 }}>Réservation confirmée !</p>
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>
                {pro.name} a été notifié(e). Votre réservation est enregistrée dans votre espace client.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/mon-compte"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: '#0F0F0F', color: '#fff', borderRadius: 12,
                    padding: '11px 22px', fontSize: 13, fontWeight: 600, textDecoration: 'none',
                  }}>
                  Voir ma réservation →
                </Link>
                <button
                  onClick={() => { setStep('calendar'); setSelDay(null); setSelSlot(null); }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: '#F9FAFB', border: '1.5px solid #E5E7EB', color: '#374151',
                    borderRadius: 12, padding: '11px 22px', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  }}>
                  Nouvelle réservation
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal connexion client (déclenché depuis le calendrier) */}
      <AnimatePresence>
        {showClientLogin && (
          <ClientLoginModal
            onClose={() => setShowClientLogin(false)}
            onSwitchToPro={() => setShowClientLogin(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Styles inline ── */
const navBtn = {
  background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8,
  width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', fontSize: 18, color: '#374151', fontFamily: 'Inter, sans-serif',
};

const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 700, color: '#9CA3AF',
  textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 5,
};

const inputStyle = {
  width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 10,
  padding: '10px 12px', fontSize: 14, color: '#111', background: '#fff',
  fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

const cancelBtn = {
  background: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: 12,
  padding: '11px', fontSize: 14, fontWeight: 500, color: '#374151',
  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
};

function addMinutes(time, mins) {
  let [h, m] = time.split(':').map(Number);
  m += mins;
  h += Math.floor(m / 60);
  m = m % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}
