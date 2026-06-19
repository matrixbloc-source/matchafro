import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'framer-motion';
import {
  PAYS, getRegions, getDepts, getVilles, getArrs, hasArrs,
  buildLocationLabel,
} from '../data/locations.js';
import { useApp } from '../context/AppContext.jsx';

/* ─── Données de catégories ─────────────────────────────────── */
export const CATEGORIES = [
  { id: 'tresses',   label: 'Tresses',    icon: '🪢' },
  { id: 'knotless',  label: 'Knotless',   icon: '✨' },
  { id: 'vanilles',  label: 'Vanilles',   icon: '🌀' },
  { id: 'locks',     label: 'Locks',      icon: '🔒' },
  { id: 'perruques', label: 'Perruques',  icon: '👑' },
  { id: 'barber',    label: 'Barber',     icon: '✂️' },
  { id: 'maquillage',label: 'Maquillage', icon: '💄' },
  { id: 'onglerie',  label: 'Onglerie',   icon: '💅' },
];

const AVAILABILITY_OPTIONS = [
  { id: 'today',    label: 'Disponible aujourd\'hui', icon: '⚡' },
  { id: 'weekend',  label: 'Ce week-end',             icon: '📅' },
  { id: 'home',     label: 'Se déplace à domicile',   icon: '🏠' },
  { id: 'verified', label: 'Vérifié MatchAfro',       icon: '✅' },
  { id: 'founder',  label: 'Fondateur MatchAfro',     icon: '🏆' },
];

const DISTANCES = [
  { id: '5',  label: '5 km' },
  { id: '10', label: '10 km' },
  { id: '20', label: '20 km' },
  { id: '50', label: '50 km' },
];

/* ─── Mapping AppContext pros → format SearchEngine ──────────── */
function mapProsToCards(pros, reviews, avgRatingFn) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayDow = (new Date().getDay() + 6) % 7 + 1; // 1=Mon..7=Sun

  return pros
    .filter(p => p.verified && !p.suspended)
    .map(p => {
      const avail = p.availability ?? {};
      const minPrice = (p.services ?? []).reduce(
        (min, s) => Math.min(min, Number(s.price) || 999), 999
      );
      const revList = reviews.filter(r => r.proId === p.id);
      return {
        id: p.id, slug: p.slug, initials: p.initials, name: p.name,
        specialty: (p.categories ?? []).map(c => CATEGORIES.find(x => x.id === c)?.label).filter(Boolean).join(' & '),
        categories: p.categories ?? [],
        pays_id: p.pays_id, region_id: p.region_id, dept_id: p.dept_id, ville_id: p.ville_id, arr_id: p.arr_id,
        city: p.city,
        price: minPrice === 999 ? 0 : minPrice,
        rating: avgRatingFn(p.id),
        reviews: revList.length,
        gradient: p.gradient,
        tag: p.founder ? 'Fondateur' : 'Vérifié',
        today: !!(avail[todayDow]?.length) && !(p.blockedDates ?? []).includes(todayStr),
        weekend: !!(avail[6]?.length || avail[7]?.length),
        home: !!p.homeService,
        verified: !!p.verified,
        founder: !!p.founder,
      };
    });
}

