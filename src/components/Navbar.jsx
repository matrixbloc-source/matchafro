import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext.jsx';
import LoginModal from './LoginModal.jsx';
import ClientLoginModal from './ClientLoginModal.jsx';

const F = "'Fraunces', Georgia, serif";
const INK = '#0B0B0C';
const BRONZE = '#A87E3C';
const LINE = '#E8E3DA';
const EASE = [0.22, 1, 0.36, 1];

const NAV_LINKS = [
  { label: 'Catégories', href: '/#categories' },
  { label: 'Professionnels', href: '/#vedettes' },
  { label: 'Comment ça marche', href: '/#etapes' },
];

function useAnchorNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return function goTo(href) {
    const [, hash] = href.split('#');
    if (!hash) { navigate(href); return; }
    if (pathname === '/') {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 350);
    }
  };
}

export default function Navbar() {
  const [scrolled,        setScrolled]        = useState(false);
  const [menu,            setMenu]            = useState(false);
  const [loginOpen,       setLoginOpen]       = useState(false);
  const [clientLoginOpen, setClientLoginOpen] = useState(false);
  const { currentPro, logoutPro, currentClient, logoutClient } = useApp();
  const navigate = useNavigate();
  const goTo     = useAnchorNav();

  function handleLogout() {
    setMenu(false);
    if (currentPro)    { logoutPro();    navigate('/'); }
    else if (currentClient) { logoutClient(); navigate('/'); }
  }

  function openProLogin() { setMenu(false); setLoginOpen(true); }
  function openClientLogin() { setMenu(false); setClientLoginOpen(true); }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menu ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menu]);

  function handleLink(href) {
    setMenu(false);
    goTo(href);
  }

  return (
    <>
      <motion.header
        initial={{ y: -28, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: EASE }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${scrolled ? LINE : 'transparent'}`,
          transition: 'border-color 0.4s',
        }}
      >
        <div style={{
          maxWidth: 1240, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: 'clamp(14px,3vw,20px) clamp(16px,4vw,40px)',
        }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', fontFamily: F, fontSize: 24, fontWeight: 500, letterSpacing: '-0.04em', color: INK }}>
            Match<span style={{ color: BRONZE }}>Afro</span>
          </Link>

          {/* Desktop links */}
          <nav aria-label="Navigation principale" style={{ display: 'flex', gap: 36, alignItems: 'center' }} className="nav-desktop">
            {NAV_LINKS.map(link => (
              <a
                key={link.label}
                href={link.href}
                onClick={e => { e.preventDefault(); handleLink(link.href); }}
                style={{
                  textDecoration: 'none', cursor: 'pointer', padding: 0,
                  fontSize: 14, color: 'rgba(11,11,12,0.7)', fontFamily: 'Inter, sans-serif',
                  fontWeight: 400, transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = INK}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(11,11,12,0.7)'}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="nav-cta">
            {currentPro ? (
              <>
                <Link to="/dashboard" style={{ fontSize: 14, color: 'rgba(11,11,12,0.7)', textDecoration: 'none' }}>
                  Mon tableau de bord
                </Link>
                <button onClick={handleLogout}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'rgba(11,11,12,0.5)', fontFamily: 'Inter, sans-serif', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(11,11,12,0.5)'}>
                  Déconnexion
                </button>
                <Link to={`/pro/${currentPro.slug}`} style={{
                  background: INK, color: '#fff', padding: '10px 20px',
                  borderRadius: 999, fontSize: 14, fontWeight: 500, textDecoration: 'none',
                }}>
                  Mon profil
                </Link>
              </>
            ) : currentClient ? (
              <>
                <Link to="/mon-compte"
                  style={{ fontSize: 14, color: 'rgba(11,11,12,0.7)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#D97706', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {(currentClient.name || currentClient.email)?.[0]?.toUpperCase() || '?'}
                  </span>
                  Mon compte
                </Link>
                <button onClick={handleLogout}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'rgba(11,11,12,0.5)', fontFamily: 'Inter, sans-serif', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(11,11,12,0.5)'}>
                  Déconnexion
                </button>
                <Link to="/devenir-professionnel" style={{
                  background: INK, color: '#fff', padding: '10px 20px',
                  borderRadius: 999, fontSize: 14, fontWeight: 500, textDecoration: 'none',
                }}>
                  Devenir professionnel
                </Link>
              </>
            ) : (
              <>
                <button onClick={openClientLogin} className="nav-login"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'rgba(11,11,12,0.7)', fontFamily: 'Inter, sans-serif' }}>
                  Connexion
                </button>
                <button onClick={openProLogin}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'rgba(11,11,12,0.4)', fontFamily: 'Inter, sans-serif' }}>
                  Espace pro
                </button>
                <Link to="/devenir-professionnel" style={{
                  background: INK, color: '#fff', padding: '10px 20px',
                  borderRadius: 999, fontSize: 14, fontWeight: 500, textDecoration: 'none',
                  border: 'none', cursor: 'pointer',
                }}>
                  Devenir professionnel
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenu(true)}
            className="nav-burger"
            aria-label="Menu"
            style={{
              display: 'none', background: 'none', border: `1.5px solid ${LINE}`,
              borderRadius: 10, padding: '8px 10px', cursor: 'pointer',
              flexDirection: 'column', gap: 4,
            }}
          >
            <span style={{ display: 'block', width: 18, height: 1.5, background: INK, borderRadius: 2 }} />
            <span style={{ display: 'block', width: 14, height: 1.5, background: INK, borderRadius: 2 }} />
            <span style={{ display: 'block', width: 18, height: 1.5, background: INK, borderRadius: 2 }} />
          </button>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .nav-desktop { display: none !important; }
            .nav-cta > * { display: none !important; }
            .nav-burger { display: flex !important; }
          }
        `}</style>
      </motion.header>

      {/* Modal connexion pro */}
      <AnimatePresence>
        {loginOpen && !currentPro && (
          <LoginModal onClose={() => setLoginOpen(false)} />
        )}
      </AnimatePresence>

      {/* Modal connexion client */}
      <AnimatePresence>
        {clientLoginOpen && !currentClient && !currentPro && (
          <ClientLoginModal
            onClose={() => setClientLoginOpen(false)}
            onSwitchToPro={() => { setClientLoginOpen(false); setLoginOpen(true); }}
          />
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {menu && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ position: 'fixed', inset: 0, zIndex: 998, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
            onClick={() => setMenu(false)}
          >
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ duration: 0.35, ease: EASE }}
              onClick={e => e.stopPropagation()}
              style={{
                position: 'absolute', top: 0, right: 0, bottom: 0,
                width: Math.min(320, window.innerWidth * 0.85),
                background: '#fff', padding: 24,
                display: 'flex', flexDirection: 'column',
                boxShadow: '-20px 0 60px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
                <span style={{ fontFamily: F, fontSize: 20, fontWeight: 500, letterSpacing: '-0.04em', color: INK }}>
                  Match<span style={{ color: BRONZE }}>Afro</span>
                </span>
                <button onClick={() => setMenu(false)} style={{
                  background: '#f5f5f5', border: 'none', borderRadius: 10,
                  width: 36, height: 36, cursor: 'pointer', fontSize: 16, color: INK,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>✕</button>
              </div>

              <nav aria-label="Navigation principale" style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                {NAV_LINKS.map(link => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={e => { e.preventDefault(); handleLink(link.href); }}
                    style={{
                      textDecoration: 'none', cursor: 'pointer', display: 'block',
                      textAlign: 'left', fontSize: 16, fontWeight: 500, color: INK,
                      padding: '14px 16px', borderRadius: 12, fontFamily: 'Inter, sans-serif',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 20, borderTop: `1px solid ${LINE}` }}>
                {currentPro ? (
                  <>
                    <Link to="/dashboard" onClick={() => setMenu(false)} style={{
                      textAlign: 'center', background: '#F9FAFB', border: `1px solid ${LINE}`,
                      padding: 14, borderRadius: 14, fontSize: 14, fontWeight: 500, textDecoration: 'none', color: INK,
                    }}>Mon tableau de bord</Link>
                    <Link to={`/pro/${currentPro.slug}`} onClick={() => setMenu(false)} style={{
                      textAlign: 'center', background: INK, color: '#fff',
                      padding: 14, borderRadius: 14, fontSize: 14, fontWeight: 500, textDecoration: 'none',
                    }}>Mon profil</Link>
                    <button onClick={handleLogout} style={{
                      background: 'transparent', border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: 14, padding: 14, fontSize: 14, fontWeight: 500,
                      cursor: 'pointer', fontFamily: 'Inter, sans-serif', color: '#EF4444',
                    }}>Se déconnecter</button>
                  </>
                ) : currentClient ? (
                  <>
                    <Link to="/mon-compte" onClick={() => setMenu(false)} style={{
                      textAlign: 'center', background: '#F9FAFB', border: `1px solid ${LINE}`,
                      padding: 14, borderRadius: 14, fontSize: 14, fontWeight: 500, textDecoration: 'none', color: INK,
                    }}>
                      👤 Mon compte
                      {currentClient.name ? ` — ${currentClient.name.split(' ')[0]}` : ''}
                    </Link>
                    <Link to="/devenir-professionnel" onClick={() => setMenu(false)} style={{
                      textAlign: 'center', background: INK, color: '#fff',
                      padding: 14, borderRadius: 14, fontSize: 14, fontWeight: 500, textDecoration: 'none',
                    }}>Devenir professionnel</Link>
                    <button onClick={handleLogout} style={{
                      background: 'transparent', border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: 14, padding: 14, fontSize: 14, fontWeight: 500,
                      cursor: 'pointer', fontFamily: 'Inter, sans-serif', color: '#EF4444',
                    }}>Se déconnecter</button>
                  </>
                ) : (
                  <>
                    <button onClick={openClientLogin} style={{
                      background: 'transparent', border: `1px solid ${LINE}`,
                      borderRadius: 14, padding: 14, fontSize: 14, fontWeight: 500,
                      cursor: 'pointer', fontFamily: 'Inter, sans-serif', color: INK,
                    }}>Connexion client</button>
                    <button onClick={openProLogin} style={{
                      background: 'transparent', border: `1px solid ${LINE}`,
                      borderRadius: 14, padding: 14, fontSize: 13, fontWeight: 500,
                      cursor: 'pointer', fontFamily: 'Inter, sans-serif', color: 'rgba(11,11,12,0.5)',
                    }}>Espace professionnel</button>
                    <Link to="/devenir-professionnel" onClick={() => setMenu(false)} style={{
                      textAlign: 'center', background: INK, color: '#fff',
                      padding: 14, borderRadius: 14, fontSize: 14, fontWeight: 500, textDecoration: 'none',
                    }}>Devenir professionnel</Link>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
