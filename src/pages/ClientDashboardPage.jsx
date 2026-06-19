import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext.jsx';

const F     = "'Fraunces', Georgia, serif";
const INK   = '#0B0B0C';
const BRONZE = '#A87E3C';
const DEEP  = '#8A6526';
const CREAM = '#FAF7F1';
const LINE  = '#E8E3DA';
const EASE  = [0.22, 1, 0.36, 1];

const STATUS_LABELS = {
  confirmed:   { label: 'Confirmé',    color: '#059669', bg: '#ECFDF5', border: '#6EE7B7' },
  scheduled:   { label: 'Planifié',    color: '#374151', bg: '#F9FAFB', border: '#E5E7EB' },
  pending:     { label: 'En attente',  color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  in_progress: { label: 'En cours',    color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  completed:   { label: 'Terminé',     color: '#059669', bg: '#ECFDF5', border: '#6EE7B7' },
  cancelled:   { label: 'Annulé',      color: '#9CA3AF', bg: '#F9FAFB', border: '#E5E7EB' },
  late:        { label: 'En retard',   color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  client_late: { label: 'Retard client', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
};

function BookingCard({ booking, pro }) {
  const s = STATUS_LABELS[booking.status] || STATUS_LABELS.confirmed;
  const dateLabel = new Date(booking.date + 'T12:00:00').toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      style={{
        background: '#fff', border: `1px solid ${LINE}`, borderRadius: 16,
        padding: '18px 20px', display: 'flex', gap: 16, alignItems: 'flex-start',
      }}
    >
      {/* Couleur pro */}
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: pro?.gradient || `linear-gradient(135deg, ${BRONZE}, ${DEEP})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 700, color: '#fff',
      }}>
        {pro?.initials || '?'}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: INK, margin: 0, fontFamily: 'Inter, sans-serif' }}>
              {booking.service}
            </p>
            <p style={{ fontSize: 13, color: 'rgba(11,11,12,0.55)', margin: '2px 0 0', fontFamily: 'Inter, sans-serif' }}>
              {pro?.name || '—'}{pro?.city ? ` · ${pro.city}` : ''}
            </p>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
            color: s.color, background: s.bg, border: `1px solid ${s.border}`,
            fontFamily: 'Inter, sans-serif', flexShrink: 0,
          }}>
            {s.label}
          </span>
        </div>

        <p style={{ fontSize: 12, color: 'rgba(11,11,12,0.45)', margin: '10px 0 0', fontFamily: 'Inter, sans-serif' }}>
          📅 {dateLabel} · {booking.startTime}
          {booking.endTime ? ` — ${booking.endTime}` : ''}
        </p>

        {pro?.slug && ['confirmed','scheduled','pending'].includes(booking.status) && (
          <Link to={`/pro/${pro.slug}`}
            style={{ display: 'inline-block', marginTop: 10, fontSize: 12, color: BRONZE, fontWeight: 600, textDecoration: 'none' }}>
            Voir le profil de {pro.name} →
          </Link>
        )}
      </div>
    </motion.div>
  );
}

export default function ClientDashboardPage() {
  const { currentClient, updateClientProfile, logoutClient, bookings, pros } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Mon compte | MatchAfro';
    return () => { document.title = 'MatchAfro — La beauté afro à portée de main'; };
  }, []);

  const [editMode,   setEditMode]   = useState(false);
  const [editName,   setEditName]   = useState(currentClient?.name  || '');
  const [editPhone,  setEditPhone]  = useState(currentClient?.phone || '');
  const [saveMsg,    setSaveMsg]    = useState('');

  if (!currentClient) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ textAlign: 'center', maxWidth: 440 }}>
          <p style={{ fontFamily: F, fontSize: 28, fontWeight: 500, color: INK, marginBottom: 12 }}>
            Vous n'êtes pas connecté
          </p>
          <p style={{ fontSize: 15, color: 'rgba(11,11,12,0.55)', marginBottom: 28 }}>
            Connectez-vous pour accéder à votre espace client et suivre vos réservations.
          </p>
          <Link to="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: INK, color: '#fff', padding: '12px 24px',
            borderRadius: 999, fontSize: 14, fontWeight: 500, textDecoration: 'none',
          }}>
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  /* Réservations de ce client (filtrées par email ou clientId) */
  const myBookings = bookings
    .filter(b => b.clientEmail === currentClient.email || b.clientId === currentClient.email)
    .sort((a, b) => b.date.localeCompare(a.date));

  const upcoming = myBookings.filter(b => !['completed','cancelled'].includes(b.status));
  const past     = myBookings.filter(b =>  ['completed','cancelled'].includes(b.status));

  function handleSaveProfile(e) {
    e.preventDefault();
    if (!editName.trim() || !editPhone.trim()) return;
    updateClientProfile({ name: editName.trim(), phone: editPhone.trim() });
    setEditMode(false);
    setSaveMsg('Profil mis à jour ✓');
    setTimeout(() => setSaveMsg(''), 3000);
  }

  function handleLogout() {
    logoutClient();
    navigate('/');
  }

  return (
    <div style={{ minHeight: '100vh', background: CREAM, paddingTop: 100 }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px 80px' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}
          style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span style={{ height: 1, width: 40, background: BRONZE, display: 'inline-block' }} />
            <span style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em', color: DEEP }}>
              Mon espace
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: F, fontSize: 'clamp(28px,4vw,42px)', fontWeight: 500, letterSpacing: '-0.04em', color: INK, margin: 0 }}>
              {currentClient.name ? `Bonjour, ${currentClient.name.split(' ')[0]}.` : 'Mon compte client'}
            </h1>
            <button onClick={handleLogout}
              style={{ background: 'none', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 999, padding: '8px 18px', fontSize: 13, fontWeight: 500, color: '#EF4444', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Se déconnecter
            </button>
          </div>
        </motion.div>

        {/* Carte profil */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
          style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 20, padding: '24px 28px', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: editMode ? 20 : 0, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: `linear-gradient(135deg, ${BRONZE}, ${DEEP})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}>
                {(currentClient.name || currentClient.email)?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: INK, margin: 0, fontFamily: 'Inter, sans-serif' }}>
                  {currentClient.name || <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Prénom non renseigné</span>}
                </p>
                <p style={{ fontSize: 13, color: 'rgba(11,11,12,0.45)', margin: '2px 0 0', fontFamily: 'Inter, sans-serif' }}>
                  {currentClient.email}
                  {currentClient.phone ? ` · ${currentClient.phone}` : ''}
                </p>
              </div>
            </div>
            {!editMode && (
              <button onClick={() => { setEditName(currentClient.name || ''); setEditPhone(currentClient.phone || ''); setEditMode(true); }}
                style={{ background: 'none', border: `1px solid ${LINE}`, borderRadius: 10, padding: '7px 16px', fontSize: 13, color: INK, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                Modifier
              </button>
            )}
          </div>

          {saveMsg && (
            <p style={{ fontSize: 13, color: '#059669', fontFamily: 'Inter, sans-serif', margin: '8px 0 0', fontWeight: 600 }}>
              {saveMsg}
            </p>
          )}

          {editMode && (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Prénom / Nom *</label>
                  <input value={editName} onChange={e => setEditName(e.target.value)}
                    placeholder="Mariama Traoré" required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Téléphone *</label>
                  <input value={editPhone} onChange={e => setEditPhone(e.target.value)}
                    placeholder="+33 6 xx xx xx xx" required style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setEditMode(false)}
                  style={{ flex: 1, background: '#F9FAFB', border: `1px solid ${LINE}`, borderRadius: 10, padding: '10px', fontSize: 14, color: INK, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  Annuler
                </button>
                <button type="submit" disabled={!editName.trim() || !editPhone.trim()}
                  className="btn-primary"
                  style={{ flex: 2, borderRadius: 10, padding: '10px', fontSize: 14, opacity: (!editName.trim() || !editPhone.trim()) ? 0.5 : 1 }}>
                  Enregistrer
                </button>
              </div>
            </form>
          )}
        </motion.div>

        {/* Réservations à venir */}
        <Section title="Réservations à venir" count={upcoming.length} delay={0.2}>
          {upcoming.length === 0 ? (
            <EmptyState
              message="Aucune réservation à venir"
              cta="Trouver un professionnel"
              href="/#calendrier"
            />
          ) : (
            upcoming.map(b => (
              <BookingCard key={b.id} booking={b} pro={pros.find(p => p.id === b.proId)} />
            ))
          )}
        </Section>

        {/* Historique */}
        {past.length > 0 && (
          <Section title="Historique" count={past.length} delay={0.3}>
            {past.map(b => (
              <BookingCard key={b.id} booking={b} pro={pros.find(p => p.id === b.proId)} />
            ))}
          </Section>
        )}

      </div>
    </div>
  );
}

/* ── Sous-composants ── */
function Section({ title, count, delay, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay }}
      style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <h2 style={{ fontFamily: F, fontSize: 22, fontWeight: 500, color: INK, margin: 0, letterSpacing: '-0.03em' }}>
          {title}
        </h2>
        {count > 0 && (
          <span style={{ fontSize: 12, fontWeight: 700, background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A', borderRadius: 20, padding: '2px 9px', fontFamily: 'Inter, sans-serif' }}>
            {count}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {children}
      </div>
    </motion.div>
  );
}

function EmptyState({ message, cta, href }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 16, padding: '32px 24px', textAlign: 'center' }}>
      <p style={{ fontSize: 15, color: 'rgba(11,11,12,0.45)', fontFamily: 'Inter, sans-serif', marginBottom: 16 }}>{message}</p>
      <a href={href} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: INK, color: '#fff', borderRadius: 999,
        padding: '10px 20px', fontSize: 13, fontWeight: 500, textDecoration: 'none',
      }}>
        {cta} →
      </a>
    </div>
  );
}

const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 700, color: '#9CA3AF',
  textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 5,
  fontFamily: 'Inter, sans-serif',
};

const inputStyle = {
  width: '100%', border: `1.5px solid ${LINE}`, borderRadius: 10,
  padding: '10px 12px', fontSize: 14, color: INK, background: '#fff',
  fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};
