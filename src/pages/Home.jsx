import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SmartCalendar from '../components/SmartCalendar.jsx';
import { useApp } from '../context/AppContext.jsx';

/* ─── Design tokens ──────────────────────────────────────────────────── */
const F = "'Fraunces', Georgia, serif";
const INK = '#0B0B0C';
const BRONZE = '#A87E3C';
const DEEP = '#8A6526';
const LIGHT = '#C9A35F';
const CREAM = '#FAF7F1';
const MIST = '#F4F1EC';
const LINE = '#E8E3DA';
const EASE = [0.22, 1, 0.36, 1];
const SHELL = { maxWidth: 1240, margin: '0 auto' };

/* ─── Shared icons ───────────────────────────────────────────────────── */
function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: BRONZE, flexShrink: 0 }}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon({ size = 18, color = BRONZE }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ color, flexShrink: 0 }}>
      <path d="M12 21s7-5.686 7-11a7 7 0 1 0-14 0c0 5.314 7 11 7 11Z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

/* ─── Count-up hook ──────────────────────────────────────────────────── */
function useCountUp(target, duration, active) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t0 = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, target, duration]);
  return value;
}

/* ─── 1. HERO ────────────────────────────────────────────────────────── */
const HEADLINE = [
  ['Réservez', 'les', 'meilleurs'],
  ['experts', 'beauté', 'afro.'],
];

