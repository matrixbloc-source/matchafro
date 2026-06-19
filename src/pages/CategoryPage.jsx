import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

const F      = "'Fraunces', Georgia, serif";
const INK    = '#0B0B0C';
const BRONZE = '#A87E3C';
const DEEP   = '#8A6526';
const LINE   = '#E8E3DA';
const CREAM  = '#FAF7F1';
const EASE   = [0.22, 1, 0.36, 1];
const SHELL  = { maxWidth: 1240, margin: '0 auto' };

const CATEGORY_META = {
  tresses:    { label: 'Tresses',    description: 'Box braids, fulani braids, cornrows et tresses africaines.' },
  locks:      { label: 'Locks',      description: 'Démarrage, entretien, retwist et styling.' },
  perruques:  { label: 'Perruques',  description: 'Pose, customisation, lace wigs et extensions.' },
  barber:     { label: 'Barber',     description: 'Coupes afro, dégradés, contours et rasage.' },
  maquillage: { label: 'Maquillage', description: 'Maquillage jour, soirée, mariage et événements.' },
  onglerie:   { label: 'Onglerie',   description: 'Pose gel, nail art, résine et soins des ongles.' },
  knotless:   { label: 'Knotless',   description: 'Knotless braids et extensions sans nœuds.' },
  vanilles:   { label: 'Vanilles',   description: 'Vanilles, torsades et twists protecteurs.' },
};

export default function CategoryPage() {
  const { slug } = useParams();
  const { pros, avgRating } = useApp();

  const meta = CATEGORY_META[slug] || {
    label: slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Catégorie',
    description: '',
  };

  useEffect(() => {
    document.title = `${meta.label} — Professionnels beauté afro | MatchAfro`;
    return () => { document.title = 'MatchAfro — La beauté afro à portée de main'; };
  }, [meta.label]);

  const filtered = pros
    .filter(p => p.active !== false && !p.suspended && p.slug && (p.categories || []).includes(slug))
    .sort((a, b) => {
      const aDemo = a.id.startsWith('demo-');
      const bDemo = b.id.startsWith('demo-');
      if (aDemo !== bDemo) return aDemo ? 1 : -1;
      if (a.founder !== b.founder) return a.founder ? -1 : 1;
      return (b.views || 0) - (a.views || 0);
    });

  return (
    <main style={{ background: CREAM, minHeight: '100vh', paddingTop: 80 }}>
      <style>{`
        .cat-pro-card:hover { transform: translateY(-4px) !important; box-shadow: 0 24px 60px -20px rgba(11,11,12,0.18) !important; }
        .cat-pro-card:hover .cat-pro-img { transform: scale(1.05) !important; }
        @media (max-width: 900px) { .cat-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 580px) { .cat-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* En-tête */}
      <section style={{ padding: 'clamp(48px,6vw,80px) clamp(20px,5vw,40px)', background: '#fff', borderBottom: `1px solid ${LINE}` }}>
        <div style={SHELL}>
          <Link
            to="/#categories"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(11,11,12,0.45)', textDecoration: 'none', marginBottom: 28, transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = INK}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(11,11,12,0.45)'}
          >
            ← Toutes les catégories
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ height: 1, width: 40, background: BRONZE }} />
            <span style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em', color: DEEP }}>Catégorie</span>
          </div>
          <h1 style={{ fontFamily: F, fontWeight: 500, letterSpacing: '-0.04em', fontSize: 'clamp(32px,4vw,56px)', color: INK, margin: '0 0 12px' }}>
            {meta.label}
          </h1>
          {meta.description && (
            <p style={{ fontSize: 16, color: 'rgba(11,11,12,0.55)', maxWidth: 480, lineHeight: 1.6, margin: '0 0 8px' }}>
              {meta.description}
            </p>
          )}
          <p style={{ fontSize: 14, fontWeight: 600, color: DEEP }}>
            {filtered.length} professionnel{filtered.length !== 1 ? 's' : ''} disponible{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
      </section>

      {/* Grille */}
      <section style={{ padding: 'clamp(48px,6vw,80px) clamp(20px,5vw,40px)' }}>
        <div style={SHELL}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <p style={{ fontSize: 22, fontFamily: F, fontWeight: 500, color: 'rgba(11,11,12,0.25)', marginBottom: 12 }}>
                Aucun professionnel dans cette catégorie
              </p>
              <p style={{ fontSize: 14, color: 'rgba(11,11,12,0.4)', marginBottom: 32 }}>
                Soyez le premier à proposer cette prestation sur MatchAfro.
              </p>
              <Link
                to="/devenir-professionnel"
                style={{ display: 'inline-block', background: INK, color: '#fff', padding: '13px 28px', borderRadius: 999, fontSize: 14, fontWeight: 500, textDecoration: 'none' }}
              >
                Créer mon profil →
              </Link>
            </div>
          ) : (
            <div className="cat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
              {filtered.map((pro, i) => {
                const photo    = (pro.photos || []).filter(Boolean)[0] || null;
                const rating   = avgRating(pro.id);
                const services = pro.services || [];
                const prices   = services.map(s => Number(s.price) || 0).filter(Boolean);
                const minPrice = prices.length ? Math.min(...prices) : null;
                const craft    = services.length > 0
                  ? services[0].name
                  : meta.label;

                return (
                  <motion.div
                    key={pro.id}
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: EASE, delay: Math.min(i * 0.06, 0.42) }}
                  >
                    <Link
                      to={`/pro/${pro.slug}`}
                      className="cat-pro-card"
                      style={{
                        display: 'block', border: `1px solid ${LINE}`, borderRadius: 24,
                        overflow: 'hidden', background: '#fff', textDecoration: 'none',
                        transition: 'all 0.5s', cursor: 'pointer',
                      }}
                    >
                      <div style={{ position: 'relative', aspectRatio: '5/6', overflow: 'hidden' }}>
                        {photo ? (
                          <img
                            src={photo}
                            alt={pro.name}
                            className="cat-pro-img"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 1.1s cubic-bezier(0.22,1,0.36,1)' }}
                          />
                        ) : (
                          <div
                            className="cat-pro-img"
                            style={{
                              width: '100%', height: '100%',
                              background: pro.gradient || `linear-gradient(135deg, ${BRONZE}, ${DEEP})`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'transform 1.1s cubic-bezier(0.22,1,0.36,1)',
                            }}
                          >
                            <span style={{ fontFamily: F, fontSize: 64, fontWeight: 900, color: 'rgba(255,255,255,0.45)', letterSpacing: '-0.04em' }}>
                              {pro.initials || pro.name.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                        {rating > 0 && (
                          <div style={{ position: 'absolute', right: 12, top: 12, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.95)', padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, color: INK }}>
                            ★ {rating.toFixed(1)}
                          </div>
                        )}
                        {pro.founder && (
                          <div style={{ position: 'absolute', left: 12, top: 12, background: 'rgba(212,165,116,0.95)', padding: '3px 9px', borderRadius: 999, fontSize: 10, fontWeight: 700, color: '#0B0B0B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
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
    </main>
  );
}