/* ─── Jeu de données de démonstration (fallback visuel) ──────── */
const MOCK_PROS = [
  {
    id: 'p1', initials: 'AK', name: 'Amina Koné', specialty: 'Box Braids & Twists',
    categories: ['tresses', 'knotless'],
    pays_id: 'FR', region_id: 'IDF', dept_id: '75', ville_id: 'paris', arr_id: 'paris-arr-18',
    city: 'Paris 18e', price: 60, rating: 5.0, reviews: 128,
    gradient: 'linear-gradient(135deg, #F59E0B, #D97706)', tag: 'Top Pro',
    today: true, weekend: true, home: false, verified: true, founder: true,
  },
  {
    id: 'p2', initials: 'NS', name: 'Nadia Sow', specialty: 'Coiffure Naturelle & Locks',
    categories: ['locks', 'vanilles'],
    pays_id: 'FR', region_id: 'ARA', dept_id: '69', ville_id: 'lyon', arr_id: 'lyon-arr-7',
    city: 'Lyon 7e', price: 45, rating: 4.9, reviews: 97,
    gradient: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', tag: 'Certifiée',
    today: true, weekend: false, home: true, verified: true, founder: false,
  },
  {
    id: 'p3', initials: 'FD', name: 'Fatou Diallo', specialty: 'Maquillage Afro & Mariage',
    categories: ['maquillage'],
    pays_id: 'FR', region_id: 'PAC', dept_id: '13', ville_id: 'marseille', arr_id: 'marseille-arr-13',
    city: 'Marseille 13e', price: 80, rating: 5.0, reviews: 204,
    gradient: 'linear-gradient(135deg, #EC4899, #BE185D)', tag: 'Premium',
    today: false, weekend: true, home: true, verified: true, founder: true,
  },
  {
    id: 'p4', initials: 'SM', name: 'Sarah Mbaye', specialty: 'Nail Art & Onglerie',
    categories: ['onglerie'],
    pays_id: 'FR', region_id: 'NAQ', dept_id: '33', ville_id: 'bordeaux', arr_id: null,
    city: 'Bordeaux', price: 35, rating: 4.8, reviews: 76,
    gradient: 'linear-gradient(135deg, #10B981, #059669)', tag: 'Vérifiée',
    today: true, weekend: true, home: false, verified: true, founder: false,
  },
  {
    id: 'p5', initials: 'RT', name: 'Rokhaya Toure', specialty: 'Extensions & Tissage',
    categories: ['perruques', 'tresses'],
    pays_id: 'FR', region_id: 'HDF', dept_id: '59', ville_id: 'lille', arr_id: null,
    city: 'Lille', price: 120, rating: 4.9, reviews: 153,
    gradient: 'linear-gradient(135deg, #6366F1, #4338CA)', tag: 'Experte',
    today: false, weekend: true, home: true, verified: true, founder: true,
  },
  {
    id: 'p6', initials: 'CB', name: 'Claudine Ba', specialty: 'Soins Capillaires & Barber',
    categories: ['barber', 'locks'],
    pays_id: 'FR', region_id: 'OCC', dept_id: '31', ville_id: 'toulouse', arr_id: null,
    city: 'Toulouse', price: 55, rating: 5.0, reviews: 89,
    gradient: 'linear-gradient(135deg, #EF4444, #B91C1C)', tag: 'Premium',
    today: true, weekend: false, home: false, verified: true, founder: false,
  },
  {
    id: 'p7', initials: 'MD', name: 'Mariama Diop', specialty: 'Knotless & Vanilles',
    categories: ['knotless', 'vanilles'],
    pays_id: 'FR', region_id: 'IDF', dept_id: '93', ville_id: 'saint-denis-93', arr_id: null,
    city: 'Saint-Denis', price: 70, rating: 4.7, reviews: 62,
    gradient: 'linear-gradient(135deg, #D97706, #92400E)', tag: 'Montante',
    today: true, weekend: true, home: true, verified: true, founder: false,
  },
  {
    id: 'p8', initials: 'AO', name: 'Awa Ouédraogo', specialty: 'Tresses africaines',
    categories: ['tresses'],
    pays_id: 'FR', region_id: 'IDF', dept_id: '75', ville_id: 'paris', arr_id: 'paris-arr-10',
    city: 'Paris 10e', price: 50, rating: 4.8, reviews: 41,
    gradient: 'linear-gradient(135deg, #F59E0B, #B45309)', tag: 'Vérifiée',
    today: false, weekend: true, home: false, verified: true, founder: false,
  },
  {
    id: 'p9', initials: 'KN', name: 'Khadija Ndiaye', specialty: 'Perruques HD & Wig Install',
    categories: ['perruques'],
    pays_id: 'GP', region_id: 'R-GP', dept_id: '971', ville_id: 'pointe-a-pitre', arr_id: null,
    city: 'Pointe-à-Pitre', price: 90, rating: 4.9, reviews: 78,
    gradient: 'linear-gradient(135deg, #06B6D4, #0891B2)', tag: 'Premium',
    today: true, weekend: true, home: true, verified: true, founder: true,
  },
  {
    id: 'p10', initials: 'YS', name: 'Yasmine Sané', specialty: 'Maquillage & Onglerie',
    categories: ['maquillage', 'onglerie'],
    pays_id: 'SN', region_id: 'SN-DAK', dept_id: 'SN-01', ville_id: 'dakar', arr_id: null,
    city: 'Dakar', price: 30, rating: 5.0, reviews: 188,
    gradient: 'linear-gradient(135deg, #A855F7, #7C3AED)', tag: 'Experte',
    today: true, weekend: true, home: true, verified: true, founder: true,
  },
  {
    id: 'p11', initials: 'LC', name: 'Laëtitia Colas', specialty: 'Barber & Fades',
    categories: ['barber'],
    pays_id: 'FR', region_id: 'PAC', dept_id: '13', ville_id: 'marseille', arr_id: 'marseille-arr-6',
    city: 'Marseille 6e', price: 40, rating: 4.6, reviews: 55,
    gradient: 'linear-gradient(135deg, #14B8A6, #0D9488)', tag: 'Vérifiée',
    today: true, weekend: false, home: false, verified: true, founder: false,
  },
  {
    id: 'p12', initials: 'BK', name: 'Bintou Kouyaté', specialty: 'Locks & Entretien',
    categories: ['locks'],
    pays_id: 'CI', region_id: 'CI-LAG', dept_id: 'CI-01', ville_id: 'abidjan', arr_id: null,
    city: 'Abidjan', price: 25, rating: 4.9, reviews: 112,
    gradient: 'linear-gradient(135deg, #F97316, #EA580C)', tag: 'Top Pro',
    today: false, weekend: true, home: true, verified: true, founder: true,
  },
];

