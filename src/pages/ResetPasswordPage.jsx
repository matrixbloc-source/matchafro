import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';

const EASE = [0.22, 1, 0.36, 1];
const F    = "'Fraunces', Georgia, serif";

const inputStyle = {
  display: 'block', width: '100%',
  border: '1.5px solid rgba(255,255,255,0.1)',
  borderRadius: 12, padding: '13px 16px', fontSize: 15,
  background: 'rgba(255,255,255,0.05)', color: '#F8F2EA',
  fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
  outline: 'none', transition: 'border-color 0.2s',
};

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  // 'loading' → écoute PASSWORD_RECOVERY | 'form' → formulaire | 'success' → ok | 'expired' → lien expiré
  const [step,       setStep]       = useState('loading');
  const [password,   setPassword]   = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [error,      setError]      = useState('');
  const [saving,     setSaving]     = useState(false);

  useEffect(() => {
    if (!supabase) { setStep('expired'); return; }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setStep('form');
      }
    });

    // Si le token dans l'URL est invalide / expiré, Supabase ne déclenche pas
    // PASSWORD_RECOVERY — on bascule en "expired" après 6s
    const timer = setTimeout(() => {
      setStep(prev => prev === 'loading' ? 'expired' : prev);
    }, 6000);

    return () => { subscription.unsubscribe(); clearTimeout(timer); };
  }, []);

  async function handleUpdate(e) {
    e.preventDefault();
    if (password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return; }
    if (password !== confirmPwd) { setError('Les mots de passe ne correspondent pas.'); return; }

    setSaving(true);
    setError('');

    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      setSaving(false);
      if (err) {
        setError(err.message || 'Erreur lors de la mise à jour. Demandez un nouveau lien.');
      } else {
        setStep('success');
        setTimeout(() => navigate('/'), 3000);
      }
    } catch {
      setSaving(false);
      setError('Erreur réseau. Vérifiez votre connexion et réessayez.');
    }
  }

  const canSave = !saving && password.length >= 6 && password === confirmPwd;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0F0D0A 0%, #1A1710 60%, #0B0B0B 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      {/* Logo */}
      <div style={{ fontFamily: F, fontSize: 28, fontWeight: 500, letterSpacing: '-0.04em', color: '#F8F2EA', marginBottom: 40 }}>
        Match<span style={{ color: '#D4A574' }}>Afro</span>
      </div>

      <AnimatePresence mode="wait">
        {/* Chargement */}
        {step === 'loading' && (
          <motion.div key="loading"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', color: 'rgba(248,242,234,0.5)', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>⏳</div>
            <p style={{ fontSize: 14 }}>Vérification du lien…</p>
          </motion.div>
        )}

        {/* Lien expiré / invalide */}
        {step === 'expired' && (
          <motion.div key="expired"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            style={{ textAlign: 'center', maxWidth: 400 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#F8F2EA', fontFamily: 'Inter, sans-serif', margin: '0 0 12px' }}>
              Lien expiré ou invalide
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(248,242,234,0.5)', fontFamily: 'Inter, sans-serif', margin: '0 0 32px', lineHeight: 1.7 }}>
              Ce lien de réinitialisation n'est plus valide. Demandez-en un nouveau depuis l'écran de connexion.
            </p>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '13px 32px', borderRadius: 14, border: 'none',
                background: 'linear-gradient(135deg, #D4A574 0%, #A87E3C 100%)',
                color: '#0B0B0B', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}>
              Retour à l'accueil →
            </button>
          </motion.div>
        )}

        {/* Formulaire nouveau mot de passe */}
        {step === 'form' && (
          <motion.div key="form"
            initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.34, ease: EASE }}
            style={{
              background: 'linear-gradient(160deg, #1A1710 0%, #0F0D0A 100%)',
              borderRadius: 24, padding: '40px 36px',
              width: '100%', maxWidth: 420,
              border: '1px solid rgba(212,165,116,0.2)',
              boxShadow: '0 40px 100px rgba(0,0,0,0.85)',
            }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#F8F2EA', fontFamily: 'Inter, sans-serif', margin: '0 0 6px', textAlign: 'center' }}>
              Nouveau mot de passe
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(248,242,234,0.45)', fontFamily: 'Inter, sans-serif', margin: '0 0 28px', textAlign: 'center' }}>
              Choisissez un mot de passe sécurisé pour votre compte
            </p>

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(248,242,234,0.45)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>
                  Nouveau mot de passe
                </label>
                <input
                  type="password" value={password} autoFocus
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="6 caractères minimum"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(212,165,116,0.5)'; }}
                  onBlur={e =>  { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(248,242,234,0.45)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>
                  Confirmer le mot de passe
                </label>
                <input
                  type="password" value={confirmPwd}
                  onChange={e => { setConfirmPwd(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  style={{
                    ...inputStyle,
                    borderColor: confirmPwd && password !== confirmPwd
                      ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(212,165,116,0.5)'; }}
                  onBlur={e =>  {
                    e.currentTarget.style.borderColor = (confirmPwd && password !== confirmPwd)
                      ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)';
                  }}
                />
                {confirmPwd && password !== confirmPwd && (
                  <p style={{ fontSize: 11, color: '#FCA5A5', fontFamily: 'Inter, sans-serif', margin: '6px 0 0', fontWeight: 500 }}>
                    Les mots de passe ne correspondent pas
                  </p>
                )}
              </div>

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

              <button type="submit" disabled={!canSave}
                style={{
                  width: '100%', padding: '13px', borderRadius: 14, border: 'none',
                  background: canSave
                    ? 'linear-gradient(135deg, #D4A574 0%, #A87E3C 100%)'
                    : 'rgba(255,255,255,0.08)',
                  color: canSave ? '#0B0B0B' : 'rgba(255,255,255,0.25)',
                  fontSize: 14, fontWeight: 700,
                  cursor: canSave ? 'pointer' : 'not-allowed',
                  fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
                }}>
                {saving ? '⏳ Enregistrement…' : 'Enregistrer le mot de passe →'}
              </button>
            </form>
          </motion.div>
        )}

        {/* Succès */}
        {step === 'success' && (
          <motion.div key="success"
            initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: EASE }}
            style={{ textAlign: 'center', maxWidth: 400 }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>✅</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#F8F2EA', fontFamily: 'Inter, sans-serif', margin: '0 0 12px' }}>
              Mot de passe mis à jour
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(248,242,234,0.55)', fontFamily: 'Inter, sans-serif', margin: '0 0 8px', lineHeight: 1.7 }}>
              Votre nouveau mot de passe est actif.
            </p>
            <p style={{ fontSize: 13, color: 'rgba(212,165,116,0.6)', fontFamily: 'Inter, sans-serif', margin: 0 }}>
              Redirection vers l'accueil…
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
