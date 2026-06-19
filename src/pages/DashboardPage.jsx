import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext.jsx';
import SmartCalendar from '../components/SmartCalendar.jsx';

const DAYS_OF_WEEK = [
  { id: 1, label: 'Lundi' }, { id: 2, label: 'Mardi' }, { id: 3, label: 'Mercredi' },
  { id: 4, label: 'Jeudi' }, { id: 5, label: 'Vendredi' }, { id: 6, label: 'Samedi' }, { id: 7, label: 'Dimanche' },
];

const DEFAULT_SLOT = { start: '09:00', end: '19:00' };

function StatCard({ icon, label, value, sub, color = '#D97706' }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: '#fff', borderRadius: 18, padding: '20px 22px', border: '1px solid #E5E7EB', flex: '1 1 160px' }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <p style={{ fontSize: 28, fontWeight: 900, color }}>{value}</p>
      <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginTop: 2 }}>{label}</p>
      {sub && <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{sub}</p>}
    </motion.div>
  );
}

/* ─── Section Disponibilités ─────────────────────── */
function AvailabilitySection({ pro }) {
  const { updatePro } = useApp();
  const [avail, setAvail] = useState(pro.availability ?? {});

  function toggle(dow) {
    if (avail[dow]) {
      const next = { ...avail };
      delete next[dow];
      setAvail(next);
      updatePro(pro.id, { availability: next });
    } else {
      const next = { ...avail, [dow]: [{ ...DEFAULT_SLOT }] };
      setAvail(next);
      updatePro(pro.id, { availability: next });
    }
  }

  function setTime(dow, field, value) {
    const next = { ...avail, [dow]: [{ ...(avail[dow]?.[0] ?? DEFAULT_SLOT), [field]: value }] };
    setAvail(next);
    updatePro(pro.id, { availability: next });
  }

  return (
    <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #E5E7EB', padding: 22, marginBottom: 16 }}>
      <p style={{ fontSize: 15, fontWeight: 800, color: '#0F0F0F', marginBottom: 16 }}>⏰ Horaires de disponibilité</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {DAYS_OF_WEEK.map(d => {
          const active = !!avail[d.id];
          return (
            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 110, cursor: 'pointer' }}>
                <input type="checkbox" checked={active} onChange={() => toggle(d.id)} style={{ width: 16, height: 16, accentColor: '#D97706' }} />
                <span style={{ fontSize: 13, fontWeight: active ? 700 : 400, color: active ? '#111' : '#9CA3AF' }}>{d.label}</span>
              </label>
              {active && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="time" value={avail[d.id]?.[0]?.start ?? '09:00'} onChange={e => setTime(d.id, 'start', e.target.value)} style={timeInput} />
                  <span style={{ fontSize: 12, color: '#9CA3AF' }}>→</span>
                  <input type="time" value={avail[d.id]?.[0]?.end ?? '19:00'} onChange={e => setTime(d.id, 'end', e.target.value)} style={timeInput} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Section Profil éditable ────────────────────── */
function ProfileEdit({ pro }) {
  const { updatePro } = useApp();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    description: pro.description ?? '',
    phone: pro.phone ?? '',
    whatsapp: pro.whatsapp ?? '',
    instagram: pro.instagram ?? '',
    homeService: pro.homeService ?? false,
    address: pro.address ?? '',
  });

  function save() {
    updatePro(pro.id, form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #E5E7EB', padding: 22, marginBottom: 16 }}>
      <p style={{ fontSize: 15, fontWeight: 800, color: '#0F0F0F', marginBottom: 16 }}>✏️ Modifier mon profil</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <LField label="Description" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} type="textarea" />
        <LField label="Téléphone" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} />
        <LField label="WhatsApp" value={form.whatsapp} onChange={v => setForm(f => ({ ...f, whatsapp: v }))} />
        <LField label="Instagram" value={form.instagram} onChange={v => setForm(f => ({ ...f, instagram: v }))} />
        <LField label="Adresse" value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
          <input type="checkbox" checked={form.homeService} onChange={e => setForm(f => ({ ...f, homeService: e.target.checked }))} style={{ width: 16, height: 16, accentColor: '#D97706' }} />
          Déplacements à domicile
        </label>
        <button onClick={save} className="btn-primary" style={{ borderRadius: 12, padding: '10px 20px', fontSize: 13, alignSelf: 'flex-start' }}>
          {saved ? '✓ Sauvegardé !' : 'Sauvegarder'}
        </button>
      </div>
    </div>
  );
}

function LField({ label, value, onChange, type = 'text' }) {
  const id = `lfield-${label.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;
  return (
    <div>
      <label htmlFor={id} style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }}>{label}</label>
      {type === 'textarea' ? (
        <textarea id={id} value={value} onChange={e => onChange(e.target.value)} rows={3} style={inputS} />
      ) : (
        <input id={id} value={value} onChange={e => onChange(e.target.value)} style={inputS} />
      )}
    </div>
  );
}

/* ─── Page Dashboard ─────────────────────────────── */
export default function DashboardPage() {
  const navigate = useNavigate();
  const { currentPro, bookings, getProReviews, avgRating, setCurrentPro } = useApp();

  const [section, setSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!currentPro) navigate('/devenir-professionnel');
  }, [currentPro]);

  if (!currentPro) return null;

  const pro = currentPro;
  const myBookings = (bookings || []).filter(b => b.proId === pro.id);
  const upcomingBookings = myBookings.filter(b => b.date >= new Date().toISOString().slice(0,10) && b.status !== 'cancelled');
  const reviews = getProReviews(pro.id);
  const rating  = avgRating(pro.id);

  const navItems = [
    { id: 'overview',      icon: '📊', label: 'Aperçu' },
    { id: 'calendar',      icon: '📅', label: 'Calendrier' },
    { id: 'availability',  icon: '⏰', label: 'Disponibilités' },
    { id: 'bookings',      icon: '🗓️',  label: 'Réservations' },
    { id: 'profile',       icon: '✏️',  label: 'Mon profil' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', flexDirection: 'column' }}>

      {/* Header dashboard */}
      <div style={{ background: '#0F0F0F', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/" style={{ color: '#D97706', fontWeight: 800, fontSize: 15, textDecoration: 'none' }}>MatchAfro</Link>
          <span style={{ color: '#444', fontSize: 16 }}>›</span>
          <span style={{ color: '#e0e0e0', fontSize: 14, fontWeight: 600 }}>Tableau de bord</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {pro.founder && <span style={{ background: '#D97706', color: '#fff', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }} className="hide-mobile">⭐ Fondateur #{pro.founderNumber}</span>}
          <Link to={`/pro/${pro.slug}`} style={{ color: '#9CA3AF', fontSize: 13, textDecoration: 'none' }} className="hide-mobile">Voir mon profil →</Link>
          <button onClick={() => { setCurrentPro(null); navigate('/'); }} style={{ background: 'none', border: '1px solid #333', color: '#9CA3AF', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            Déconnexion
          </button>
          <button onClick={() => setSidebarOpen(v => !v)} className="hide-desktop" aria-label={sidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={sidebarOpen} style={{ background: 'none', border: '1px solid #333', color: '#9CA3AF', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 16 }}>
            ☰
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50 }} className="hide-desktop">
            <nav aria-label="Navigation du tableau de bord" onClick={e => e.stopPropagation()} style={{ width: 220, height: '100%', background: '#fff', padding: '20px 0', boxShadow: '4px 0 20px rgba(0,0,0,0.1)' }}>
              {navItems.map(n => (
                <button key={n.id} onClick={() => { setSection(n.id); setSidebarOpen(false); }}
                  aria-current={section === n.id ? 'page' : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '14px 20px', border: 'none',
                    background: section === n.id ? '#FFFBEB' : 'transparent', borderLeft: `3px solid ${section === n.id ? '#D97706' : 'transparent'}`,
                    color: section === n.id ? '#92400E' : '#6B7280', fontWeight: section === n.id ? 700 : 400, fontSize: 14,
                    cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter, sans-serif',
                  }}>
                  {n.icon} {n.label}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Desktop sidebar */}
        <nav aria-label="Navigation du tableau de bord" className="hide-mobile" style={{ width: 200, background: '#fff', borderRight: '1px solid #E5E7EB', padding: '20px 0', flexShrink: 0 }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setSection(n.id)}
              aria-current={section === n.id ? 'page' : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 20px', border: 'none',
                background: section === n.id ? '#FFFBEB' : 'transparent', borderLeft: `3px solid ${section === n.id ? '#D97706' : 'transparent'}`,
                color: section === n.id ? '#92400E' : '#6B7280', fontWeight: section === n.id ? 700 : 400, fontSize: 13,
                cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
              }}>
              {n.icon} {n.label}
            </button>
          ))}
        </nav>

        {/* Mobile section tabs */}
        <div className="hide-desktop" style={{ display: 'none' }}></div>

        {/* Main */}
        <main style={{ flex: 1, padding: '24px 28px', overflowY: 'auto', minWidth: 0 }}>
          <AnimatePresence mode="wait">
            <motion.div key={section} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

              {section === 'overview' && (
                <>
                  <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0F0F0F', marginBottom: 6 }}>Bonjour, {pro.name.split(' ')[0]} 👋</h1>
                  <p style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 24 }}>Voici l'activité de votre profil.</p>
                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
                    <StatCard icon="👁️" label="Vues du profil"    value={pro.views ?? 0}          sub="depuis le début" />
                    <StatCard icon="📅" label="Réservations"       value={upcomingBookings.length}  sub="à venir"         color="#059669" />
                    <StatCard icon="⭐" label="Note moyenne"       value={rating.toFixed(1)}        sub={`${reviews.length} avis`} color="#F59E0B" />
                    <StatCard icon="💬" label="Avis clients"        value={reviews.length}           sub="total"           color="#7C3AED" />
                  </div>

                  {/* Prochaines réservations */}
                  <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #E5E7EB', padding: 22 }}>
                    <p style={{ fontSize: 14, fontWeight: 800, color: '#0F0F0F', marginBottom: 14 }}>Prochaines réservations</p>
                    {upcomingBookings.length === 0 ? (
                      <p style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', padding: '20px 0' }}>Aucune réservation à venir.</p>
                    ) : upcomingBookings.slice(0, 5).map(b => (
                      <BookingRow key={b.id} booking={b} />
                    ))}
                  </div>
                </>
              )}

              {section === 'calendar' && (
                <>
                  <h2 style={h2}>📅 Calendrier des réservations</h2>
                  <SmartCalendar mode="dashboard" compact />
                </>
              )}

              {section === 'availability' && (
                <>
                  <h2 style={h2}>⏰ Gestion des disponibilités</h2>
                  <AvailabilitySection pro={pro} />
                  <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12, padding: '12px 14px', fontSize: 12, color: '#92400E' }}>
                    💡 Cochez les jours où vous êtes disponible et définissez vos heures de début et de fin. Les clientes pourront réserver des créneaux de 30 minutes dans ces plages horaires.
                  </div>
                </>
              )}

              {section === 'bookings' && (
                <>
                  <h2 style={h2}>🗓️ Toutes les réservations</h2>
                  <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #E5E7EB', padding: 22 }}>
                    {myBookings.length === 0 ? (
                      <p style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', padding: '20px 0' }}>Aucune réservation pour le moment.</p>
                    ) : [...myBookings].sort((a, b) => b.date.localeCompare(a.date)).map(b => (
                      <BookingRow key={b.id} booking={b} />
                    ))}
                  </div>
                </>
              )}

              {section === 'profile' && (
                <>
                  <h2 style={h2}>✏️ Mon profil</h2>
                  <ProfileEdit pro={pro} />
                </>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function BookingRow({ booking }) {
  const [showContact, setShowContact] = useState(false);
  const isActive = booking.status !== 'cancelled';

  return (
    <div style={{ padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{booking.clientName}</p>
          <p style={{ fontSize: 12, color: '#9CA3AF' }}>{booking.service} · {booking.startTime}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
            {new Date(booking.date + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
          </p>
          {!isActive
            ? <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 700 }}>Annulé</span>
            : <span style={{ fontSize: 11, color: '#059669', fontWeight: 700 }}>Confirmé</span>
          }
          {isActive && (
            <button
              onClick={() => setShowContact(v => !v)}
              style={{ fontSize: 11, color: '#D97706', border: '1px solid #FDE68A', borderRadius: 6, padding: '3px 9px', background: showContact ? '#FEF3C7' : '#FFFBEB', cursor: 'pointer', fontWeight: 700, fontFamily: 'Inter, sans-serif', transition: 'background 0.15s' }}>
              {showContact ? '▲ Masquer' : '📞 Coordonnées'}
            </button>
          )}
        </div>
      </div>

      {showContact && isActive && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          style={{ marginTop: 8, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '10px 14px', overflow: 'hidden' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#065F46', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'Inter, sans-serif' }}>
            Coordonnées du client
          </p>
          {booking.clientPhone ? (
            <p style={{ fontSize: 13, color: '#065F46', fontFamily: 'Inter, sans-serif', marginBottom: 3 }}>
              📞{' '}
              <a href={`tel:${booking.clientPhone}`} style={{ color: '#059669', fontWeight: 600, textDecoration: 'none' }}>
                {booking.clientPhone}
              </a>
            </p>
          ) : null}
          {booking.clientEmail ? (
            <p style={{ fontSize: 13, color: '#065F46', fontFamily: 'Inter, sans-serif' }}>
              ✉️{' '}
              <a href={`mailto:${booking.clientEmail}`} style={{ color: '#059669', fontWeight: 600, textDecoration: 'none' }}>
                {booking.clientEmail}
              </a>
            </p>
          ) : null}
          {!booking.clientPhone && !booking.clientEmail && (
            <p style={{ fontSize: 12, color: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}>Aucune coordonnée disponible.</p>
          )}
        </motion.div>
      )}
    </div>
  );
}

const h2 = { fontSize: 20, fontWeight: 900, color: '#0F0F0F', marginBottom: 20 };
const timeInput = { border: '1.5px solid #E5E7EB', borderRadius: 8, padding: '6px 10px', fontSize: 13, fontFamily: 'Inter, sans-serif', color: '#111', background: '#F9FAFB' };
const inputS = { display: 'block', width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '10px 12px', fontSize: 14, color: '#111', background: '#fff', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', resize: 'vertical' };
