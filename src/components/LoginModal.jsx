import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext.jsx';
import { supabase, isSupabaseEnabled } from '../lib/supabase.js';

const EASE = [0.22, 1, 0.36, 1];
const F    = "'Fraunces', Georgia, serif";

const inputStyle = {
  display: 'block', width: '100%',
  border: '1.5px solid rgba(255,255,255,0.1)',
  borderRadius: 12, padding: '13px 16px', fontSize: 14,
  background: 'rgba(255,255,255,0.05)', color: '#F8F2EA',
  fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
  outline: 'none', transition: 'border-color 0.2s',
};

const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 700,
  color: 'rgba(248,242,234,0.45)', textTransform: 'uppercase',
  letterSpacing: '1px', marginBottom: 8, fontFamily: 'Inter, sans-serif',
};

export default function LoginModal({ onClose }) {
  const { loginPro, pros } = useApp();

  const [mode,       setMode]       = useState('login'); // 'login' | 'forgot'
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  function switchMode(m) { setMode(m); setError(''); setForgotSent(false); }

  /* ── Connexion email + mot de passe ── */
  async function handleLogin(e) {
    e.preventDefault();
    const val = email.trim().toLowerCase();
    const pwd = password;
    if (!val || loading) return;
    if (!val.includes('@')) { setError('Entrez une adresse email valide.'); return; }
    if (!pwd || pwd.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return; }

    setLoading(true);
    setError('');

    if (isSupabaseEnabled && supabase) {
      // Vérification préalable : l'email doit être lié à un professionnel
      const isPro = pros.some(p => (p.email || '').toLowerCase() === val);
      if (!isPro) {
        setLoading(false);
        setError('Aucun compte professionnel associé à cet email.');
        return;
      }

      try {
        const { error: authErr } = await supabase.auth.signInWithPassword({ email: val, password: pwd });
        setLoading(false);
        if (authErr) {
          const msg = authErr.message || '';
          if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('credentials')) {
            setError('Mot de passe incorrect ou compte inexistant. Utilisez "Mot de passe oublié ?" pour définir votre mot de passe.');
          } else if (msg.toLowerCase().includes('not confirmed') || msg.toLowerCase().includes('email_not_confirmed')) {
            setError('Email non confirmé. Vérifiez votre boîte mail.');
          } else {
            setError(msg || 'Erreur de connexion. Réessayez.');
          }
        } else {
          // Succès — onAuthStateChange → setPendingEmail → resolution → currentPro
          onClose();
        }
      } catch {
        setLoading(false);
        setError('Erreur réseau. Vérifiez votre connexion et réessayez.');
      }
    } else {
      // Dev fallback sans Supabase
      setTimeout(() => {
        const result = loginPro(val);
        setLoading(false);
        if (result.pro) { onClose(); }
        else { setError(result.error || 'Email professionnel introuvable.'); }
      }, 350);
    }
  }

  /* ── Mot de passe oublié ── */
  async function handleForgot(e) {
    e.preventDefault();
    const val = email.trim().toLowerCase();
    if (!val || loading) return;
    if (!val.includes('@')) { setError('Entrez une adresse email valide.'); return; }

    setLoading(true);
    setError('');

    if (isSupabaseEnabled && supabase) {
      try {
        const redirectTo = `${window.location.origin}/reset-password`;
        const { error: err } = await supabase.auth.resetPasswordForEmail(val, { redirectTo });
        setLoading(false);
        if (err) {
          setError(err.message || "Erreur lors de l'envoi. Réessayez.");
        } else {
          setForgotSent(true);
        }
      } catch {
        setLoading(false);
        setError('Erreur réseau. Réessayez.');
      }
    } else {
      setLoading(false);
      setForgotSent(true);
    }
  }

  /* ── Email de réinitialisation envoyé ── */
  if (mode === 'forgot' && forgotSent) {
    return (
      <Overlay onClick={onClose}>
        <Card onClick={e => e.stopPropagation()}>
          <CloseBtn onClick={onClose} />
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📩</div>
            <p style={{ fontSize: 15, fontWeight: 800, color: '#F4C16F', fontFamily: 'Inter, sans-serif', margin: '0 0 10px' }}>
              Email envoyé
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontFamily: 'Inter, sans-serif', margin: '0 0 28px', lineHeight: 1.7 }}>
              Un lien de réinitialisation a été envoyé à{' '}
              <strong style={{ color: '#F8F2EA' }}>{email}</strong>.
              Cliquez dessus pour définir un nouveau mot de passe.
            </p>
            <button
              onClick={() => { setForgotSent(false); switchMode('login'); }}
              style={{
                display: 'block', width: '100%',
                padding: '13px', background: 'linear-gradient(135deg, #D4A574 0%, #A87E3C 100%)',
                border: 'none', borderRadius: 12, color: '#0B0B0B', fontSize: 14,
                fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >
              Retour à la connexion →
            </button>
          </div>
        </Card>
      </Overlay>
    );
  }

  const canSubmit = !loading && email.trim() && (mode === 'forgot' || password.length >= 6);

  return (
    <Overlay onClick={onClose}>
      <Card onClick={e => e.stopPropagation()}>
        <CloseBtn onClick={onClose} />

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: F, fontSize: 26, fontWeight: 500, letterSpacing: '-0.04em', color: '#F8F2EA', marginBottom: 8 }}>
            Match<span style={{ color: '#D4A574' }}>Afro</span>
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#F8F2EA', margin: '0 0 4px', fontFamily: 'Inter, sans-serif' }}>
            {mode === 'login' ? 'Connexion professionnelle' : 'Mot de passe oublié'}
          </p>
          <p style={{ fontSize: 13, color: 'rgba(248,242,234,0.45)', fontFamily: 'Inter, sans-serif', margin: 0 }}>
            {mode === 'login' ? 'Accédez à votre espace professionnel' : 'Réinitialisez votre mot de passe'}
          </p>
        </div>

        <form
          onSubmit={mode === 'login' ? handleLogin : handleForgot}
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          {/* Email */}
          <div>
            <label style={labelStyle}>Adresse email professionnelle</label>
            <input
              type="email" value={email} autoFocus
              onChange={e => { setEmail(e.target.value); setError(''); }}
              placeholder="contact@exemple.fr"
              style={{ ...inputStyle, borderColor: error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)' }}
              onFocus={e => { if (!error) e.currentTarget.style.borderColor = 'rgba(212,165,116,0.5)'; }}
              onBlur={e =>  { if (!error) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            />
          </div>

          {/* Mot de passe (uniquement en mode login) */}
          <AnimatePresence>
            {mode === 'login' && (
              <motion.div key="pwd-field"
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Mot de passe</label>
                  <button type="button" onClick={() => switchMode('forgot')}
                    style={{
                      background: 'none', border: 'none', color: 'rgba(212,165,116,0.7)',
                      fontSize: 11, cursor: 'pointer', fontFamily: 'Inter, sans-serif', padding: 0,
                    }}>
                    Mot de passe oublié ?
                  </button>
                </div>
                <input
                  type="password" value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(212,165,116,0.5)'; }}
                  onBlur={e =>  { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Erreur */}
          <AnimatePresence>
            {error && (
              <motion.div key="err"
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: 10, padding: '10px 14px' }}>
                <p style={{ fontSize: 13, color: '#FCA5A5', fontFamily: 'Inter, sans-serif', margin: 0, fontWeight: 500 }}>
                  ⚠ {error}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bouton principal */}
          <button type="submit" disabled={!canSubmit}
            style={{
              width: '100%', padding: '13px', borderRadius: 14, border: 'none',
              background: canSubmit
                ? 'linear-gradient(135deg, #D4A574 0%, #A87E3C 100%)'
                : 'rgba(255,255,255,0.08)',
              color: canSubmit ? '#0B0B0B' : 'rgba(255,255,255,0.25)',
              fontSize: 14, fontWeight: 700,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
            }}>
            {loading
              ? '⏳ En cours…'
              : mode === 'login'
                ? 'Accéder à mon espace →'
                : 'Envoyer le lien →'}
          </button>

          {/* Retour connexion (mode forgot) */}
          {mode === 'forgot' && (
            <button type="button" onClick={() => switchMode('login')}
              style={{
                background: 'none', border: 'none', color: 'rgba(212,165,116,0.7)',
                fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                textDecoration: 'underline', textAlign: 'center',
              }}>
              ← Retour à la connexion
            </button>
          )}

          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />

          <p style={{ fontSize: 12, color: 'rgba(248,242,234,0.3)', textAlign: 'center', fontFamily: 'Inter, sans-serif', margin: 0 }}>
            Pas encore de compte ?{' '}
            <a href="/devenir-professionnel" onClick={onClose}
              style={{ color: '#D4A574', textDecoration: 'none', fontWeight: 600 }}>
              Créer mon profil →
            </a>
          </p>
        </form>
      </Card>
    </Overlay>
  );
}

/* ── Sous-composants ── */
function Overlay({ children, onClick }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
      onClick={onClick}>
      {children}
    </motion.div>
  );
}

function Card({ children, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.97 }}
      transition={{ duration: 0.34, ease: EASE }}
      onClick={onClick}
      style={{
        background: 'linear-gradient(160deg, #1A1710 0%, #0F0D0A 100%)',
        borderRadius: 24, padding: '40px 36px',
        width: '100%', maxWidth: 420, position: 'relative',
        border: '1px solid rgba(212,165,116,0.2)',
        boxShadow: '0 40px 100px rgba(0,0,0,0.85), 0 0 0 1px rgba(0,0,0,0.5)',
      }}>
      {children}
    </motion.div>
  );
}

function CloseBtn({ onClick }) {
  return (
    <button onClick={onClick} aria-label="Fermer"
      style={{
        position: 'absolute', top: 14, right: 14,
        background: 'rgba(255,255,255,0.06)', border: 'none',
        color: 'rgba(255,255,255,0.4)', width: 32, height: 32,
        borderRadius: 8, cursor: 'pointer', fontSize: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>✕</button>
  );
}
