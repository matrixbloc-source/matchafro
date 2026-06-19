import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const F = "'Fraunces', Georgia, serif";
const INK = '#0B0B0C';
const BRONZE = '#A87E3C';
const DEEP = '#8A6526';
const LINE = '#E8E3DA';
const EASE = [0.22, 1, 0.36, 1];

const COLUMNS = [
  {
    title: 'Prestations',
    links: [
      { label: 'Tresses', href: '/categorie/tresses', internal: true },
      { label: 'Locks', href: '/categorie/locks', internal: true },
      { label: 'Perruques', href: '/categorie/perruques', internal: true },
      { label: 'Barber', href: '/categorie/barber', internal: true },
      { label: 'Maquillage', href: '/categorie/maquillage', internal: true },
      { label: 'Onglerie', href: '/categorie/onglerie', internal: true },
    ],
  },
  {
    title: 'Plateforme',
    links: [
      { label: 'Trouver un pro', href: '/#calendrier' },
      { label: 'Devenir pro', href: '/devenir-professionnel', internal: true },
      { label: 'Contact', href: '/contact', internal: true },
    ],
  },
  {
    title: 'Entreprise',
    links: [
      { label: 'Contact', href: '/contact', internal: true },
    ],
  },
  {
    title: 'Légal',
    links: [
      { label: 'Confidentialité', href: '/confidentialite', internal: true },
      { label: 'Conditions générales', href: '/cgu', internal: true },
      { label: 'Mentions légales', href: '/mentions-legales', internal: true },
    ],
  },
];

const linkStyle = {
  fontSize: 14, color: 'rgba(11,11,12,0.65)', textDecoration: 'none',
  transition: 'color 0.2s', display: 'block',
};

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  }

  return (
    <footer style={{ padding: '96px 40px 40px', background: '#fff' }}>
      <style>{`
        @media (max-width: 768px) {
          .foot-top-grid { grid-template-columns: 1fr !important; }
          .foot-cols-grid { grid-template-columns: 1fr 1fr !important; }
          .foot-brand-col { grid-column: span 2 !important; }
          .foot-bottom-bar { flex-direction: column !important; gap: 12px !important; }
        }
      `}</style>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>

        {/* Top: headline + newsletter */}
        <div className="foot-top-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 56, borderBottom: `1px solid ${LINE}`, paddingBottom: 64 }}>
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: EASE }}
              style={{ fontFamily: F, fontWeight: 500, letterSpacing: '-0.04em', lineHeight: 1.1, fontSize: 'clamp(28px,3.5vw,48px)', maxWidth: 560, color: INK, margin: 0 }}
            >
              La beauté afro mérite mieux qu'un carnet de rendez-vous.
            </motion.h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <label style={{ marginBottom: 12, fontSize: 14, color: 'rgba(11,11,12,0.55)' }}>
              Recevez les nouveautés et les artisans en avant-première.
            </label>
            {submitted ? (
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ fontSize: 14, color: DEEP, fontWeight: 500 }}
              >
                ✓ Merci, vous êtes inscrit(e) !
              </motion.p>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${INK}`, paddingBottom: 8 }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="vous@email.com"
                  required
                  style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: INK, fontFamily: 'Inter, sans-serif' }}
                />
                <button type="submit" style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: 500, color: DEEP, fontFamily: 'Inter, sans-serif',
                  flexShrink: 0,
                }}>
                  S'abonner →
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Link columns */}
        <div className="foot-cols-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr repeat(4,1fr)', gap: 40, padding: '64px 0' }}>
          {/* Brand */}
          <div className="foot-brand-col">
            <Link to="/" style={{ textDecoration: 'none', fontFamily: F, fontSize: 24, fontWeight: 500, letterSpacing: '-0.04em', color: INK, display: 'inline-block', marginBottom: 16 }}>
              Match<span style={{ color: BRONZE }}>Afro</span>
            </Link>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(11,11,12,0.5)', maxWidth: 280, margin: 0 }}>
              Le rendez-vous beauté afro, pensé pour les artisans et leurs clientes.
            </p>
          </div>

          {/* Columns */}
          {COLUMNS.map(col => (
            <div key={col.title}>
              <h4 style={{ margin: '0 0 16px', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(11,11,12,0.4)' }}>
                {col.title}
              </h4>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {col.links.map(link => (
                  <li key={link.label} style={{ marginBottom: 10 }}>
                    {link.internal ? (
                      <Link
                        to={link.href}
                        style={linkStyle}
                        onMouseEnter={e => e.currentTarget.style.color = DEEP}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(11,11,12,0.65)'}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        style={linkStyle}
                        onMouseEnter={e => e.currentTarget.style.color = DEEP}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(11,11,12,0.65)'}
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="foot-bottom-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${LINE}`, paddingTop: 32 }}>
          <p style={{ fontSize: 14, color: 'rgba(11,11,12,0.45)', margin: 0 }}>
            © {new Date().getFullYear()} MatchAfro. Tous droits réservés.
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Instagram', 'TikTok', 'LinkedIn'].map(social => (
              <a
                key={social}
                href="#"
                style={{ fontSize: 14, color: 'rgba(11,11,12,0.55)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = INK}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(11,11,12,0.55)'}
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