/* ─── Logique de filtrage ───────────────────────────────────── */
function applyFilters(pros, { pays, region, dept, ville, arr, cats, avail }) {
  return pros.filter(pro => {
    if (pays   && pro.pays_id   !== pays)   return false;
    if (region && pro.region_id !== region) return false;
    if (dept   && pro.dept_id   !== dept)   return false;
    if (ville  && pro.ville_id  !== ville)  return false;
    if (arr    && pro.arr_id    !== arr)    return false;
    if (cats.size > 0 && !pro.categories.some(c => cats.has(c))) return false;
    if (avail.has('today')    && !pro.today)    return false;
    if (avail.has('weekend')  && !pro.weekend)  return false;
    if (avail.has('home')     && !pro.home)     return false;
    if (avail.has('verified') && !pro.verified) return false;
    if (avail.has('founder')  && !pro.founder)  return false;
    return true;
  });
}

/* ─── Composants UI ─────────────────────────────────────────── */
function SelectField({ label, value, onChange, options, placeholder, disabled }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      {label && (
        <p style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 6 }}>
          {label}
        </p>
      )}
      <div style={{ position: 'relative' }}>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled || options.length === 0}
          className="ma-select"
          style={{
            appearance: 'none', WebkitAppearance: 'none',
            width: '100%', border: `1.5px solid ${value ? '#D97706' : '#E5E7EB'}`,
            borderRadius: 12, padding: '10px 36px 10px 14px',
            fontSize: 13, color: value ? '#111' : '#9CA3AF',
            background: (disabled || options.length === 0) ? '#F9FAFB' : '#fff',
            cursor: (disabled || options.length === 0) ? 'default' : 'pointer',
            fontFamily: 'Inter, sans-serif', outline: 'none',
            transition: 'border-color 0.2s',
            boxShadow: value ? '0 0 0 3px rgba(217,119,6,0.1)' : 'none',
          }}
          onFocus={e => { if (!disabled) e.target.style.borderColor = '#D97706'; }}
          onBlur={e => { if (!value) e.target.style.borderColor = '#E5E7EB'; }}
        >
          <option value="">{options.length === 0 && !disabled ? '— aucun —' : placeholder}</option>
          {options.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.name}</option>
          ))}
        </select>
        <svg
          viewBox="0 0 10 6" fill="none"
          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', width: 10, height: 6 }}
        >
          <path d="M1 1l4 4 4-4" stroke={value ? '#D97706' : '#9CA3AF'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

function PillToggle({ active, onClick, icon, label, color = '#D97706' }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '8px 14px', borderRadius: 100,
        border: `1.5px solid ${active ? color : '#E5E7EB'}`,
        background: active ? color + '14' : '#fff',
        color: active ? color : '#6B7280',
        fontSize: 13, fontWeight: active ? 600 : 500,
        cursor: 'pointer', transition: 'all 0.18s ease',
        fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
        boxShadow: active ? `0 0 0 3px ${color}20` : 'none',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = color; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280'; } }}
    >
      {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
      {label}
    </button>
  );
}

function ActiveTag({ label, onRemove }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        background: '#FFFBEB', border: '1px solid #FDE68A',
        color: '#92400E', fontSize: 12, fontWeight: 600,
        padding: '4px 10px', borderRadius: 100,
      }}
    >
      {label}
      <button
        onClick={onRemove}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B45309', fontSize: 14, lineHeight: 1, padding: 0, display: 'flex' }}
      >×</button>
    </motion.span>
  );
}

