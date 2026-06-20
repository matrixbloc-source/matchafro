import { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext.jsx';

/* ─── Tokens ─────────────────────────────────────────────────────────── */
const INK  = '#0F0F0F';
const MID  = '#6B7280';
const MUTED= '#9CA3AF';
const LINE = '#E5E7EB';
const BG   = '#F9FAFB';
const GOLD = '#D97706';
const GREEN= '#059669';
const RED  = '#EF4444';
const BLUE = '#0891B2';

const EASE = [0.22, 1, 0.36, 1];
const ALL_CATS = ['tresses','locks','perruques','barber','maquillage','onglerie','knotless','vanilles'];
const CAT_LABEL = { tresses:'Tresses', locks:'Locks', perruques:'Perruques', barber:'Barber',
  maquillage:'Maquillage', onglerie:'Onglerie', knotless:'Knotless', vanilles:'Vanilles' };
const STATUS_OPTS = [
  { v:'confirmed',   l:'Confirmé' },{ v:'scheduled',   l:'Planifié' },
  { v:'in_progress', l:'En cours' },{ v:'completed',   l:'Terminé' },
  { v:'cancelled',   l:'Annulé' }, { v:'pending',      l:'En attente' },
];

/* ─── UI atoms ───────────────────────────────────────────────────────── */
function Badge({ color = MID, bg = '#F9FAFB', children }) {
  return (
    <span style={{ background: bg, color, borderRadius: 20, padding: '2px 9px', fontSize: 10,
      fontWeight: 700, border: `1px solid ${color}33`, display: 'inline-flex', alignItems: 'center', gap: 3, whiteSpace:'nowrap' }}>
      {children}
    </span>
  );
}

function Btn({ onClick, color = MID, bg, children, size = 'sm' }) {
  const p = size === 'sm' ? '4px 10px' : '8px 18px';
  const fs = size === 'sm' ? 11 : 13;
  return (
    <button onClick={onClick} style={{
      background: bg || 'none', border: `1px solid ${color}`, color, borderRadius: 8,
      padding: p, fontSize: fs, fontWeight: 700, cursor: 'pointer',
      fontFamily: 'Inter, sans-serif', transition: 'all 0.15s', whiteSpace: 'nowrap',
    }}>
      {children}
    </button>
  );
}

function StatBox({ icon, label, value, color = GOLD, sub }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${LINE}`, padding: '18px 20px',
      flex: '1 1 130px', textAlign: 'center' }}>
      <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
      <p style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 11, color: MUTED, fontWeight: 600, marginTop: 4 }}>{label}</p>
      {sub && <p style={{ fontSize: 10, color: '#D1D5DB', marginTop: 2 }}>{sub}</p>}
    </div>
  );
}

function Th({ children, w }) {
  return (
    <th style={{ padding: '11px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700,
      color: MUTED, textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap', width: w }}>
      {children}
    </th>
  );
}

function Td({ children, style }) {
  return <td style={{ padding: '11px 14px', ...style }}>{children}</td>;
}

function SInput({ label, value, onChange, type = 'text', placeholder, rows }) {
  const el = rows
    ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder} style={IS} />
    : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={IS} />;
  return (
    <div>
      {label && <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: MUTED,
        textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{label}</label>}
      {el}
    </div>
  );
}

function EmptyMsg({ text }) {
  return <p style={{ textAlign: 'center', padding: '28px 0', color: MUTED, fontSize: 13 }}>{text}</p>;
}

function Confirm({ msg, onOk, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, maxWidth: 360, width: '100%', textAlign: 'center' }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: INK, marginBottom: 8 }}>Confirmer</p>
        <p style={{ fontSize: 13, color: MID, marginBottom: 24 }}>{msg}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Btn onClick={onCancel} color={MID} size="lg">Annuler</Btn>
          <Btn onClick={onOk} color={RED} bg='#FEF2F2' size="lg">Confirmer</Btn>
        </div>
      </div>
    </div>
  );
}

function formatDate(s) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}
function timeAgo(s) {
  if (!s) return '';
  const d = Date.now() - new Date(s).getTime(), m = Math.floor(d / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h}h`;
  return `il y a ${Math.floor(h / 24)}j`;
}
function stars(n) { return '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n)); }

const IS = { /* input style */
  display: 'block', width: '100%', border: `1.5px solid ${LINE}`, borderRadius: 10,
  padding: '8px 12px', fontSize: 13, color: INK, background: '#fff',
  fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', resize: 'vertical', outline: 'none',
};
const CARD = { background: '#fff', borderRadius: 18, border: `1px solid ${LINE}`, overflow: 'hidden' };
const H2S  = { fontSize: 18, fontWeight: 800, color: INK, margin: '0 0 20px' };

/* ─── ProEditModal ────────────────────────────────────────────────────── */
function ProEditModal({ pro, onClose }) {
  const { updatePro } = useApp();
  const [form, setForm] = useState({
    name: pro.name || '',
    email: pro.email || '',
    phone: pro.phone || '',
    whatsapp: pro.whatsapp || '',
    instagram: pro.instagram || '',
    salonName: pro.salonName || '',
    city: pro.city || '',
    address: pro.address || '',
    description: pro.description || '',
    categories: pro.categories || [],
    services: pro.services ? pro.services.map(s => ({ ...s })) : [],
    homeService: pro.homeService || false,
    active: pro.active !== false,
    verified: pro.verified || false,
  });
  const [saved, setSaved] = useState(false);

  function setF(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function toggleCat(c) {
    setF('categories', form.categories.includes(c)
      ? form.categories.filter(x => x !== c)
      : [...form.categories, c]);
  }

  function addSvc() {
    setF('services', [...form.services, { id: 'svc_' + Date.now(), name: '', price: '', duration: 60 }]);
  }
  function updSvc(i, k, v) {
    const svcs = form.services.map((s, idx) => idx === i ? { ...s, [k]: v } : s);
    setF('services', svcs);
  }
  function delSvc(i) { setF('services', form.services.filter((_, idx) => idx !== i)); }

  function save() {
    updatePro(pro.id, form);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 900);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 100,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '40px 20px' }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 680,
        padding: 32, position: 'relative', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: INK, margin: 0 }}>Modifier — {pro.name}</h2>
          <button onClick={onClose} style={{ background: '#F3F4F6', border: 'none', borderRadius: 8,
            width: 32, height: 32, cursor: 'pointer', fontSize: 14, color: MID }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Identité */}
          <section>
            <p style={SH}>Identité</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <SInput label="Nom" value={form.name} onChange={v => setF('name', v)} />
              <SInput label="Nom du salon" value={form.salonName} onChange={v => setF('salonName', v)} />
              <SInput label="Email" value={form.email} onChange={v => setF('email', v)} />
              <SInput label="Téléphone" value={form.phone} onChange={v => setF('phone', v)} />
              <SInput label="WhatsApp" value={form.whatsapp} onChange={v => setF('whatsapp', v)} />
              <SInput label="Instagram" value={form.instagram} onChange={v => setF('instagram', v)} />
              <SInput label="Ville" value={form.city} onChange={v => setF('city', v)} />
              <SInput label="Adresse" value={form.address} onChange={v => setF('address', v)} />
            </div>
            <div style={{ marginTop: 12 }}>
              <SInput label="Description" value={form.description} onChange={v => setF('description', v)} rows={3} />
            </div>
          </section>

          {/* Catégories */}
          <section>
            <p style={SH}>Catégories</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ALL_CATS.map(c => (
                <button key={c} onClick={() => toggleCat(c)} style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', border: `1.5px solid ${form.categories.includes(c) ? GOLD : LINE}`,
                  background: form.categories.includes(c) ? '#FFFBEB' : '#fff',
                  color: form.categories.includes(c) ? GOLD : MID,
                }}>
                  {CAT_LABEL[c]}
                </button>
              ))}
            </div>
          </section>

          {/* Services */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <p style={{ ...SH, margin: 0 }}>Prestations</p>
              <Btn onClick={addSvc} color={GOLD} size="sm">+ Ajouter</Btn>
            </div>
            {form.services.length === 0 && <p style={{ fontSize: 12, color: MUTED }}>Aucune prestation.</p>}
            {form.services.map((svc, i) => (
              <div key={svc.id || i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 32px', gap: 8, marginBottom: 8 }}>
                <input value={svc.name} onChange={e => updSvc(i, 'name', e.target.value)}
                  placeholder="Nom de la prestation" style={{ ...IS, padding: '7px 10px' }} />
                <input type="number" value={svc.price} onChange={e => updSvc(i, 'price', e.target.value)}
                  placeholder="Prix €" style={{ ...IS, padding: '7px 10px' }} />
                <input type="number" value={svc.duration} onChange={e => updSvc(i, 'duration', e.target.value)}
                  placeholder="Durée min" style={{ ...IS, padding: '7px 10px' }} />
                <button onClick={() => delSvc(i)} style={{ background: '#FEF2F2', border: `1px solid #FECACA`,
                  borderRadius: 8, cursor: 'pointer', color: RED, fontSize: 14 }}>✕</button>
              </div>
            ))}
          </section>

          {/* Statut */}
          <section>
            <p style={SH}>Statut</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {[['active','Actif'],['verified','Vérifié'],['homeService','Déplacements domicile']].map(([k, l]) => (
                <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, cursor: 'pointer', color: INK }}>
                  <input type="checkbox" checked={!!form[k]} onChange={e => setF(k, e.target.checked)}
                    style={{ width: 15, height: 15, accentColor: GOLD }} />
                  {l}
                </label>
              ))}
            </div>
          </section>
        </div>

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Btn onClick={onClose} color={MID} size="lg">Annuler</Btn>
          <button onClick={save} style={{ background: saved ? GREEN : INK, color: '#fff', border: 'none',
            borderRadius: 10, padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', transition: 'background 0.3s' }}>
            {saved ? '✓ Sauvegardé !' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── BookingEditModal ────────────────────────────────────────────────── */
function BookingEditModal({ booking, onClose }) {
  const { updateBookingFull } = useApp();
  const [form, setForm] = useState({
    status:    booking.status,
    date:      booking.date,
    startTime: booking.startTime,
    endTime:   booking.endTime || '',
  });
  const [saved, setSaved] = useState(false);

  function save() {
    updateBookingFull(booking.id, form);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 900);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 420, padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: INK, margin: 0 }}>Modifier la réservation</h2>
          <button onClick={onClose} style={{ background: '#F3F4F6', border: 'none', borderRadius: 8,
            width: 30, height: 30, cursor: 'pointer', fontSize: 13, color: MID }}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={LS}>Statut</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={{ ...IS, cursor: 'pointer' }}>
              {STATUS_OPTS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          </div>
          <SInput label="Date" type="date" value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <SInput label="Heure début" type="time" value={form.startTime} onChange={v => setForm(f => ({ ...f, startTime: v }))} />
            <SInput label="Heure fin" type="time" value={form.endTime} onChange={v => setForm(f => ({ ...f, endTime: v }))} />
          </div>
        </div>
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Btn onClick={onClose} color={MID} size="lg">Annuler</Btn>
          <button onClick={save} style={{ background: saved ? GREEN : INK, color: '#fff', border: 'none',
            borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            {saved ? '✓ Sauvegardé !' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Section Dashboard ───────────────────────────────────────────────── */
function SectionDashboard() {
  const { pros, bookings, reviews, founderCount, founderLimit } = useApp();
  const todayParis = new Date().toLocaleDateString('fr-CA', { timeZone: 'Europe/Paris' });
  const monthStr   = todayParis.slice(0, 7);

  const stats = {
    total:    pros.length,
    verified: pros.filter(p => p.verified).length,
    active:   pros.filter(p => p.active && !p.suspended).length,
    founders: founderCount,
    suspended:pros.filter(p => p.suspended).length,
    bookings: (bookings || []).length,
    today:    (bookings || []).filter(b => b.date === todayParis && b.status !== 'cancelled').length,
    month:    (bookings || []).filter(b => (b.date || '').startsWith(monthStr) && b.status !== 'cancelled').length,
    clients:  new Set((bookings || []).map(b => b.clientEmail || b.clientPhone).filter(Boolean)).size,
    reviews:  reviews.length,
    newPros7: pros.filter(p => {
      if (!p.createdAt) return false;
      return (Date.now() - new Date(p.createdAt)) < 7 * 86400000;
    }).length,
  };

  const recent = [...(bookings || [])].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 6);

  return (
    <>
      <h2 style={H2S}>Vue d'ensemble</h2>

      <p style={CAT_HEAD}>Professionnels</p>
      <div style={FLEX_WRAP}>
        <StatBox icon="👩‍🎨" label="Inscrits"    value={stats.total}     color={INK} />
        <StatBox icon="✅"   label="Vérifiés"    value={stats.verified}  color={GREEN} />
        <StatBox icon="🟢"   label="Actifs"      value={stats.active}    color={BLUE} />
        <StatBox icon="⭐"   label="Fondateurs"  value={stats.founders}  color={GOLD} sub={`${founderLimit - founderCount} places restantes`} />
        <StatBox icon="🚫"   label="Suspendus"   value={stats.suspended} color={RED} />
      </div>

      <p style={CAT_HEAD}>Activité</p>
      <div style={FLEX_WRAP}>
        <StatBox icon="📅"  label="Réservations"     value={stats.bookings} color="#7C3AED" />
        <StatBox icon="📆"  label="Aujourd'hui"      value={stats.today}   color={GOLD} />
        <StatBox icon="🗓️" label="Ce mois"           value={stats.month}   color={GREEN} />
        <StatBox icon="👤"  label="Clients uniques"  value={stats.clients}  color={INK} />
        <StatBox icon="⭐"  label="Avis"             value={stats.reviews}  color="#7C3AED" />
        <StatBox icon="🆕"  label="Nouveaux pros 7j" value={stats.newPros7} color={BLUE} />
      </div>

      <p style={CAT_HEAD}>Programme Fondateur</p>
      <div style={{ ...CARD, padding: '20px 24px', marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 800, color: INK }}>⭐ {founderCount} / {founderLimit} places utilisées</p>
            <p style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{founderLimit - founderCount} places encore disponibles</p>
          </div>
          <span style={{ fontSize: 28, fontWeight: 900, color: founderCount >= founderLimit ? RED : GOLD }}>
            {Math.round((founderCount / founderLimit) * 100)}%
          </span>
        </div>
        <div style={{ background: LINE, borderRadius: 99, height: 10 }}>
          <div style={{ width: `${(founderCount / founderLimit) * 100}%`, background: `linear-gradient(90deg,${GOLD},#F59E0B)`, height: '100%', borderRadius: 99, transition: 'width 0.5s' }} />
        </div>
      </div>

      <p style={CAT_HEAD}>Réservations récentes</p>
      <div style={CARD}>
        {recent.length === 0 ? <EmptyMsg text="Aucune réservation." /> : recent.map((b, i) => {
          const pro = pros.find(p => p.id === b.proId);
          return (
            <div key={b.id} style={{ padding: '11px 16px', borderBottom: i < recent.length - 1 ? `1px solid ${BG}` : 'none',
              display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: INK }}>{b.clientName} → {pro?.name || '—'}</p>
                <p style={{ fontSize: 11, color: MUTED }}>{b.service} · {formatDate(b.date)}</p>
              </div>
              <Badge color={b.status === 'cancelled' ? RED : GREEN} bg={b.status === 'cancelled' ? '#FEF2F2' : '#ECFDF5'}>
                {b.status === 'cancelled' ? 'Annulé' : 'Confirmé'}
              </Badge>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ─── Section Professionnels ──────────────────────────────────────────── */
function SectionPros() {
  const { pros, verifyPro, suspendPro, reactivatePro, grantFounder, deletePro, founderCount, founderLimit } = useApp();
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('all');
  const [editPro, setEditPro] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = useMemo(() => {
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
        (p.email || '').toLowerCase().includes(q) ||
        (p.phone || '').includes(q) ||
        (p.city  || '').toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [pros, filter, search]);

  return (
    <>
      {editPro && <ProEditModal pro={editPro} onClose={() => setEditPro(null)} />}
      {confirmDelete && (
        <Confirm msg={`Supprimer définitivement ${confirmDelete.name} ?`}
          onOk={() => { deletePro(confirmDelete.id); setConfirmDelete(null); }}
          onCancel={() => setConfirmDelete(null)} />
      )}

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        <h2 style={{ ...H2S, margin: 0, flex: 1 }}>Professionnels ({filtered.length})</h2>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Nom, email, ville..."
          style={{ ...IS, width: 220, padding: '8px 12px' }} />
        <select value={filter} onChange={e => setFilter(e.target.value)}
          style={{ ...IS, width: 'auto', padding: '8px 12px', cursor: 'pointer' }}>
          <option value="all">Tous</option>
          <option value="pending">En attente</option>
          <option value="active">Actifs</option>
          <option value="verified">Vérifiés</option>
          <option value="founder">Fondateurs</option>
          <option value="suspended">Suspendus</option>
        </select>
      </div>

      <div style={CARD}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 900 }}>
            <thead>
              <tr style={{ background: BG, borderBottom: `1px solid ${LINE}` }}>
                <Th>Professionnel</Th><Th>Contact</Th><Th>Ville</Th>
                <Th>Inscription</Th><Th>Catégories</Th><Th>Statut</Th><Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((pro, i) => (
                <tr key={pro.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${BG}` : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = BG}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: pro.gradient || GOLD,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                        {pro.initials || pro.name?.[0]}
                      </div>
                      <div>
                        <Link to={`/pro/${pro.slug}`} target="_blank"
                          style={{ fontWeight: 700, color: INK, textDecoration: 'none', fontSize: 13 }}>{pro.name}</Link>
                        {pro.salonName && <p style={{ fontSize: 10, color: MUTED }}>{pro.salonName}</p>}
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <p style={{ fontSize: 12, color: MID }}>{pro.email || '—'}</p>
                    <p style={{ fontSize: 11, color: MUTED }}>{pro.phone || '—'}</p>
                  </Td>
                  <Td style={{ color: MID }}>{pro.city || '—'}</Td>
                  <Td>
                    <p style={{ fontSize: 12, color: MID }}>{formatDate(pro.createdAt)}</p>
                  </Td>
                  <Td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {(pro.categories || []).slice(0, 2).map(c => (
                        <span key={c} style={{ background: '#F3F4F6', color: MID, borderRadius: 20,
                          padding: '2px 7px', fontSize: 10, fontWeight: 600 }}>{CAT_LABEL[c] || c}</span>
                      ))}
                      {(pro.categories || []).length > 2 && <span style={{ fontSize: 10, color: MUTED }}>+{(pro.categories || []).length - 2}</span>}
                    </div>
                  </Td>
                  <Td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {pro.active && !pro.suspended && <Badge color={BLUE} bg="#EFF6FF">🟢 Actif</Badge>}
                      {pro.verified  && <Badge color={GREEN} bg="#ECFDF5">✓ Vérifié</Badge>}
                      {pro.founder   && <Badge color={GOLD} bg="#FFFBEB">⭐ #{pro.founderNumber}</Badge>}
                      {pro.suspended && <Badge color={RED} bg="#FEF2F2">🚫 Suspendu</Badge>}
                      {!pro.verified && !pro.suspended && <Badge>En attente</Badge>}
                    </div>
                  </Td>
                  <Td>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      <Btn onClick={() => setEditPro(pro)} color={BLUE}>✏️ Modifier</Btn>
                      {!pro.verified && !pro.suspended && (
                        <Btn onClick={() => verifyPro(pro.id)} color={GREEN}>✓ Vérifier</Btn>
                      )}
                      {!pro.founder && founderCount < founderLimit && (
                        <Btn onClick={() => grantFounder(pro.id)} color={GOLD}>⭐ Fondateur</Btn>
                      )}
                      {!pro.suspended
                        ? <Btn onClick={() => suspendPro(pro.id)} color={RED}>🚫 Suspendre</Btn>
                        : <Btn onClick={() => reactivatePro(pro.id)} color="#7C3AED">↩️ Réactiver</Btn>}
                      <Btn onClick={() => setConfirmDelete(pro)} color={RED}>🗑️</Btn>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <EmptyMsg text="Aucun professionnel trouvé." />}
      </div>
    </>
  );
}

/* ─── Section Clients ─────────────────────────────────────────────────── */
function SectionClients() {
  const { bookings, suspendedClients, suspendClient, unsuspendClient } = useApp();
  const [search, setSearch] = useState('');

  const clients = useMemo(() => {
    const map = {};
    (bookings || []).forEach(b => {
      const key = b.clientEmail || b.clientPhone;
      if (!key) return;
      if (!map[key]) map[key] = {
        email: b.clientEmail || '',
        phone: b.clientPhone || '',
        name: b.clientName || '',
        count: 0, lastDate: b.date, firstAt: b.createdAt,
      };
      map[key].count++;
      if (b.date > map[key].lastDate) map[key].lastDate = b.date;
    });
    return Object.values(map).sort((a, b) => (b.firstAt || '').localeCompare(a.firstAt || ''));
  }, [bookings]);

  const filtered = useMemo(() => {
    if (!search.trim()) return clients;
    const q = search.toLowerCase();
    return clients.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  }, [clients, search]);

  return (
    <>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        <h2 style={{ ...H2S, margin: 0, flex: 1 }}>Clients ({filtered.length})</h2>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Nom, email, téléphone..."
          style={{ ...IS, width: 240, padding: '8px 12px' }} />
      </div>

      <div style={CARD}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 700 }}>
            <thead>
              <tr style={{ background: BG, borderBottom: `1px solid ${LINE}` }}>
                <Th>Client</Th><Th>Email</Th><Th>Téléphone</Th>
                <Th>Réservations</Th><Th>Dernier RDV</Th><Th>Inscrit depuis</Th><Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const key = c.email || c.phone;
                const susp = suspendedClients.includes(key);
                return (
                  <tr key={key} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${BG}` : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = BG}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E5E7EB',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 700, color: MID, flexShrink: 0 }}>
                          {c.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, color: INK }}>{c.name || <em style={{ color: MUTED }}>Inconnu</em>}</p>
                          {susp && <Badge color={RED} bg="#FEF2F2">Suspendu</Badge>}
                        </div>
                      </div>
                    </Td>
                    <Td style={{ color: MID }}>{c.email || '—'}</Td>
                    <Td style={{ color: MID }}>{c.phone || '—'}</Td>
                    <Td>
                      <span style={{ fontWeight: 700, color: '#7C3AED' }}>{c.count}</span>
                    </Td>
                    <Td style={{ color: MID }}>{c.lastDate ? new Date(c.lastDate + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—'}</Td>
                    <Td style={{ color: MUTED }}>{formatDate(c.firstAt)}</Td>
                    <Td>
                      {!susp
                        ? <Btn onClick={() => suspendClient(key)} color={RED}>🚫 Suspendre</Btn>
                        : <Btn onClick={() => unsuspendClient(key)} color={GREEN}>↩️ Réactiver</Btn>}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <EmptyMsg text="Aucun client trouvé." />}
      </div>
    </>
  );
}

/* ─── Section Réservations ────────────────────────────────────────────── */
function SectionBookings() {
  const { bookings, pros, cancelBooking, updateBookingFull } = useApp();
  const [fDate,   setFDate]   = useState('');
  const [fPro,    setFPro]    = useState('');
  const [fSearch, setFSearch] = useState('');
  const [fStatus, setFStatus] = useState('all');
  const [editB,   setEditB]   = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null);

  const filtered = useMemo(() => {
    let list = [...(bookings || [])];
    if (fDate)   list = list.filter(b => b.date === fDate);
    if (fPro)    list = list.filter(b => b.proId === fPro);
    if (fStatus !== 'all') list = list.filter(b => b.status === fStatus);
    if (fSearch.trim()) {
      const q = fSearch.toLowerCase();
      list = list.filter(b =>
        (b.clientName  || '').toLowerCase().includes(q) ||
        (b.clientEmail || '').toLowerCase().includes(q) ||
        (b.service     || '').toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [bookings, fDate, fPro, fSearch, fStatus]);

  const todayParis = new Date().toLocaleDateString('fr-CA', { timeZone: 'Europe/Paris' });

  return (
    <>
      {editB && <BookingEditModal booking={editB} onClose={() => setEditB(null)} />}
      {confirmCancel && (
        <Confirm msg="Annuler cette réservation ?"
          onOk={() => { cancelBooking(confirmCancel.id); setConfirmCancel(null); }}
          onCancel={() => setConfirmCancel(null)} />
      )}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        <h2 style={{ ...H2S, margin: 0, flex: 1 }}>Réservations ({filtered.length})</h2>
        <input type="date" value={fDate} onChange={e => setFDate(e.target.value)}
          style={{ ...IS, width: 150, padding: '8px 12px' }} />
        <select value={fPro} onChange={e => setFPro(e.target.value)}
          style={{ ...IS, width: 180, padding: '8px 12px', cursor: 'pointer' }}>
          <option value="">Tous les pros</option>
          {pros.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={fStatus} onChange={e => setFStatus(e.target.value)}
          style={{ ...IS, width: 140, padding: '8px 12px', cursor: 'pointer' }}>
          <option value="all">Tous statuts</option>
          {STATUS_OPTS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
        <input value={fSearch} onChange={e => setFSearch(e.target.value)} placeholder="🔍 Client, prestation..."
          style={{ ...IS, width: 200, padding: '8px 12px' }} />
        {(fDate || fPro || fStatus !== 'all' || fSearch) && (
          <Btn onClick={() => { setFDate(''); setFPro(''); setFStatus('all'); setFSearch(''); }} color={MID}>✕ Reset</Btn>
        )}
      </div>

      <div style={CARD}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 900 }}>
            <thead>
              <tr style={{ background: BG, borderBottom: `1px solid ${LINE}` }}>
                <Th>Cliente</Th><Th>Contact</Th><Th>Professionnel</Th>
                <Th>Prestation</Th><Th>Date RDV</Th><Th>Heure</Th><Th>Statut</Th><Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => {
                const pro = pros.find(p => p.id === b.proId);
                const isToday = b.date === todayParis;
                const sc = STATUS_OPTS.find(o => o.v === b.status) || { l: b.status };
                return (
                  <tr key={b.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${BG}` : 'none',
                    background: isToday ? '#FFFBEB' : 'transparent' }}>
                    <Td>
                      <p style={{ fontWeight: 700, color: INK }}>{b.clientName}</p>
                      {isToday && <Badge color={GOLD} bg="#FFFBEB">Aujourd'hui</Badge>}
                    </Td>
                    <Td>
                      <p style={{ fontSize: 11, color: MID }}>{b.clientEmail || '—'}</p>
                      <p style={{ fontSize: 11, color: MUTED }}>{b.clientPhone || '—'}</p>
                    </Td>
                    <Td style={{ color: MID }}>{pro?.name || '—'}</Td>
                    <Td style={{ color: MID }}>{b.service}</Td>
                    <Td style={{ color: INK, fontWeight: 600 }}>
                      {new Date(b.date + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Td>
                    <Td style={{ color: MID }}>{b.startTime}{b.endTime ? ` → ${b.endTime}` : ''}</Td>
                    <Td>
                      <Badge color={b.status === 'cancelled' ? RED : b.status === 'completed' ? GREEN : GOLD}
                        bg={b.status === 'cancelled' ? '#FEF2F2' : b.status === 'completed' ? '#ECFDF5' : '#FFFBEB'}>
                        {sc.l}
                      </Badge>
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <Btn onClick={() => setEditB(b)} color={BLUE}>✏️</Btn>
                        {b.status !== 'cancelled' && (
                          <Btn onClick={() => setConfirmCancel(b)} color={RED}>✕ Annuler</Btn>
                        )}
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <EmptyMsg text="Aucune réservation trouvée." />}
      </div>
    </>
  );
}

/* ─── Section Avis ────────────────────────────────────────────────────── */
function SectionReviews() {
  const { reviews, pros, deleteReview, toggleReviewHidden } = useApp();
  const [fPro,    setFPro]    = useState('');
  const [fRating, setFRating] = useState('all');
  const [confirmDel, setConfirmDel] = useState(null);

  const filtered = useMemo(() => {
    let list = [...(reviews || [])];
    if (fPro) list = list.filter(r => r.proId === fPro);
    if (fRating !== 'all') list = list.filter(r => r.rating === parseInt(fRating));
    return list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }, [reviews, fPro, fRating]);

  return (
    <>
      {confirmDel && (
        <Confirm msg={`Supprimer l'avis de "${confirmDel.author}" ?`}
          onOk={() => { deleteReview(confirmDel.id); setConfirmDel(null); }}
          onCancel={() => setConfirmDel(null)} />
      )}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        <h2 style={{ ...H2S, margin: 0, flex: 1 }}>Avis ({filtered.length})</h2>
        <select value={fPro} onChange={e => setFPro(e.target.value)}
          style={{ ...IS, width: 200, padding: '8px 12px', cursor: 'pointer' }}>
          <option value="">Tous les pros</option>
          {pros.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={fRating} onChange={e => setFRating(e.target.value)}
          style={{ ...IS, width: 120, padding: '8px 12px', cursor: 'pointer' }}>
          <option value="all">Toutes notes</option>
          {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} étoile{n > 1 ? 's' : ''}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 && (
          <div style={{ ...CARD, padding: 28 }}><EmptyMsg text="Aucun avis." /></div>
        )}
        {filtered.map(r => {
          const pro = pros.find(p => p.id === r.proId);
          return (
            <div key={r.id} style={{ ...CARD, padding: '16px 20px',
              opacity: r.hidden ? 0.5 : 1, borderColor: r.hidden ? '#E5E7EB' : LINE }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <p style={{ fontWeight: 700, color: INK, fontSize: 14 }}>{r.author}</p>
                    <span style={{ fontSize: 13, color: GOLD, letterSpacing: 2 }}>{stars(r.rating)}</span>
                    <span style={{ fontSize: 11, color: MUTED }}>{r.rating}/5</span>
                    {r.hidden && <Badge color={MID}>Masqué</Badge>}
                  </div>
                  <p style={{ fontSize: 13, color: MID, lineHeight: 1.5 }}>{r.comment}</p>
                  <p style={{ fontSize: 11, color: MUTED, marginTop: 6 }}>
                    {pro?.name || '—'} · {r.service || '—'} · {formatDate(r.createdAt)}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <Btn onClick={() => toggleReviewHidden(r.id)} color={MID}>
                    {r.hidden ? '👁️ Afficher' : '🙈 Masquer'}
                  </Btn>
                  <Btn onClick={() => setConfirmDel(r)} color={RED}>🗑️ Supprimer</Btn>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ─── Section Contenu du site ─────────────────────────────────────────── */
function SectionContent() {
  const { siteContent, updateSiteContent } = useApp();
  const [draft, setDraft] = useState({ ...siteContent });
  const [saved, setSaved] = useState(false);

  function set(k, v) { setDraft(d => ({ ...d, [k]: v })); }

  function save() {
    updateSiteContent(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const CAT_SLUGS = ['Tresses','Locks','Perruques','Barber','Maquillage','Onglerie'];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ ...H2S, margin: 0 }}>Contenu du site</h2>
        <button onClick={save} style={{ background: saved ? GREEN : INK, color: '#fff', border: 'none',
          borderRadius: 10, padding: '10px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          fontFamily: 'Inter, sans-serif', transition: 'background 0.3s' }}>
          {saved ? '✓ Sauvegardé !' : '💾 Sauvegarder tout'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Hero */}
        <ContentCard title="🦸 Section Hero">
          <SInput label="Texte eyebrow (petit texte au-dessus du titre)"
            value={draft.heroEyebrow} onChange={v => set('heroEyebrow', v)} />
          <SInput label="Sous-titre" value={draft.heroSubtitle} onChange={v => set('heroSubtitle', v)} rows={2} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <SInput label="Stat artisans (ex: 5 000+)" value={draft.statArtisans} onChange={v => set('statArtisans', v)} />
            <SInput label="Stat pays" value={draft.statPays} onChange={v => set('statPays', v)} />
            <SInput label="Stat note" value={draft.statNote} onChange={v => set('statNote', v)} />
          </div>
        </ContentCard>

        {/* Catégories */}
        <ContentCard title="🏷️ Section Catégories">
          <SInput label="Titre de la section" value={draft.categoriesTitle} onChange={v => set('categoriesTitle', v)} />
          <SInput label="Sous-titre" value={draft.categoriesSubtitle} onChange={v => set('categoriesSubtitle', v)} rows={2} />
          <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: 1, marginTop: 8, marginBottom: 10 }}>
            Images des catégories (URLs)
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {CAT_SLUGS.map(name => {
              const k = 'catImg' + name;
              return (
                <div key={k}>
                  <label style={LS}>{name} — URL image</label>
                  <input value={draft[k] || ''} onChange={e => set(k, e.target.value)}
                    placeholder="https://..." style={IS} />
                </div>
              );
            })}
          </div>
        </ContentCard>

        {/* Professionnels vedettes */}
        <ContentCard title="⭐ Section Professionnels vedettes">
          <SInput label="Titre de la section" value={draft.featuredTitle} onChange={v => set('featuredTitle', v)} />
        </ContentCard>

        {/* Comment ça marche */}
        <ContentCard title="🔢 Section Comment ça marche">
          <SInput label="Titre de la section" value={draft.howItWorksTitle} onChange={v => set('howItWorksTitle', v)} />
          {[['1','step1'],['2','step2'],['3','step3']].map(([n, prefix]) => (
            <div key={n} style={{ background: BG, borderRadius: 12, padding: 14, marginTop: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Étape {n}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <SInput label="Titre" value={draft[prefix + 'Title']} onChange={v => set(prefix + 'Title', v)} />
                <SInput label="Description" value={draft[prefix + 'Body']} onChange={v => set(prefix + 'Body', v)} rows={2} />
              </div>
            </div>
          ))}
        </ContentCard>
      </div>
    </>
  );
}

function ContentCard({ title, children }) {
  return (
    <div style={{ ...CARD, padding: '20px 24px' }}>
      <p style={{ fontSize: 13, fontWeight: 800, color: INK, marginBottom: 16 }}>{title}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {children}
      </div>
    </div>
  );
}

/* ─── Section Sécurité & Logs ─────────────────────────────────────────── */
function SectionSecurity() {
  const { adminNotifications } = useApp();

  const logs = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('ma_admin_logs') || '[]'); }
    catch { return []; }
  }, [adminNotifications]); // re-derive when notifs change

  const stats = {
    sessions: 1,
    env: import.meta.env.VITE_SUPABASE_URL ? 'Supabase connecté' : 'Mode hors-ligne',
    pwd: import.meta.env.VITE_ADMIN_PWD ? '⚙️ Via variable .env' : '⚙️ Mot de passe par défaut',
  };

  return (
    <>
      <h2 style={H2S}>Sécurité & Logs</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {[
          ['🔐', 'Authentification admin', 'Mot de passe requis', GREEN],
          ['🌐', 'Environnement Supabase', stats.env, BLUE],
          ['🔑', 'Mot de passe admin', stats.pwd, GOLD],
          ['✅', 'Routes protégées', '/dashboard redirige si déconnecté', GREEN],
        ].map(([icon, label, val, color]) => (
          <div key={label} style={{ ...CARD, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 22 }}>{icon}</span>
            <div>
              <p style={{ fontSize: 12, color: MUTED }}>{label}</p>
              <p style={{ fontSize: 13, fontWeight: 700, color }}>{val}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: INK }}>Logs d'actions admin ({logs.length})</p>
        {logs.length > 0 && (
          <Btn onClick={() => { localStorage.setItem('ma_admin_logs', '[]'); window.location.reload(); }} color={RED}>
            🗑️ Vider les logs
          </Btn>
        )}
      </div>
      <div style={CARD}>
        {logs.length === 0 ? <EmptyMsg text="Aucun log d'action." /> : logs.slice(0, 100).map((l, i, arr) => (
          <div key={l.id || i} style={{ padding: '10px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${BG}` : 'none',
            display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 11, color: MUTED, flexShrink: 0, width: 120 }}>{timeAgo(l.at)}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: INK }}>{l.action}</span>
            <span style={{ fontSize: 12, color: MID }}>{l.detail}</span>
          </div>
        ))}
      </div>
    </>
  );
}

/* ─── Section Fondateurs ──────────────────────────────────────────────── */
function SectionFounders() {
  const { pros, grantFounder, founderCount, founderLimit } = useApp();
  return (
    <>
      <h2 style={H2S}>⭐ Programme Fondateurs</h2>
      <p style={{ color: MUTED, fontSize: 13, marginBottom: 16 }}>
        {founderCount} / {founderLimit} places utilisées · {founderLimit - founderCount} restantes
      </p>
      <div style={{ background: '#E5E7EB', borderRadius: 99, height: 10, marginBottom: 24 }}>
        <div style={{ width: `${(founderCount / founderLimit) * 100}%`, background: `linear-gradient(90deg,${GOLD},#F59E0B)`, height: '100%', borderRadius: 99 }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        {pros.filter(p => p.founder).sort((a, b) => a.founderNumber - b.founderNumber).map(pro => (
          <div key={pro.id} style={{ ...CARD, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: pro.gradient || GOLD,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
              {pro.initials}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: INK }}>{pro.name}</p>
              <p style={{ fontSize: 12, color: MUTED }}>{pro.city} · {formatDate(pro.createdAt)}</p>
            </div>
            <Badge color={GOLD} bg="#FFFBEB">⭐ Fondateur #{pro.founderNumber}</Badge>
          </div>
        ))}
        {pros.filter(p => p.founder).length === 0 && <EmptyMsg text="Aucun fondateur pour le moment." />}
      </div>

      {founderCount < founderLimit && (
        <>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: INK, marginBottom: 12 }}>Pros éligibles (non fondateurs)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pros.filter(p => !p.founder && p.verified && !p.suspended).map(pro => (
              <div key={pro.id} style={{ ...CARD, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: pro.gradient || GOLD,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                  {pro.initials}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: INK }}>{pro.name}</p>
                  <p style={{ fontSize: 11, color: MUTED }}>{pro.city} · {formatDate(pro.createdAt)}</p>
                </div>
                <Btn onClick={() => grantFounder(pro.id)} color={GOLD}>⭐ Accorder le badge</Btn>
              </div>
            ))}
            {pros.filter(p => !p.founder && p.verified && !p.suspended).length === 0 && (
              <EmptyMsg text="Tous les pros vérifiés sont déjà fondateurs." />
            )}
          </div>
        </>
      )}
    </>
  );
}

/* ─── Section Notifications ───────────────────────────────────────────── */
function SectionNotifs() {
  const { adminNotifications, clearAdminNotif, clearAllAdminNotifs, unreadAdminCount } = useApp();
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ ...H2S, margin: 0 }}>🔔 Notifications</h2>
          <p style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
            {unreadAdminCount} non lue{unreadAdminCount > 1 ? 's' : ''} · {adminNotifications.length} total
          </p>
        </div>
        {unreadAdminCount > 0 && <Btn onClick={clearAllAdminNotifs} color={MID}>✓ Tout marquer lu</Btn>}
      </div>

      {adminNotifications.length === 0 ? (
        <div style={{ ...CARD, padding: 48, textAlign: 'center' }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>🔕</p>
          <p style={{ color: MUTED, fontSize: 14 }}>Aucune notification pour l'instant.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {adminNotifications.map(n => (
            <div key={n.id} style={{ ...CARD, padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 14,
              background: n.read ? '#fff' : '#FFFBEB', borderColor: n.read ? LINE : '#FDE68A' }}>
              <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{n.type === 'new_pro' ? '👩‍🎨' : '📅'}</span>
              <div style={{ flex: 1 }}>
                {n.type === 'new_pro' && (
                  <>
                    <p style={{ fontSize: 13, fontWeight: 700, color: INK }}>Nouvelle inscription pro — {n.proName}</p>
                    <p style={{ fontSize: 12, color: MID, marginTop: 2 }}>{n.city || '—'}{n.founder ? ' · ⭐ Fondateur' : ''}</p>
                  </>
                )}
                {n.type === 'new_booking' && (
                  <>
                    <p style={{ fontSize: 13, fontWeight: 700, color: INK }}>Nouvelle réservation — {n.service}</p>
                    <p style={{ fontSize: 12, color: MID, marginTop: 2 }}>{n.clientName} chez {n.proName} · {formatDate(n.date)}</p>
                  </>
                )}
                <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>{timeAgo(n.createdAt)}</p>
              </div>
              {!n.read && (
                <button onClick={() => clearAdminNotif(n.id)}
                  style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontSize: 16, padding: 4 }}>✕</button>
              )}
              {!n.read && <div style={{ width: 8, height: 8, borderRadius: 99, background: GOLD, flexShrink: 0, marginTop: 6 }} />}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ─── AdminLogin ──────────────────────────────────────────────────────── */
function AdminLogin() {
  const { loginAdmin } = useApp();
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: EASE }}
        style={{ background: '#1a1a1a', borderRadius: 24, padding: 40, width: '100%', maxWidth: 400,
          textAlign: 'center', border: '1px solid #2d2d2d' }}>
        <div style={{ fontSize: 44, marginBottom: 16 }}>🔐</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Accès Admin</h2>
        <p style={{ color: '#666', fontSize: 13, marginBottom: 24 }}>Réservé à l'équipe MatchAfro</p>
        <input type="password" value={pwd}
          onChange={e => { setPwd(e.target.value); setErr(''); }}
          onKeyDown={e => e.key === 'Enter' && (!loginAdmin(pwd) && setErr('Mot de passe incorrect'))}
          placeholder="Mot de passe admin" autoFocus
          style={{ display: 'block', width: '100%', border: '1.5px solid #333', borderRadius: 12,
            padding: '12px 16px', fontSize: 14, background: '#111', color: '#fff', outline: 'none',
            marginBottom: 12, boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }} />
        {err && <p style={{ color: RED, fontSize: 12, marginBottom: 10 }}>{err}</p>}
        <button onClick={() => !loginAdmin(pwd) && setErr('Mot de passe incorrect')}
          style={{ width: '100%', background: GOLD, color: '#fff', border: 'none', borderRadius: 12,
            padding: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
          Connexion
        </button>
        <Link to="/" style={{ display: 'block', marginTop: 16, color: '#555', fontSize: 12, textDecoration: 'none' }}>
          ← Retour à l'accueil
        </Link>
      </motion.div>
    </div>
  );
}

/* ─── AdminPanel ──────────────────────────────────────────────────────── */
function AdminPanel() {
  const { unreadAdminCount } = useApp();
  const [section, setSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nav = [
    { id: 'dashboard',  label: '📊 Dashboard' },
    { id: 'pros',       label: '👩‍🎨 Professionnels' },
    { id: 'clients',    label: '👤 Clients' },
    { id: 'bookings',   label: '📅 Réservations' },
    { id: 'reviews',    label: '⭐ Avis' },
    { id: 'content',    label: '🌐 Contenu du site' },
    { id: 'security',   label: '🔐 Sécurité & Logs' },
    { id: 'founders',   label: '⭐ Fondateurs' },
    { id: 'notifs',     label: '🔔 Notifications', badge: unreadAdminCount },
  ];

  function NavBtn({ item }) {
    return (
      <button onClick={() => { setSection(item.id); setSidebarOpen(false); }} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
        width: '100%', padding: '12px 20px', border: 'none',
        background: section === item.id ? '#FEF2F2' : 'transparent',
        borderLeft: `3px solid ${section === item.id ? RED : 'transparent'}`,
        color: section === item.id ? '#B91C1C' : MID,
        fontWeight: section === item.id ? 700 : 400,
        fontSize: 13, cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter, sans-serif',
      }}>
        <span>{item.label}</span>
        {item.badge > 0 && (
          <span style={{ background: RED, color: '#fff', borderRadius: 99, minWidth: 18, height: 18,
            fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
            {item.badge}
          </span>
        )}
      </button>
    );
  }

  const SECTION_MAP = {
    dashboard: <SectionDashboard />,
    pros:      <SectionPros />,
    clients:   <SectionClients />,
    bookings:  <SectionBookings />,
    reviews:   <SectionReviews />,
    content:   <SectionContent />,
    security:  <SectionSecurity />,
    founders:  <SectionFounders />,
    notifs:    <SectionNotifs />,
  };

  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ background: INK, padding: '14px 24px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to="/" style={{ color: GOLD, fontWeight: 800, fontSize: 15, textDecoration: 'none' }}>MatchAfro</Link>
          <span style={{ color: '#444' }}>›</span>
          <span style={{ color: '#e0e0e0', fontSize: 14, fontWeight: 600 }}>Administration</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {unreadAdminCount > 0 && (
            <span style={{ background: RED, color: '#fff', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
              🔔 {unreadAdminCount}
            </span>
          )}
          <span style={{ background: RED, color: '#fff', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>🔴 Admin</span>
          <button onClick={() => setSidebarOpen(v => !v)} className="hide-desktop"
            style={{ background: 'none', border: '1px solid #333', color: '#9CA3AF', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 16 }}>☰</button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50 }} className="hide-desktop">
            <nav onClick={e => e.stopPropagation()}
              style={{ width: 240, height: '100%', background: '#fff', padding: '20px 0', overflowY: 'auto' }}>
              {nav.map(n => <NavBtn key={n.id} item={n} />)}
            </nav>
          </div>
        )}

        {/* Desktop sidebar */}
        <nav className="hide-mobile" style={{ width: 220, background: '#fff', borderRight: `1px solid ${LINE}`,
          padding: '20px 0', flexShrink: 0, overflowY: 'auto' }}>
          {nav.map(n => <NavBtn key={n.id} item={n} />)}
        </nav>

        {/* Main content */}
        <main style={{ flex: 1, padding: '24px 28px', overflowY: 'auto', minWidth: 0 }}>
          <AnimatePresence mode="wait">
            <motion.div key={section} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
              {SECTION_MAP[section] || null}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

/* ─── Entry point ─────────────────────────────────────────────────────── */
export default function AdminPage() {
  const { isAdmin } = useApp();
  if (!isAdmin) return <AdminLogin />;
  return <AdminPanel />;
}

/* ─── Shared styles ───────────────────────────────────────────────────── */
const SH       = { fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 };
const LS       = { display: 'block', fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 };
const FLEX_WRAP= { display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 };
const CAT_HEAD = { fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 };