function Hero() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCity,  setSearchCity]  = useState('');

  function handleSearch(e) {
    e.preventDefault();
    const el = document.getElementById('calendrier');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <section id="top" style={{
      position: 'relative', minHeight: '100vh',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      padding: 'clamp(100px,12vw,144px) clamp(20px,5vw,40px) 80px',
      overflow: 'hidden',
    }}>
      <style>{`
        @media (max-width: 640px) {
          .hero-search { flex-direction: column !important; }
          .hero-search .vsep { display: none !important; }
          .hero-search button { border-radius: 12px !important; margin: 0 !important; width: 100% !important; }
        }
        @media (max-width: 480px) {
          .hero-trust { gap: 16px !important; flex-direction: column !important; align-items: flex-start !important; }
          .hero-trust .trust-sep { display: none !important; }
          .hero-ctas { gap: 16px !important; }
        }
      `}</style>

      {/* Ambient glow */}
      <div style={{
        position: 'absolute', right: -160, top: -160,
        width: 620, height: 620, borderRadius: '50%',
        opacity: 0.07, filter: 'blur(60px)', pointerEvents: 'none',
        background: `radial-gradient(circle, ${BRONZE} 0%, transparent 70%)`,
      }} />

      <div style={SHELL}>
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}
        >
          <span style={{ height: 1, width: 40, background: BRONZE, display: 'inline-block' }} />
          <span style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em', color: DEEP }}>
            La beauté afro, sur rendez-vous
          </span>
        </motion.div>

        {/* Headline — line-by-line word reveal */}
        <h1 style={{
          fontFamily: F, fontWeight: 500, letterSpacing: '-0.04em',
          lineHeight: 1.02, fontSize: 'clamp(48px,7vw,88px)',
          maxWidth: 900, color: INK, margin: 0,
        }}>
          {HEADLINE.map((line, li) => (
            <span key={li} style={{ display: 'block', overflow: 'hidden' }}>
              <span style={{ display: 'flex', flexWrap: 'wrap', columnGap: '0.28em' }}>
                {line.map((word, wi) => {
                  const isAccent = word === 'afro.';
                  return (
                    <motion.span
                      key={wi}
                      initial={{ y: '110%' }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.8, ease: EASE, delay: 0.15 + (li * 3 + wi) * 0.07 }}
                      style={{
                        display: 'inline-block',
                        fontStyle: isAccent ? 'italic' : 'normal',
                        color: isAccent ? BRONZE : INK,
                      }}
                    >
                      {word}
                    </motion.span>
                  );
                })}
              </span>
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.7 }}
          style={{ marginTop: 28, maxWidth: 580, fontSize: 18, lineHeight: 1.6, color: 'rgba(11,11,12,0.6)' }}
        >
          Tresses, locks, perruques, barber, maquillage et onglerie près de chez vous.
          Des artisans vérifiés, une réservation en quelques secondes.
        </motion.p>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.85 }}
          style={{ marginTop: 40, maxWidth: 680 }}
        >
          <form role="search" onSubmit={handleSearch} className="hero-search" style={{
            display: 'flex', alignItems: 'center',
            border: `1px solid ${LINE}`, background: '#fff',
            padding: 8, borderRadius: 16, gap: 0,
            boxShadow: '0 1px 2px rgba(11,11,12,0.04), 0 12px 40px -12px rgba(11,11,12,0.12)',
          }}>
            <label htmlFor="hero-search-service" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>Prestation</label>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
              <SearchIcon />
              <input
                id="hero-search-service"
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Quelle prestation ?"
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: 15, background: 'transparent', fontFamily: 'Inter, sans-serif' }}
              />
            </div>
            <div className="vsep" style={{ height: 32, width: 1, background: LINE, flexShrink: 0 }} />
            <label htmlFor="hero-search-city" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>Ville</label>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
              <PinIcon />
              <input
                id="hero-search-city"
                type="search"
                value={searchCity}
                onChange={e => setSearchCity(e.target.value)}
                placeholder="Où ? (ville)"
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: 15, background: 'transparent', fontFamily: 'Inter, sans-serif' }}
              />
            </div>
            <button type="submit" style={{
              margin: 4, padding: '12px 24px', borderRadius: 12, flexShrink: 0,
              background: INK, color: '#fff', border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 500, fontFamily: 'Inter, sans-serif',
            }}>
              Rechercher
            </button>
          </form>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 1 }}
          className="hero-ctas"
          style={{ marginTop: 28, display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}
        >
          <a href="#vedettes" onClick={e => { e.preventDefault(); document.getElementById('vedettes')?.scrollIntoView({ behavior: 'smooth' }); }} style={{
            fontSize: 14, fontWeight: 500, color: INK,
            textDecoration: 'underline', textDecorationColor: BRONZE,
            textDecorationThickness: 2, textUnderlineOffset: 6,
          }}>
            Trouver un professionnel
          </a>
          <Link to="/devenir-professionnel" style={{ fontSize: 14, fontWeight: 500, color: 'rgba(11,11,12,0.5)', textDecoration: 'none' }}>
            Devenir professionnel →
          </Link>
        </motion.div>

        {/* Trust row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: EASE, delay: 1.2 }}
          className="hero-trust"
          style={{ marginTop: 80, display: 'flex', gap: 40, alignItems: 'center', flexWrap: 'wrap', fontSize: 14, color: 'rgba(11,11,12,0.45)' }}
        >
          <span>
            <b style={{ fontFamily: F, fontSize: 18, fontWeight: 500, color: INK, marginRight: 6 }}>5 000+</b>
            artisans vérifiés
          </span>
          <span className="trust-sep" style={{ height: 16, width: 1, background: LINE }} />
          <span>
            <b style={{ fontFamily: F, fontSize: 18, fontWeight: 500, color: INK, marginRight: 6 }}>12</b>
            pays couverts
          </span>
          <span className="trust-sep" style={{ height: 16, width: 1, background: LINE }} />
          <span>
            <b style={{ fontFamily: F, fontSize: 18, fontWeight: 500, color: INK, marginRight: 6 }}>4,9/5</b>
            note moyenne
          </span>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── 2. CATEGORIES ──────────────────────────────────────────────────── */
const CATS = [
  { name: 'Tresses',    slug: 'tresses',    note: 'Box braids, fulani, cornrows', img: 'https://images.unsplash.com/photo-1626954079979-ec4f7b05e032?q=80&w=1200&auto=format&fit=crop' },
  { name: 'Locks',      slug: 'locks',      note: 'Démarrage, entretien, retwist', img: 'https://images.unsplash.com/photo-1605980776566-0486c3ac7617?q=80&w=1200&auto=format&fit=crop' },
  { name: 'Perruques',  slug: 'perruques',  note: 'Pose, customisation, lace', img: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=1200&auto=format&fit=crop' },
  { name: 'Barber',     slug: 'barber',     note: 'Coupe, dégradé, contours', img: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1200&auto=format&fit=crop' },
  { name: 'Maquillage', slug: 'maquillage', note: 'Jour, soirée, événement', img: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=1200&auto=format&fit=crop' },
  { name: 'Onglerie',   slug: 'onglerie',   note: 'Pose, nail art, soin', img: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=1200&auto=format&fit=crop' },
];

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Categories() {
  return (
    <section id="categories" style={{ padding: 'clamp(72px,9vw,112px) clamp(20px,5vw,40px)' }}>
      <style>{`
        .cat-card:hover img { transform: scale(1.06); }
        .cat-card:hover .cat-arrow { background: #fff !important; color: ${INK} !important; border-color: #fff !important; }
        @media (max-width: 900px) { .grid3 { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 580px) { .grid3 { grid-template-columns: 1fr !important; } }
      `}</style>
      <div style={SHELL}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, marginBottom: 56, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span style={{ height: 1, width: 40, background: BRONZE }} />
              <span style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em', color: DEEP }}>Prestations</span>
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, ease: EASE }}
              style={{ fontFamily: F, fontWeight: 500, letterSpacing: '-0.04em', lineHeight: 1.1, fontSize: 'clamp(32px,4vw,48px)', maxWidth: 560, color: INK, margin: 0 }}
            >
              Un savoir-faire pour chaque style.
            </motion.h2>
          </div>
          <p style={{ maxWidth: 280, fontSize: 15, lineHeight: 1.6, color: 'rgba(11,11,12,0.55)' }}>
            Six familles de prestations, des centaines d'artisans spécialisés. Trouvez la main experte qu'il vous faut.
          </p>
        </div>

        {/* Grid */}
        <div className="grid3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {CATS.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, ease: EASE, delay: (i % 3) * 0.08 }}
            >
            <Link
              to={`/categorie/${cat.slug}`}
              className="cat-card"
              style={{
                display: 'block', borderRadius: 24, overflow: 'hidden',
                background: MIST, textDecoration: 'none', cursor: 'pointer',
              }}
            >
              <div style={{ position: 'relative', aspectRatio: '4/5', overflow: 'hidden' }}>
                <img
                  src={cat.img}
                  alt={cat.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 1.1s cubic-bezier(0.22,1,0.36,1)' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(11,11,12,0.7), rgba(11,11,12,0.1), transparent)' }} />
                <div style={{ position: 'absolute', inset: 'auto 0 0 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: 24 }}>
                  <div>
                    <h3 style={{ fontFamily: F, fontSize: 24, fontWeight: 500, color: '#fff', margin: 0 }}>{cat.name}</h3>
                    <p style={{ marginTop: 4, fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{cat.note}</p>
                  </div>
                  <span className="cat-arrow" style={{
                    height: 40, width: 40, borderRadius: '50%', flexShrink: 0,
                    border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', transition: 'all 0.5s',
                  }}>
                    <ArrowIcon />
                  </span>
                </div>
              </div>
            </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 3. FEATURED ────────────────────────────────────────────────────── */
function Featured() {
  const { pros, avgRating } = useApp();

  const featured = pros
    .filter(p => p.active !== false && !p.suspended && p.slug)
    .sort((a, b) => {
      // Real registered pros always appear before demo placeholders
      const aDemo = a.id.startsWith('demo-');
      const bDemo = b.id.startsWith('demo-');
      if (aDemo !== bDemo) return aDemo ? 1 : -1;
      // Within same group: founders first, then by views
      if (a.founder !== b.founder) return a.founder ? -1 : 1;
      return (b.views || 0) - (a.views || 0);
    })
    .slice(0, 4);

  return (
    <section id="vedettes" style={{ background: CREAM, padding: 'clamp(72px,9vw,112px) clamp(20px,5vw,40px)' }}>
      <style>{`
        .pro-card:hover { transform: translateY(-4px) !important; box-shadow: 0 24px 60px -20px rgba(11,11,12,0.18) !important; }
        .pro-card:hover .pro-card-img { transform: scale(1.05) !important; }
        @media (max-width: 900px) { .grid4 { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 580px) { .grid4 { grid-template-columns: 1fr !important; } }
        @media (max-width: 480px) { .featured-header { flex-direction: column !important; align-items: flex-start !important; } }
        @media (max-width: 768px) { .pro-card-photo { max-height: 220px !important; aspect-ratio: unset !important; } }
        @media (max-width: 480px) { .pro-card-photo { max-height: 180px !important; } }
      `}</style>
      <div style={SHELL}>
        <div className="featured-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, marginBottom: 56, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span style={{ height: 1, width: 40, background: BRONZE }} />
              <span style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em', color: DEEP }}>Vedettes</span>
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, ease: EASE }}
              style={{ fontFamily: F, fontWeight: 500, letterSpacing: '-0.04em', lineHeight: 1.1, fontSize: 'clamp(32px,4vw,48px)', maxWidth: 560, color: INK, margin: 0 }}
            >
              Les artisans les plus demandés.
            </motion.h2>
          </div>
          <a href="#calendrier" onClick={e => { e.preventDefault(); document.getElementById('calendrier')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ fontSize: 14, fontWeight: 500, color: INK, textDecoration: 'none' }}>
            Voir tous les professionnels →
          </a>
        </div>

        {featured.length === 0 ? (
          <p style={{ color: 'rgba(11,11,12,0.4)', fontFamily: 'Inter, sans-serif', textAlign: 'center', padding: '40px 0', fontSize: 15 }}>
            Aucun professionnel disponible pour le moment.
          </p>
        ) : (
          <div className="grid4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
            {featured.map((pro, i) => {
              const photo    = (pro.photos || []).filter(Boolean)[0] || null;
              const rating   = avgRating(pro.id);
              const services = pro.services || [];
              const prices   = services.map(s => Number(s.price) || 0).filter(Boolean);
              const minPrice = prices.length ? Math.min(...prices) : null;
              const craft    = services.length > 0
                ? services[0].name
                : (pro.categories || []).map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(' & ') || 'Beauté afro';

              return (
                <motion.div
                  key={pro.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.7, ease: EASE, delay: (i % 4) * 0.07 }}
                >
                  <Link
                    to={`/pro/${pro.slug}`}
                    className="pro-card"
                    style={{
                      display: 'block', border: `1px solid ${LINE}`, borderRadius: 24,
                      overflow: 'hidden', background: '#fff', textDecoration: 'none',
                      transition: 'all 0.5s', cursor: 'pointer',
                    }}
                  >
                    <div className="pro-card-photo" style={{ position: 'relative', aspectRatio: '5/6', overflow: 'hidden' }}>
                      {photo ? (
                        <img
                          src={photo}
                          alt={pro.name}
                          className="pro-card-img"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 1.1s cubic-bezier(0.22,1,0.36,1)' }}
                        />
                      ) : (
                        <div
                          className="pro-card-img"
                          style={{
                            width: '100%', height: '100%',
                            background: pro.gradient || `linear-gradient(135deg, ${BRONZE}, ${DEEP})`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'transform 1.1s cubic-bezier(0.22,1,0.36,1)',
                          }}
                        >
                          <span style={{ fontFamily: F, fontSize: 72, fontWeight: 900, color: 'rgba(255,255,255,0.45)', letterSpacing: '-0.04em' }}>
                            {pro.initials || pro.name.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                      {rating > 0 && (
                        <div style={{
                          position: 'absolute', right: 12, top: 12,
                          display: 'flex', alignItems: 'center', gap: 4,
                          background: 'rgba(255,255,255,0.95)', padding: '4px 10px',
                          borderRadius: 999, fontSize: 12, fontWeight: 600, color: INK,
                        }}>
                          ★ {rating.toFixed(1)}
                        </div>
                      )}
                      {pro.founder && (
                        <div style={{
                          position: 'absolute', left: 12, top: 12,
                          background: 'rgba(212,165,116,0.95)', padding: '3px 9px',
                          borderRadius: 999, fontSize: 10, fontWeight: 700, color: '#0B0B0B',
                          letterSpacing: '0.08em', textTransform: 'uppercase',
                        }}>
                          Fondateur #{pro.founderNumber}
                        </div>
                      )}
                    </div>
                    <div style={{ padding: 20 }}>
                      <h3 style={{ fontFamily: F, fontSize: 18, fontWeight: 500, color: INK, margin: 0 }}>{pro.name}</h3>
                      <p style={{ marginTop: 2, fontSize: 14, color: DEEP }}>{craft}</p>
                      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${LINE}`, paddingTop: 16, fontSize: 14, color: 'rgba(11,11,12,0.55)' }}>
                        <span>◍ {pro.city || 'France'}</span>
                        {minPrice && (
                          <span>dès <b style={{ fontFamily: F, fontSize: 16, fontWeight: 500, color: INK }}>{minPrice}€</b></span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── 4. HOW IT WORKS ────────────────────────────────────────────────── */
const STEPS = [
  { n: '01', title: 'Rechercher', body: 'Filtrez par prestation, ville et budget. Comparez les portfolios, les notes et les disponibilités réelles.' },
  { n: '02', title: 'Réserver', body: 'Choisissez votre créneau et confirmez en quelques secondes. Confirmation immédiate, paiement directement à l\'artisan.' },
  { n: '03', title: 'Profiter', body: 'Présentez-vous, détendez-vous, repartez sublimée. Laissez un avis pour la prochaine cliente.' },
];

function HowItWorks() {
  return (
    <section id="etapes" style={{ padding: 'clamp(72px,9vw,112px) clamp(20px,5vw,40px)' }}>
      <style>{`
        .step-cell:hover { background: ${CREAM} !important; }
        .step-cell:hover .step-num { color: ${BRONZE} !important; }
        @media (max-width: 700px) { .steps-grid { grid-template-columns: 1fr !important; } }
      `}</style>
      <div style={SHELL}>
        <div style={{ maxWidth: 640, marginBottom: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span style={{ height: 1, width: 40, background: BRONZE }} />
            <span style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em', color: DEEP }}>Comment ça marche</span>
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: EASE }}
            style={{ fontFamily: F, fontWeight: 500, letterSpacing: '-0.04em', lineHeight: 1.1, fontSize: 'clamp(32px,4vw,48px)', color: INK, margin: 0 }}
          >
            Trois étapes, zéro friction.
          </motion.h2>
        </div>

        <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, border: `1px solid ${LINE}`, borderRadius: 24, overflow: 'hidden', background: LINE }}>
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              className="step-cell"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, ease: EASE, delay: i * 0.12 }}
              style={{ background: '#fff', padding: 44, transition: 'background 0.5s' }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 32 }}>
                <span className="step-num" style={{ fontFamily: F, fontSize: 48, fontWeight: 500, color: 'rgba(168,126,60,0.3)', transition: 'color 0.5s' }}>
                  {step.n}
                </span>
                <span style={{ height: 1, flex: 1, background: LINE }} />
              </div>
              <h3 style={{ fontFamily: F, fontSize: 24, fontWeight: 500, color: INK, margin: 0 }}>{step.title}</h3>
              <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.6, color: 'rgba(11,11,12,0.55)' }}>{step.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 5. LAUNCH OFFER ────────────────────────────────────────────────── */
function LaunchOffer() {
  const { founderCount, founderSlotsLeft, founderLimit } = useApp();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-120px' });
  const isFull = founderCount >= founderLimit;
  const count = useCountUp(founderSlotsLeft, 1600, inView);
  const pct = Math.min((founderCount / founderLimit) * 100, 100);

  return (
    <section id="offre" style={{ padding: '64px clamp(20px,5vw,40px)' }}>
      <style>{`
        @keyframes ping-dot { 75%, 100% { transform: scale(2.5); opacity: 0; } }
        @media (max-width: 700px) {
          .offer-grid { grid-template-columns: 1fr !important; gap: 36px !important; }
        }
        @media (max-width: 480px) {
          .offer-grid { gap: 24px !important; }
        }
      `}</style>
      <div style={SHELL} ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: EASE }}
          style={{ position: 'relative', overflow: 'hidden', borderRadius: 32, background: INK, padding: 'clamp(48px,6vw,96px) clamp(32px,6vw,80px)' }}
        >
          {/* Glows */}
          <div style={{ position: 'absolute', left: -128, top: -128, width: 500, height: 500, borderRadius: '50%', opacity: 0.3, filter: 'blur(60px)', background: `radial-gradient(circle, ${BRONZE} 0%, transparent 70%)`, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: -80, bottom: -160, width: 400, height: 400, borderRadius: '50%', opacity: 0.2, filter: 'blur(60px)', background: `radial-gradient(circle, ${LIGHT} 0%, transparent 70%)`, pointerEvents: 'none' }} />

          <div className="offer-grid" style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
            {/* Left */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <span style={{ position: 'relative', height: 8, width: 8, flexShrink: 0 }}>
                  <span style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    background: LIGHT, opacity: 0.75,
                    animation: 'ping-dot 1.5s cubic-bezier(0,0,0.2,1) infinite',
                  }} />
                  <span style={{ position: 'relative', display: 'block', height: 8, width: 8, borderRadius: '50%', background: LIGHT }} />
                </span>
                <span style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em', color: LIGHT }}>
                  Offre de lancement
                </span>
              </div>

              <h2 style={{ fontFamily: F, fontWeight: 500, letterSpacing: '-0.04em', lineHeight: 1.08, fontSize: 'clamp(28px,3.5vw,52px)', color: '#fff', margin: 0 }}>
                Les 50 premiers professionnels obtiennent{' '}
                <span style={{ fontStyle: 'italic', color: LIGHT }}>l'accès gratuit à vie.</span>
              </h2>

              <p style={{ marginTop: 24, maxWidth: 440, fontSize: 15, lineHeight: 1.6, color: 'rgba(255,255,255,0.55)' }}>
                Aucun abonnement, jamais. Badge Fondateur exclusif.
                Rejoignez celles et ceux qui bâtissent MatchAfro avec nous.
              </p>

              <a href="/devenir-professionnel" style={{
                marginTop: 36, display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#fff', color: INK, padding: '14px 28px',
                borderRadius: 999, fontSize: 14, fontWeight: 500, textDecoration: 'none',
              }}>
                Réclamer ma place →
              </a>
            </div>

            {/* Right — counter */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(4px)',
                borderRadius: 24, padding: 'clamp(32px,4vw,48px) clamp(24px,4vw,40px)',
              }}>
                {isFull ? (
                  <>
                    <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: LIGHT, marginBottom: 16 }}>
                      Programme Fondateur terminé
                    </span>
                    <span style={{ fontFamily: F, fontSize: 'clamp(48px,6vw,80px)', fontWeight: 500, lineHeight: 1, color: '#fff' }}>
                      {founderLimit}
                    </span>
                    <span style={{ marginTop: 8, fontFamily: F, fontSize: 20, fontWeight: 400, color: LIGHT }}>
                      fondateurs
                    </span>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)' }}>
                      Places restantes
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', margin: '12px 0' }}>
                      <span style={{ fontFamily: F, fontSize: 'clamp(80px,10vw,144px)', fontWeight: 500, lineHeight: 1, color: '#fff' }}>
                        {count}
                      </span>
                      <span style={{ marginLeft: 8, fontFamily: F, fontSize: 30, fontWeight: 500, color: LIGHT }}>/{founderLimit}</span>
                    </div>
                  </>
                )}
                <div style={{ marginTop: 8, height: 6, width: 224, borderRadius: 999, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.6, ease: EASE, delay: 0.4 }}
                    style={{ height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${DEEP}, ${LIGHT})` }}
                  />
                </div>
                <span style={{ marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                  {founderCount} professionnel{founderCount !== 1 ? 's' : ''} {founderCount !== 1 ? 'ont' : 'a'} déjà rejoint
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── 6. SMART CALENDAR ─────────────────────────────────────────────────── */
function SmartCalendarSection() {
  return (
    <section id="calendrier" className="sc-section" style={{ padding: 'clamp(72px,9vw,112px) clamp(20px,5vw,40px)', background: '#0B0B0B' }}>
      <style>{`
        @media (max-width: 768px) {
          .sc-section { padding-top: 32px !important; padding-bottom: 24px !important; }
          .sc-heading  { margin-bottom: 20px !important; }
        }
      `}</style>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}
        >
          <span style={{ height: 1, width: 40, background: '#D4A574', display: 'inline-block' }} />
          <span style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#A87E3C' }}>
            Smart Calendar
          </span>
        </motion.div>
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
          className="sc-heading"
          style={{
            fontFamily: F, fontWeight: 500, letterSpacing: '-0.04em',
            fontSize: 'clamp(28px,3.8vw,52px)', color: '#F8F2EA', margin: '0 0 40px',
            lineHeight: 1.1, maxWidth: 640,
          }}
        >
          Trouvez le bon professionnel,<br />
          <em style={{ fontStyle: 'italic', color: '#D4A574' }}>au bon moment.</em>
        </motion.h2>
        {/* The calendar */}
        <SmartCalendar mode="home" />
      </div>
    </section>
  );
}

/* ─── EXPORT ─────────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <>
      <Hero />
      <SmartCalendarSection />
      <Categories />
      <Featured />
      <HowItWorks />
      <LaunchOffer />
    </>
  );
}
