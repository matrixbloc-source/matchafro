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

export default function ClientLoginModal({ onClose, onSwitchToPro }) {
  const { loginClient, currentClient, updateClientProfile } = useApp();

  const [mode,       setMode]       = useState('login'); // 'login' | 'register' | 'forgot'
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [sent,       setSent]       = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  /* ── Profil à compléter ── */
  const [profName,  setProfName]  = useState(currentClient?.name  || '');
  const [profPhone, setProfPhone] = useState(currentClient?.phone || '');
  const [profErr,   setProfErr]   = useState('');

  const needsProfile = currentClient && (!currentClient.name || !currentClient.phone);

  function switchMode(m) {
    setMode(m); setError('');
    setPassword(''); setConfirmPwd(''); setForgotSent(false);
  }

  /* ── Auth email+password (login / register) ── */
  async function handleSubmit(e) {
    e.preventDefault();
    const val = email.trim().toLowerCase();
    const pwd = password;

    if (!val || loading) return;
    if (!val.includes('@')) { setError('Entrez une adresse email valide.'); return; }
    if (!pwd || pwd.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return; }
    if (mode === 'register' && pwd !== confirmPwd) { setError('Les mots de passe ne correspondent pas.'); return; }

    setLoading(true);
    setError('');

    if (isSupabaseEnabled && supabase) {
      try {
        if (mode === 'login') {
          const { error: authErr } = await supabase.auth.signInWithPassword({ email: val, password: pwd });
          setLoading(false);
          if (authErr) {
            const msg = authErr.message || '';
            if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('credentials')) {
              setError('Email ou mot de passe incorrect. Mot de passe oublié ? Utilisez le lien ci-dessous.');
            } else if (msg.toLowerCase().includes('not confirmed') || msg.toLowerCase().includes('email_not_confirmed')) {
              setError('Email non confirmé. Vérifiez votre boîte mail avant de vous connecter.');
            } else {
              setError(msg || 'Erreur de connexion. Réessayez.');
            }
          } else {
            // Succès — fermeture immédiate, AppContext gère la session via onAuthStateChange
            onClose();
          }
        } else {
          const { data, error: authErr } = await supabase.auth.signUp({ email: val, password: pwd });
          setLoading(false);
          if (authErr) {
            const msg = authErr.message || '';
            if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already_registered')) {
              setError('Ce compte existe déjà. Connectez-vous à la place.');
              switchMode('login');
            } else {
              setError(msg || 'Erreur lors de la création du compte. Réessayez.');
            }
          } else if (data?.session) {
            // Email confirm désactivé → connecté directement → fermeture immédiate
            onClose();
          } else {
            setSent(true);
          }
        }
      } catch {
        setLoading(false);
        setError('Erreur réseau. Vérifiez votre connexion internet et réessayez.');
      }
    } else {
      // Dev fallback
      setTimeout(() => {
        loginClient(val);
        setLoading(false);
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

  /* ── Sauvegarde du profil ── */
  function handleProfileSave(e) {
    e.preventDefault();
    if (!profName.trim())  { setProfErr('Votre prénom est requis.'); return; }
    if (!profPhone.trim()) { setProfErr('Votre téléphone est requis.'); return; }
    updateClientProfile({ name: profName.trim(), phone: profPhone.trim() });
    onClose();
  }

  /* ── État : profil à compléter ── */
  if (needsProfile) {
    return (
      <Overlay onClick={onClose}>
        <Card onClick={e => e.stopPropagation()}>
          <CloseBtn onClick={onClose} />
          <Header title="Complétez votre profil" subtitle="Ces informations seront utilisées pour vos réservations" />
          <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Votre prénom / nom *">
              <input
                type="text" value={profName}
                onChange={e => { setProfName(e.target.value); setProfErr(''); }}
                placeholder="Mariama Traoré" autoFocus style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(212,165,116,0.5)'; }}
                onBlur={e =>  { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              />
            </Field>
            <Field label="Téléphone *">
              <input
                type="tel" value={profPhone}
                onChange={e => { setProfPhone(e.target.value); setProfErr(''); }}
                placeholder="+33 6 xx xx xx xx" style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(212,165,116,0.5)'; }}
                onBlur={e =>  { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              />
            </Field>
            <AnimatePresence>
              {profErr && <ErrorBanner key="profErr" message={profErr} />}
            </AnimatePresence>
            <GoldButton type="submit" disabled={!profName.trim() || !profPhone.trim()}>
              Enregistrer et continuer →
            </GoldButton>
          </form>
        </Card>
      </Overlay>
    );
  }

  /* ── État : email de confirmation envoyé (inscription) ── */
  if (sent) {
    return (
      <Overlay onClick={onClose}>
        <Card onClick={e => e.stopPropagation()}>
          <CloseBtn onClick={onClose} />
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📩</div>
            <p style={{ fontSize: 15, fontWeight: 800, color: '#F4C16F', fontFamily: 'Inter, sans-serif', margin: '0 0 10px' }}>
              Confirmez votre email
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontFamily: 'Inter, sans-serif', margin: '0 0 28px', lineHeight: 1.7 }}>
              Un lien de confirmation a été envoyé à <strong style={{ color: '#F8F2EA' }}>{email}</strong>.
              Cliquez dessus pour activer votre compte, puis revenez vous connecter.
            </p>
            <button
              onClick={() => { setSent(false); switchMode('login'); }}
              style={{
                display: 'block', width: '100%', marginBottom: 10,
                padding: '13px', background: 'linear-gradient(135deg, #D4A574 0%, #A87E3C 100%)',
                border: 'none', borderRadius: 12, color: '#0B0B0B', fontSize: 14,
                fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >
              Me connecter →
            </button>
            <button onClick={onClose} style={{
              display: 'block', width: '100%', padding: '12px',
              background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 12,
              color: 'rgba(248,242,234,0.6)', fontSize: 14, cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}>Fermer</button>
          </div>
        </Card>
      </Overlay>
    );
  }

  /* ── État : lien de réinitialisation envoyé ── */
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

  /* ── Formulaire mot de passe oublié ── */
  if (mode === 'forgot') {
    const canForgot = !loading && email.trim().includes('@');
    return (
      <Overlay onClick={onClose}>
        <Card onClick={e => e.stopPropagation()}>
          <CloseBtn onClick={onClose} />
          <Header title="Mot de passe oublié" subtitle="Réinitialisez votre mot de passe par email" />

          <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Adresse email">
              <input
                type="email" value={email} autoFocus
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="votre@email.fr"
                style={{ ...inputStyle, borderColor: error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)' }}
                onFocus={e => { if (!error) e.currentTarget.style.borderColor = 'rgba(212,165,116,0.5)'; }}
                onBlur={e =>  { if (!error) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              />
            </Field>

            <AnimatePresence>
              {error && <ErrorBanner key="err" message={error} />}
            </AnimatePresence>

            <GoldButton type="submit" disabled={!canForgot}>
              {loading ? '⏳ En cours…' : 'Envoyer le lien →'}
            </GoldButton>

            <button type="button" onClick={() => switchMode('login')}
              style={{
                background: 'none', border: 'none', color: 'rgba(212,165,116,0.7)',
                fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                textDecoration: 'underline', textAlign: 'center',
              }}>
              ← Retour à la connexion
            </button>
          </form>
        </Card>
      </Overlay>
    );
  }

  /* ── Formulaire principal (login / register) ── */
  const isLogin = mode === 'login';
  const canSubmit = !loading && email.trim() && password.length >= 6 && (isLogin || confirmPwd.trim());

  return (
    <Overlay onClick={onClose}>
      <Card onClick={e => e.stopPropagation()}>
        <CloseBtn onClick={onClose} />

        <Header
          title={isLogin ? 'Mon espace client' : 'Créer mon compte'}
          subtitle={isLogin ? 'Accédez à vos réservations' : 'Réservez en quelques secondes'}
        />

        {/* Onglets Connexion / Inscription */}
        <div style={{
          display: 'flex', background: 'rgba(255,255,255,0.05)',
          borderRadius: 12, padding: 4, marginBottom: 24,
        }}>
          {[['login', 'Connexion'], ['register', 'Inscription']].map(([m, label]) => (
            <button key={m} type="button" onClick={() => switchMode(m)}
              style={{
                flex: 1, padding: '9px 0', border: 'none', borderRadius: 9,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
                background: mode === m ? 'rgba(212,165,116,0.15)' : 'transparent',
                color: mode === m ? '#D4A574' : 'rgba(248,242,234,0.4)',
                transition: 'all 0.2s',
              }}>
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Adresse email">
            <input
              type="email" value={email} autoFocus
              onChange={e => { setEmail(e.target.value); setError(''); }}
              placeholder="votre@email.fr"
              style={{ ...inputStyle, borderColor: error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)' }}
              onFocus={e => { if (!error) e.currentTarget.style.borderColor = 'rgba(212,165,116,0.5)'; }}
              onBlur={e =>  { if (!error) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            />
          </Field>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{
                fontSize: 11, fontWeight: 700,
                color: 'rgba(248,242,234,0.45)', textTransform: 'uppercase',
                letterSpacing: '1px', fontFamily: 'Inter, sans-serif',
              }}>
                Mot de passe
              </label>
              {isLogin && (
                <button type="button" onClick={() => switchMode('forgot')}
                  style={{
                    background: 'none', border: 'none', color: 'rgba(212,165,116,0.7)',
                    fontSize: 11, cursor: 'pointer', fontFamily: 'Inter, sans-serif', padding: 0,
                  }}>
                  Mot de passe oublié ?
                </button>
              )}
            </div>
            <input
              type="password" value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder={isLogin ? '••••••••' : '6 caractères minimum'}
              style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(212,165,116,0.5)'; }}
              onBlur={e =>  { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            />
          </div>

          <AnimatePresence>
            {!isLogin && (
              <motion.div key="confirm-field"
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                <Field label="Confirmer le mot de passe">
                  <input
                    type="password" value={confirmPwd}
                    onChange={e => { setConfirmPwd(e.target.value); setError(''); }}
                    placeholder="••••••••"
                    style={inputStyle}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(212,165,116,0.5)'; }}
                    onBlur={e =>  { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  />
                </Field>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && <ErrorBanner key="err" message={error} />}
          </AnimatePresence>

          <GoldButton type="submit" disabled={!canSubmit}>
            {loading ? '⏳ En cours…' : isLogin ? 'Se connecter →' : 'Créer mon compte →'}
          </GoldButton>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />

          <p style={{ fontSize: 12, color: 'rgba(248,242,234,0.3)', textAlign: 'center', fontFamily: 'Inter, sans-serif', margin: 0 }}>
            Vous êtes professionnel ?{' '}
            <button type="button" onClick={onSwitchToPro}
              style={{ background: 'none', border: 'none', color: '#D4A574', fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif', padding: 0 }}>
              Connexion pro →
            </button>
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
    <motion.div initial={{ opacity: 0, y: 28, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
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

function Header({ title, subtitle }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 24 }}>
      <div style={{ fontFamily: F, fontSize: 26, fontWeight: 500, letterSpacing: '-0.04em', color: '#F8F2EA', marginBottom: 8 }}>
        Match<span style={{ color: '#D4A574' }}>Afro</span>
      </div>
      <p style={{ fontSize: 15, fontWeight: 700, color: '#F8F2EA', margin: '0 0 4px', fontFamily: 'Inter, sans-serif' }}>
        {title}
      </p>
      <p style={{ fontSize: 13, color: 'rgba(248,242,234,0.45)', fontFamily: 'Inter, sans-serif', margin: 0 }}>
        {subtitle}
      </p>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: 11, fontWeight: 700,
        color: 'rgba(248,242,234,0.45)', textTransform: 'uppercase',
        letterSpacing: '1px', marginBottom: 8, fontFamily: 'Inter, sans-serif',
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function ErrorBanner({ message }) {
  return (
    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: 10, padding: '10px 14px' }}>
      <p style={{ fontSize: 13, color: '#FCA5A5', fontFamily: 'Inter, sans-serif', margin: 0, fontWeight: 500 }}>
        ⚠ {message}
      </p>
    </motion.div>
  );
}

function GoldButton({ children, disabled, ...props }) {
  return (
    <button
      disabled={disabled}
      style={{
        width: '100%', padding: '13px', borderRadius: 14, border: 'none',
        background: !disabled ? 'linear-gradient(135deg, #D4A574 0%, #A87E3C 100%)' : 'rgba(255,255,255,0.08)',
        color: !disabled ? '#0B0B0B' : 'rgba(255,255,255,0.25)',
        fontSize: 14, fontWeight: 700,
        cursor: !disabled ? 'pointer' : 'not-allowed',
        fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
      }}
      {...props}
    >
      {children}
    </button>
  );
}