function ResultCard({ pro }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const navigate = useNavigate();

  function goToProfile() {
    if (pro.slug) navigate(`/pro/${pro.slug}`);
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={goToProfile}
      style={{
        background: '#fff', borderRadius: 20, overflow: 'hidden',
        border: `1.5px solid ${hovered ? '#E5E7EB' : '#F3F4F6'}`,
        boxShadow: hovered ? '0 16px 48px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.05)',
        transform: hovered ? 'translateY(-5px)' : 'none',
        transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
        cursor: pro.slug ? 'pointer' : 'default',
      }}
    >
      {/* Header gradient */}
      <div style={{ height: 120, background: pro.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 22,
          border: '2px solid rgba(255,255,255,0.35)',
          fontFamily: "'DM Serif Display', Georgia, serif",
        }}>{pro.initials}</div>

        {/* Badges */}
        <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
          <span style={{ background: 'rgba(255,255,255,0.93)', borderRadius: 100, padding: '3px 9px', fontSize: 10, fontWeight: 700, color: '#059669' }}>
            ✓ {pro.tag}
          </span>
          {pro.today && (
            <span style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: 100, padding: '2px 8px', fontSize: 9, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
              Dispo aujourd'hui
            </span>
          )}
          {pro.home && (
            <span style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)', borderRadius: 100, padding: '2px 8px', fontSize: 9, fontWeight: 700, color: '#fff' }}>
              🏠 À domicile
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 18px 20px' }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 2 }}>{pro.name}</p>
        <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 10 }}>{pro.specialty} · 📍 {pro.city}</p>

        {/* Categories */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
          {pro.categories.map(c => {
            const cat = CATEGORIES.find(x => x.id === c);
            return cat ? (
              <span key={c} style={{ fontSize: 10, background: '#F9FAFB', border: '1px solid #E5E7EB', color: '#6B7280', padding: '2px 8px', borderRadius: 100, fontWeight: 600 }}>
                {cat.icon} {cat.label}
              </span>
            ) : null;
          })}
        </div>

        {/* Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 1 }}>
            {[1,2,3,4,5].map(s => (
              <span key={s} style={{ color: s <= Math.floor(pro.rating) ? '#F59E0B' : '#E5E7EB', fontSize: 12 }}>★</span>
            ))}
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#111' }}>{pro.rating}</span>
          <span style={{ fontSize: 11, color: '#9CA3AF' }}>({pro.reviews})</span>
        </div>

        {/* Price + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 1 }}>À partir de</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#D97706' }}>{pro.price}€</p>
          </div>
          <span style={{
            background: hovered ? 'linear-gradient(135deg, #D97706, #B45309)' : '#F9FAFB',
            color: hovered ? '#fff' : '#374151',
            borderRadius: 10, padding: '8px 14px',
            fontSize: 12, fontWeight: 600,
            transition: 'all 0.22s ease',
            boxShadow: hovered ? '0 4px 14px rgba(217,119,6,0.3)' : 'none',
            fontFamily: 'Inter, sans-serif',
          }}>
            Voir le profil →
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Composant principal ───────────────────────────────────── */
export default function SearchEngine() {
  const { pros, reviews, avgRating } = useApp();

  /* Pros réels mappés + fallback mock pour richesse démo */
  const realCards = useMemo(() => mapProsToCards(pros, reviews, avgRating), [pros, reviews]);
  /* Pour la démo, on complète avec les mocks si les slugs n'existent pas encore */
  const allCards = useMemo(() => {
    const realIds = new Set(realCards.map(c => c.id));
    const extras = MOCK_PROS.filter(m => !realIds.has(m.id));
    return [...realCards, ...extras];
  }, [realCards]);

  /* Localisation */
  const [pays,   setPays]   = useState('');
  const [region, setRegion] = useState('');
  const [dept,   setDept]   = useState('');
  const [ville,  setVille]  = useState('');
  const [arr,    setArr]    = useState('');

  /* Filtres */
  const [cats,   setCats]   = useState(new Set());
  const [avail,  setAvail]  = useState(new Set());
  const [distance, setDistance] = useState('');

  /* UI */
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [searched, setSearched] = useState(false);

  /* Listes dérivées (cascading) */
  const regions = useMemo(() => pays ? getRegions(pays) : [], [pays]);
  const depts   = useMemo(() => region ? getDepts(region) : [], [region]);
  const villes  = useMemo(() => dept ? getVilles(dept) : [], [dept]);
  const arrs    = useMemo(() => ville && hasArrs(ville) ? getArrs(ville) : [], [ville]);

  /* Handlers localisation */
  function handlePays(v) { setPays(v); setRegion(''); setDept(''); setVille(''); setArr(''); }
  function handleRegion(v) { setRegion(v); setDept(''); setVille(''); setArr(''); }
  function handleDept(v) { setDept(v); setVille(''); setArr(''); }
  function handleVille(v) { setVille(v); setArr(''); }

  /* Handlers filtres */
  function toggleCat(id) {
    setCats(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function toggleAvail(id) {
    setAvail(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  /* Reset */
  function reset() {
    setPays(''); setRegion(''); setDept(''); setVille(''); setArr('');
    setCats(new Set()); setAvail(new Set()); setDistance('');
    setSearched(false);
  }

  /* Résultats */
  const results = useMemo(
    () => applyFilters(allCards, { pays, region, dept, ville, arr, cats, avail }),
    [allCards, pays, region, dept, ville, arr, cats, avail]
  );

  /* Tags actifs */
  const activeTags = useMemo(() => {
    const tags = [];
    if (pays)     tags.push({ id: 'pays',   label: PAYS.find(p => p.id === pays)?.name ?? pays, clear: () => handlePays('') });
    if (region)   tags.push({ id: 'region', label: regions.find(r => r.id === region)?.name ?? region, clear: () => handleRegion('') });
    if (dept)     tags.push({ id: 'dept',   label: depts.find(d => d.id === dept)?.name ?? dept, clear: () => { setDept(''); setVille(''); setArr(''); } });
    if (ville)    tags.push({ id: 'ville',  label: villes.find(v => v.id === ville)?.name ?? ville, clear: () => { setVille(''); setArr(''); } });
    if (arr)      tags.push({ id: 'arr',    label: arrs.find(a => a.id === arr)?.short ?? arr, clear: () => setArr('') });
    if (distance) tags.push({ id: 'dist',   label: `< ${distance} km`, clear: () => setDistance('') });
    cats.forEach(c => {
      const cat = CATEGORIES.find(x => x.id === c);
      if (cat) tags.push({ id: `cat-${c}`, label: `${cat.icon} ${cat.label}`, clear: () => toggleCat(c) });
    });
    avail.forEach(a => {
      const opt = AVAILABILITY_OPTIONS.find(x => x.id === a);
      if (opt) tags.push({ id: `avail-${a}`, label: opt.label, clear: () => toggleAvail(a) });
    });
    return tags;
  }, [pays, region, dept, ville, arr, distance, cats, avail, regions, depts, villes, arrs]);

  const activeCount = activeTags.length;

  /* Groupement des pays par catégorie */
  const paysGroups = useMemo(() => {
    const groups = {};
    PAYS.forEach(p => {
      if (!groups[p.group]) groups[p.group] = [];
      groups[p.group].push(p);
    });
    return groups;
  }, []);

  return (
    <section id="recherche" style={{ background: '#F7F7F7', padding: 'clamp(64px,8vw,96px) 24px' }}>
      <style>{`
        .ma-select option { color: #111; background: #fff; }
        @media (max-width: 900px) {
          .search-loc-row { flex-direction: column !important; }
          .search-loc-row > div { width: 100% !important; min-width: unset !important; }
          .filter-pill-row { gap: 8px !important; }
        }
        @media (max-width: 640px) {
          .filter-avail-row { flex-direction: column !important; align-items: flex-start !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
          <div>
            <span className="section-tag">Moteur de recherche</span>
            <h2 className="serif" style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 400, color: '#0F0F0F', lineHeight: 1.1, marginTop: 4 }}>
              Trouvez votre <em style={{ fontStyle: 'italic', color: '#D97706' }}>professionnel</em>
            </h2>
          </div>
          <button
            onClick={() => setFiltersOpen(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#fff', border: '1.5px solid #E5E7EB',
              borderRadius: 12, padding: '9px 16px', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, color: '#374151',
              fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#D97706'; e.currentTarget.style.color = '#D97706'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#374151'; }}
          >
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
              <path d="M1 4h14M4 8h8M7 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Filtres
            {activeCount > 0 && (
              <span style={{ background: '#D97706', color: '#fff', borderRadius: 100, width: 18, height: 18, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {activeCount}
              </span>
            )}
            <motion.span animate={{ rotate: filtersOpen ? 180 : 0 }} transition={{ duration: 0.25 }} style={{ display: 'flex' }}>
              <svg viewBox="0 0 10 6" fill="none" width="10" height="6">
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.span>
          </button>
        </div>

        {/* Filter panel */}
        <AnimatePresence initial={false}>
          {filtersOpen && (
            <motion.div
              key="filters"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 28 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                background: '#fff', borderRadius: 20,
                border: '1.5px solid #EBEBEB',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                overflow: 'hidden',
              }}>

                {/* ── Localisation ── */}
                <div style={{ padding: '24px 24px 20px' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1.4px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>📍</span> Localisation
                  </p>
                  <div className="search-loc-row" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>

                    {/* Pays — custom grouped select */}
                    <div style={{ flex: 1, minWidth: 140 }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 6 }}>Pays</p>
                      <div style={{ position: 'relative' }}>
                        <select
                          value={pays} onChange={e => handlePays(e.target.value)}
                          style={{
                            appearance: 'none', WebkitAppearance: 'none',
                            width: '100%', border: `1.5px solid ${pays ? '#D97706' : '#E5E7EB'}`,
                            borderRadius: 12, padding: '10px 36px 10px 14px',
                            fontSize: 13, color: pays ? '#111' : '#9CA3AF',
                            background: '#fff', cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif', outline: 'none',
                            boxShadow: pays ? '0 0 0 3px rgba(217,119,6,0.1)' : 'none',
                          }}
                        >
                          <option value="">Tous les pays</option>
                          {Object.entries(paysGroups).map(([group, list]) => (
                            <optgroup key={group} label={group}>
                              {list.map(p => (
                                <option key={p.id} value={p.id}>{p.flag} {p.name}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        <svg viewBox="0 0 10 6" fill="none" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', width: 10, height: 6 }}>
                          <path d="M1 1l4 4 4-4" stroke={pays ? '#D97706' : '#9CA3AF'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>

                    <SelectField label="Région"      value={region} onChange={handleRegion} options={regions} placeholder="Toutes les régions"    disabled={!pays} />
                    <SelectField label="Département" value={dept}   onChange={handleDept}   options={depts}   placeholder="Tous les départements"  disabled={!region} />
                    <SelectField label="Ville"       value={ville}  onChange={handleVille}  options={villes}  placeholder="Toutes les villes"       disabled={!dept} />
                    <SelectField
                      label={
                        ville === 'paris' ? 'Arrondissement (Paris)' :
                        ville === 'lyon' ? 'Arrondissement (Lyon)' :
                        ville === 'marseille' ? 'Arrondissement (Marseille)' :
                        'Arrondissement'
                      }
                      value={arr} onChange={setArr}
                      options={arrs}
                      placeholder="Tous les arrondissements"
                      disabled={arrs.length === 0}
                    />
                  </div>
                </div>

                <div style={{ height: 1, background: '#F3F4F6', margin: '0 24px' }} />

                {/* ── Distance ── */}
                <div style={{ padding: '16px 24px' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1.4px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>🔵</span> Distance
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {DISTANCES.map(d => (
                      <PillToggle
                        key={d.id}
                        active={distance === d.id}
                        onClick={() => setDistance(prev => prev === d.id ? '' : d.id)}
                        label={d.label}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ height: 1, background: '#F3F4F6', margin: '0 24px' }} />

                {/* ── Catégories ── */}
                <div style={{ padding: '16px 24px' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1.4px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>✂️</span> Spécialité
                  </p>
                  <div className="filter-pill-row" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {CATEGORIES.map(cat => (
                      <PillToggle
                        key={cat.id}
                        active={cats.has(cat.id)}
                        onClick={() => toggleCat(cat.id)}
                        icon={cat.icon}
                        label={cat.label}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ height: 1, background: '#F3F4F6', margin: '0 24px' }} />

                {/* ── Disponibilité ── */}
                <div style={{ padding: '16px 24px' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1.4px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>⚡</span> Disponibilité & Statut
                  </p>
                  <div className="filter-pill-row" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {AVAILABILITY_OPTIONS.map(opt => (
                      <PillToggle
                        key={opt.id}
                        active={avail.has(opt.id)}
                        onClick={() => toggleAvail(opt.id)}
                        icon={opt.icon}
                        label={opt.label}
                        color={opt.id === 'verified' ? '#059669' : opt.id === 'founder' ? '#7C3AED' : '#D97706'}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ height: 1, background: '#F3F4F6' }} />

                {/* ── Actions ── */}
                <div style={{
                  padding: '16px 24px', display: 'flex',
                  alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
                  background: '#FAFAFA',
                }}>
                  <button
                    onClick={reset}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 13, color: '#9CA3AF', fontWeight: 500,
                      fontFamily: 'Inter, sans-serif', padding: 0,
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                    onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}
                  >
                    ✕ Réinitialiser les filtres
                  </button>
                  <button
                    onClick={() => setSearched(true)}
                    className="btn-primary"
                    style={{ borderRadius: 12, padding: '11px 28px', fontSize: 14, fontWeight: 700 }}
                  >
                    Rechercher — {results.length} résultat{results.length !== 1 ? 's' : ''}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filtres actifs */}
        <AnimatePresence>
          {activeTags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24, alignItems: 'center' }}
            >
              <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>Filtres :</span>
              <AnimatePresence>
                {activeTags.map(tag => (
                  <ActiveTag key={tag.id} label={tag.label} onRemove={tag.clear} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Résultats ── */}
        <div>
          {/* Compteur */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AnimatePresence mode="wait">
                <motion.p
                  key={results.length}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  style={{ fontSize: 16, fontWeight: 700, color: '#0F0F0F' }}
                >
                  {results.length} professionnel{results.length !== 1 ? 's' : ''} trouvé{results.length !== 1 ? 's' : ''}
                </motion.p>
              </AnimatePresence>
              {activeTags.length > 0 && (
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>avec {activeTags.length} filtre{activeTags.length > 1 ? 's' : ''}</span>
              )}
            </div>

            {/* Tri */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>Trier par :</span>
              {['Pertinence', 'Note', 'Prix croissant'].map((label, i) => (
                <button key={label} style={{
                  background: i === 0 ? '#0F0F0F' : '#fff',
                  color: i === 0 ? '#fff' : '#6B7280',
                  border: `1px solid ${i === 0 ? '#0F0F0F' : '#E5E7EB'}`,
                  borderRadius: 8, padding: '5px 12px',
                  fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
                }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {results.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                textAlign: 'center', padding: 'clamp(48px,6vw,80px) 24px',
                background: '#fff', borderRadius: 20, border: '1.5px solid #F3F4F6',
              }}
            >
              <p style={{ fontSize: 48, marginBottom: 16 }}>🔍</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 8 }}>Aucun résultat</p>
              <p style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 24 }}>
                Essayez d'élargir vos filtres ou de choisir une zone géographique différente.
              </p>
              <button onClick={reset} className="btn-secondary" style={{ padding: '10px 22px', borderRadius: 12, fontSize: 14 }}>
                Réinitialiser les filtres
              </button>
            </motion.div>
          ) : (
            <motion.div
              layout
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}
            >
              <AnimatePresence>
                {results.map(pro => (
                  <ResultCard key={pro.id} pro={pro} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
