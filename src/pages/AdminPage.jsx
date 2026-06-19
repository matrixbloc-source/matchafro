import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext.jsx';

/* ─── Utilitaires ───────────────────────────────────────────────── */
function Badge({ children, color, bg }) {
  return (
    <span style={{ background: bg, color, borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 700, border: `1px solid ${color}33`, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
      {children}
    </span>
  );
}

function StatBox({ icon, label, value, color = '#D97706', sub }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: '18px 20px', flex: '1 1 130px', textAlign: 'center' }}>
      <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
      <p style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, marginTop: 4 }}>{label}</p>
      {sub && <p style={{ fontSize: 10, color: '#D1D5DB', marginTop: 2 }}>{sub}</p>}
    </div>
  );
}

function ActionBtn({ onClick, color = '#374151', children }) {
  return (
    <button onClick={onClick} style={{ background: 'none', border: `1px solid ${color}`, color, borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
      {children}
    </button>
  );
}

function formatDate(isoStr) {
  if (!isoStr) return '—';
  return new Date(isoStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function timeAgo(isoStr) {
  if (!isoStr) return '';
  const diff = Date.now() - new Date(isoStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1)  return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24)   return `il y a ${h}h`;
  const d = Math.floor(h / 24);
  return `il y a ${d}j`;
}

/* ─── Écran de connexion ─────────────────────────────────────────── */
function AdminLogin() {
  const { loginAdmin } = useApp();
  const [pwd,   setPwd]   = useState('');
  const [error, setError] = useState('');

  function tryLogin() {
    if (!loginAdmin(pwd)) setError('Mot de passe incorrect');
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ background: '#1a1a1a', borderRadius: 24, padding: 40, width: '100%', maxWidth: 400, textAlign: 'center', border: '1px solid #2d2d2d' }}
      >
        <div style={{ fontSize: 44, marginBottom: 16 }}>🔐</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Accès Admin</h2>
        <p style={{ color: '#666', fontSize: 13, marginBottom: 24 }}>Réservé à l'équipe MatchAfro</p>
        <input
          type="password"
          value={pwd}
          onChange={e => { setPwd(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && tryLogin()}
          placeholder="Mot de passe admin"
          autoFocus
          style={{ display: 'block', width: '100%', border: '1.5px solid #333', borderRadius: 12, padding: '12px 16px', fontSize: 14, background: '#111', color: '#fff', outline: 'none', marginBottom: 12, boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}
        />
        {error && <p style={{ color: '#EF4444', fontSize: 12, marginBottom: 10 }}>{error}</p>}
        <button
          onClick={tryLogin}
          style={{ width: '100%', background: '#D97706', color: '#fff', border: 'none', borderRadius: 12, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
        >
          Connexion
        </button>
        <Link to="/" style={{ display: 'block', marginTop: 16, color: '#555', fontSize: 12, textDecoration: 'none' }}>
          ← Retour à l'accueil
        </Link>
      </motion.div>
    </div>
  );
}

/* ─── Panneau admin ──────────────────────────────────────────────── */
function AdminPanel() {
  const {
    pros, bookings,
    verifyPro, suspendPro, reactivatePro, grantFounder,
    founderCount, founderLimit,
    adminNotifications, clearAdminNotif, clearAllAdminNotifs, unreadAdminCount,
  } = useApp();

  const [section, setSection] = useState('stats');
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('all');

  /* ── Stats ── */
  const todayStr = new Date().toISOString().slice(0, 10);
  const monthStr = new Date().toISOString().slice(0, 7);

  const totalPros      = pros.length;
  const verifiedPros   = pros.filter(p => p.verified).length;
  const founderPros    = pros.filter(p => p.founder).length;
  const suspendedPros  = pros.filter(p => p.suspended).length;
  const activePros     = pros.filter(p => p.active && !p.suspended).length;
  const totalBookings  = (bookings || []).length;
  const todayBookings  = (bookings || []).filter(b => b.date === todayStr && b.status !== 'cancelled').length;
  const monthBookings  = (bookings || []).filter(b => (b.date || '').startsWith(monthStr) && b.status !== 'cancelled').length;
  const uniqueClients  = new Set((bookings || []).map(b => b.clientEmail || b.clientPhone || b.clientName).filter(Boolean)).size;

  /* ── Pros filtrés ── */
  const filteredPros = useMemo(() => {
    let list = [...pros];
    if (filter === 'verified')  list = list.filter(p => p.verified && !p.suspended);
    if (filter === 'founder')   list = list.filter(p => p.founder);
    if (filter === 'suspended') list = list.filter(p => p.suspended);
    if (filter === 'pending')   list = list.filter(p => !p.verified && !p.suspended);
    if (filter === 'active')    list = list.filter(p => p.active && !p.suspended);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.city  || '').toLowerCase().includes(q) ||
        (p.email || '').toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [pros, filter, search]);

  const navItems = [
    { id: 'stats',     label: '📊 Statistiques' },
    { id: 'pros',      label: '👩‍🎨 Professionnels' },
    { id: 'bookings',  label: '📅 Réservations' },
    { id: 'founders',  label: '⭐ Fondateurs' },
    { id: 'notifs',    label: '🔔 Notifications', badge: unreadAdminCount },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ background: '#0F0F0F', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to="/" style={{ color: '#D97706', fontWeight: 800, fontSize: 15, textDecoration: 'none' }}>MatchAfro</Link>
          <span style={{ color: '#444' }}>›</span>
          <span style={{ color: '#e0e0e0', fontSize: 14, fontWeight: 600 }}>Dashboard Admin</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {unreadAdminCount > 0 && (
            <span style={{ background: '#EF4444', color: '#fff', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
              🔔 {unreadAdminCount} nouvelle{unreadAdminCount > 1 ? 's' : ''}
            </span>
          )}
          <span style={{ background: '#EF4444', color: '#fff', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>🔴 Mode Admin</span>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>

        {/* Sidebar */}
        <nav style={{ width: 220, background: '#fff', borderRight: '1px solid #E5E7EB', padding: '20px 0', flexShrink: 0 }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setSection(n.id)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, width: '100%', padding: '12px 20px',
              border: 'none', background: section === n.id ? '#FEF2F2' : 'transparent',
              borderLeft: `3px solid ${section === n.id ? '#EF4444' : 'transparent'}`,
              color: section === n.id ? '#B91C1C' : '#6B7280',
              fontWeight: section === n.id ? 700 : 400,
              fontSize: 13, cursor: 'pointer', textAlign: 'left',
              fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
            }}>
              <span>{n.label}</span>
              {n.badge > 0 && (
                <span style={{ background: '#EF4444', color: '#fff', borderRadius: 99, minWidth: 18, height: 18, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
                  {n.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Contenu principal */}
        <main style={{ flex: 1, padding: '24px 28px', overflowY: 'auto', minWidth: 0 }}>
          <AnimatePresence mode="wait">
            <motion.div key={section} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

              {/* ── Statistiques ── */}
              {section === 'stats' && (
                <>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F0F0F', marginBottom: 20 }}>Vue d'ensemble</h2>

                  <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Professionnels</p>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
                    <StatBox icon="👩‍🎨" label="Pros inscrits"  value={totalPros}     color="#374151" />
                    <StatBox icon="✅"   label="Vérifiés"        value={verifiedPros}  color="#059669" />
                    <StatBox icon="🟢"   label="Actifs"          value={activePros}    color="#0891B2" />
                    <StatBox icon="⭐"   label="Fondateurs"      value={founderPros}   color="#D97706" sub={`${founderLimit - founderCount} places restantes`} />
                    <StatBox icon="🚫"   label="Suspendus"       value={suspendedPros} color="#EF4444" />
                  </div>

                  <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Activité</p>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
                    <StatBox icon="📅"  label="Réservations totales" value={totalBookings} color="#7C3AED" />
                    <StatBox icon="📆"  label="Aujourd'hui"          value={todayBookings} color="#D97706" />
                    <StatBox icon="🗓️" label="Ce mois"              value={monthBookings} color="#059669" />
                    <StatBox icon="👤"  label="Clients uniques"      value={uniqueClients} color="#374151" />
                  </div>

                  {/* Programme fondateur */}
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Programme Fondateur</p>
                  <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #FDE68A', padding: '20px 24px', marginBottom: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 800, color: '#0F0F0F' }}>⭐ {founderCount} / {founderLimit} places utilisées</p>
                        <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{founderLimit - founderCount} places fondateur encore disponibles</p>
                      </div>
                      <div style={{ fontSize: 28, fontWeight: 900, color: founderCount >= founderLimit ? '#EF4444' : '#D97706' }}>
                        {Math.round((founderCount / founderLimit) * 100)}%
                      </div>
                    </div>
                    <div style={{ background: '#E5E7EB', borderRadius: 99, height: 12 }}>
                      <div style={{ width: `${(founderCount / founderLimit) * 100}%`, background: 'linear-gradient(90deg,#D97706,#F59E0B)', height: '100%', borderRadius: 99, transition: 'width 0.5s' }} />
                    </div>
                  </div>

                  {/* Activité récente condensée */}
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Réservations récentes</p>
                  <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                    {[...(bookings || [])].sort((a, b) => b.createdAt?.localeCompare(a.createdAt)).slice(0, 5).map((b, i, arr) => {
                      const pro = pros.find(p => p.id === b.proId);
                      return (
                        <div key={b.id} style={{ padding: '12px 18px', borderBottom: i < arr.length - 1 ? '1px solid #F3F4F6' : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{b.clientName} → {pro?.name || '—'}</p>
                            <p style={{ fontSize: 11, color: '#9CA3AF' }}>{b.service} · {formatDate(b.date)}</p>
                          </div>
                          <Badge color={b.status === 'cancelled' ? '#EF4444' : '#059669'} bg={b.status === 'cancelled' ? '#FEF2F2' : '#ECFDF5'}>
                            {b.status === 'cancelled' ? 'Annulé' : 'Confirmé'}
                          </Badge>
                        </div>
                      );
                    })}
                    {(bookings || []).length === 0 && (
                      <p style={{ textAlign: 'center', padding: 28, color: '#9CA3AF', fontSize: 13 }}>Aucune réservation.</p>
                    )}
                  </div>
                </>
              )}

              {/* ── Professionnels ── */}
              {section === 'pros' && (
                <>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F0F0F', flex: 1, minWidth: 180 }}>
                      Professionnels ({filteredPros.length})
                    </h2>
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="🔍 Rechercher..."
                      style={S.searchInput}
                    />
                    <select value={filter} onChange={e => setFilter(e.target.value)} style={S.select}>
                      <option value="all">Tous</option>
                      <option value="pending">En attente</option>
                      <option value="active">Actifs</option>
                      <option value="verified">Vérifiés</option>
                      <option value="founder">Fondateurs</option>
                      <option value="suspended">Suspendus</option>
                    </select>
                  </div>

                  <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 800 }}>
                        <thead>
                          <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                            {['Professionnel', 'Ville', 'Catégories', 'Inscription', 'Statut', 'Actions'].map(h => (
                              <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPros.map((pro, i) => (
                            <tr
                              key={pro.id}
                              style={{ borderBottom: i < filteredPros.length - 1 ? '1px solid #F3F4F6' : 'none', transition: 'background 0.1s' }}
                              onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <div style={{ width: 34, height: 34, borderRadius: 10, background: pro.gradient || '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                                    {pro.initials || pro.name?.[0]}
                                  </div>
                                  <div>
                                    <Link to={`/pro/${pro.slug}`} style={{ fontWeight: 700, color: '#0F0F0F', textDecoration: 'none', fontSize: 13 }}>{pro.name}</Link>
                                    <p style={{ fontSize: 11, color: '#9CA3AF' }}>{pro.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '12px 16px', color: '#6B7280' }}>{pro.city || '—'}</td>
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                  {(pro.categories || []).slice(0, 2).map(c => (
                                    <span key={c} style={{ background: '#F3F4F6', color: '#374151', borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 600 }}>{c}</span>
                                  ))}
                                  {(pro.categories || []).length > 2 && (
                                    <span style={{ fontSize: 10, color: '#9CA3AF' }}>+{(pro.categories || []).length - 2}</span>
                                  )}
                                </div>
                              </td>
                              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                                <p style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>{formatDate(pro.createdAt)}</p>
                              </td>
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                  {pro.active && !pro.suspended && <Badge color="#0891B2" bg="#EFF6FF">🟢 Actif</Badge>}
                                  {!pro.active && !pro.suspended && <Badge color="#9CA3AF" bg="#F9FAFB">⚪ Inactif</Badge>}
                                  {pro.verified  && <Badge color="#059669" bg="#ECFDF5">✓ Vérifié</Badge>}
                                  {pro.founder   && <Badge color="#D97706" bg="#FFFBEB">⭐ #{pro.founderNumber}</Badge>}
                                  {pro.suspended && <Badge color="#EF4444" bg="#FEF2F2">🚫 Suspendu</Badge>}
                                  {!pro.verified && !pro.suspended && <Badge color="#9CA3AF" bg="#F9FAFB">En attente</Badge>}
                                </div>
                              </td>
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                  {!pro.verified && !pro.suspended && (
                                    <ActionBtn onClick={() => verifyPro(pro.id)} color="#059669">✓ Vérifier</ActionBtn>
                                  )}
                                  {!pro.founder && founderCount < founderLimit && (
                                    <ActionBtn onClick={() => grantFounder(pro.id)} color="#D97706">⭐ Fondateur</ActionBtn>
                                  )}
                                  {!pro.suspended
                                    ? <ActionBtn onClick={() => suspendPro(pro.id)}    color="#EF4444">🚫 Suspendre</ActionBtn>
                                    : <ActionBtn onClick={() => reactivatePro(pro.id)} color="#7C3AED">↩️ Réactiver</ActionBtn>
                                  }
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {filteredPros.length === 0 && (
                      <p style={{ textAlign: 'center', padding: '28px', color: '#9CA3AF', fontSize: 13 }}>Aucun professionnel trouvé.</p>
                    )}
                  </div>
                </>
              )}

              {/* ── Réservations ── */}
              {section === 'bookings' && (
                <>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F0F0F', flex: 1 }}>
                      Réservations ({(bookings || []).length})
                    </h2>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <div style={{ background: '#ECFDF5', color: '#059669', borderRadius: 10, padding: '6px 12px', fontSize: 12, fontWeight: 700 }}>Aujourd'hui : {todayBookings}</div>
                      <div style={{ background: '#EFF6FF', color: '#0891B2', borderRadius: 10, padding: '6px 12px', fontSize: 12, fontWeight: 700 }}>Ce mois : {monthBookings}</div>
                    </div>
                  </div>
                  <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 700 }}>
                        <thead>
                          <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                            {['Cliente', 'Professionnel', 'Prestation', 'Date RDV', 'Réservé le', 'Statut'].map(h => (
                              <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[...(bookings || [])].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).map((b, i, arr) => {
                            const pro = pros.find(p => p.id === b.proId);
                            const isCancelled = b.status === 'cancelled';
                            const isToday = b.date === todayStr;
                            return (
                              <tr key={b.id} style={{ borderBottom: i < arr.length - 1 ? '1px solid #F3F4F6' : 'none', background: isToday ? '#FFFBEB' : 'transparent' }}>
                                <td style={{ padding: '12px 16px' }}>
                                  <p style={{ fontWeight: 600, color: '#111' }}>{b.clientName}</p>
                                  <p style={{ fontSize: 11, color: '#9CA3AF' }}>{b.clientPhone}</p>
                                </td>
                                <td style={{ padding: '12px 16px', color: '#374151' }}>{pro?.name ?? '—'}</td>
                                <td style={{ padding: '12px 16px', color: '#374151' }}>{b.service}</td>
                                <td style={{ padding: '12px 16px' }}>
                                  <p style={{ fontWeight: 600, color: '#111' }}>
                                    {new Date(b.date + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    {isToday && <span style={{ marginLeft: 6, fontSize: 10, background: '#D97706', color: '#fff', borderRadius: 4, padding: '1px 5px' }}>Aujourd'hui</span>}
                                  </p>
                                  <p style={{ fontSize: 11, color: '#9CA3AF' }}>{b.startTime} → {b.endTime}</p>
                                </td>
                                <td style={{ padding: '12px 16px' }}>
                                  <p style={{ fontSize: 12, color: '#6B7280' }}>{formatDate(b.createdAt)}</p>
                                </td>
                                <td style={{ padding: '12px 16px' }}>
                                  {isCancelled
                                    ? <Badge color="#EF4444" bg="#FEF2F2">Annulé</Badge>
                                    : <Badge color="#059669" bg="#ECFDF5">Confirmé</Badge>}
                                </td>
                              </tr>
                            );
                          })}
                          {(bookings || []).length === 0 && (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: 28, color: '#9CA3AF' }}>Aucune réservation.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* ── Fondateurs ── */}
              {section === 'founders' && (
                <>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F0F0F', marginBottom: 8 }}>⭐ Gestion des Fondateurs</h2>
                  <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 20 }}>
                    {founderCount} / {founderLimit} places utilisées · {founderLimit - founderCount} restantes
                  </p>

                  <div style={{ background: '#E5E7EB', borderRadius: 99, height: 10, marginBottom: 28 }}>
                    <div style={{ width: `${(founderCount / founderLimit) * 100}%`, background: 'linear-gradient(90deg,#D97706,#F59E0B)', height: '100%', borderRadius: 99, transition: 'width 0.5s' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {pros.filter(p => p.founder).sort((a, b) => a.founderNumber - b.founderNumber).map(pro => (
                      <div key={pro.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #FDE68A', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: pro.gradient || '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                          {pro.initials}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{pro.name}</p>
                          <p style={{ fontSize: 12, color: '#9CA3AF' }}>{pro.city} · Inscrit le {formatDate(pro.createdAt)}</p>
                        </div>
                        <Badge color="#D97706" bg="#FFFBEB">⭐ Fondateur #{pro.founderNumber}</Badge>
                      </div>
                    ))}
                    {pros.filter(p => p.founder).length === 0 && (
                      <p style={{ textAlign: 'center', padding: 28, color: '#9CA3AF', fontSize: 13 }}>Aucun fondateur pour le moment.</p>
                    )}
                  </div>

                  {founderCount < founderLimit && (
                    <>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F0F0F', margin: '28px 0 12px' }}>
                        Pros éligibles (non encore fondateurs)
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {pros.filter(p => !p.founder && p.verified && !p.suspended).map(pro => (
                          <div key={pro.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: pro.gradient || '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                              {pro.initials}
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{pro.name}</p>
                              <p style={{ fontSize: 11, color: '#9CA3AF' }}>{pro.city} · {formatDate(pro.createdAt)}</p>
                            </div>
                            <ActionBtn onClick={() => grantFounder(pro.id)} color="#D97706">⭐ Accorder le badge</ActionBtn>
                          </div>
                        ))}
                        {pros.filter(p => !p.founder && p.verified && !p.suspended).length === 0 && (
                          <p style={{ textAlign: 'center', padding: 20, color: '#9CA3AF', fontSize: 13 }}>Tous les pros vérifiés sont déjà fondateurs.</p>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}

              {/* ── Notifications admin ── */}
              {section === 'notifs' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F0F0F' }}>🔔 Notifications</h2>
                      <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                        {unreadAdminCount} non lue{unreadAdminCount > 1 ? 's' : ''} · {adminNotifications.length} au total
                      </p>
                    </div>
                    {unreadAdminCount > 0 && (
                      <ActionBtn onClick={clearAllAdminNotifs} color="#6B7280">✓ Tout marquer comme lu</ActionBtn>
                    )}
                  </div>

                  {adminNotifications.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #E5E7EB', padding: 48, textAlign: 'center' }}>
                      <p style={{ fontSize: 32, marginBottom: 12 }}>🔕</p>
                      <p style={{ color: '#9CA3AF', fontSize: 14 }}>Aucune notification pour l'instant.</p>
                      <p style={{ color: '#D1D5DB', fontSize: 12, marginTop: 6 }}>Les nouvelles inscriptions et réservations apparaîtront ici.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {adminNotifications.map(n => (
                        <div key={n.id} style={{
                          background: n.read ? '#fff' : '#FFFBEB',
                          borderRadius: 14,
                          border: `1px solid ${n.read ? '#E5E7EB' : '#FDE68A'}`,
                          padding: '14px 18px',
                          display: 'flex', alignItems: 'flex-start', gap: 14,
                          transition: 'all 0.2s',
                        }}>
                          <div style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>
                            {n.type === 'new_pro' ? '👩‍🎨' : '📅'}
                          </div>
                          <div style={{ flex: 1 }}>
                            {n.type === 'new_pro' && (
                              <>
                                <p style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>
                                  Nouvelle inscription pro — {n.proName}
                                </p>
                                <p style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                                  {n.city || 'Ville non renseignée'} ·
                                  {n.founder ? ' ⭐ Programme fondateur' : ' Hors programme fondateur'}
                                </p>
                              </>
                            )}
                            {n.type === 'new_booking' && (
                              <>
                                <p style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>
                                  Nouvelle réservation — {n.service}
                                </p>
                                <p style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                                  {n.clientName} chez {n.proName} · {formatDate(n.date)}
                                </p>
                              </>
                            )}
                            <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{timeAgo(n.createdAt)}</p>
                          </div>
                          {!n.read && (
                            <button
                              onClick={() => clearAdminNotif(n.id)}
                              style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 16, padding: 4, flexShrink: 0 }}
                              title="Marquer comme lu"
                            >
                              ✕
                            </button>
                          )}
                          {!n.read && (
                            <div style={{ width: 8, height: 8, borderRadius: 99, background: '#D97706', flexShrink: 0, marginTop: 6 }} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

/* ─── Point d'entrée ─────────────────────────────────────────────── */
export default function AdminPage() {
  const { isAdmin } = useApp();
  if (!isAdmin) return <AdminLogin />;
  return <AdminPanel />;
}

const S = {
  searchInput: { border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '8px 12px', fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none', background: '#fff', color: '#111', width: 220 },
  select:      { border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '8px 12px', fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none', background: '#fff', color: '#111', appearance: 'none', cursor: 'pointer' },
};
