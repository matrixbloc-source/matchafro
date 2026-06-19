/**
 * ClientValidationBanner — MatchAfro Phase 2
 * S'affiche sur le profil public quand un client a un RDV "completed"
 * qui n'a pas encore été validé.
 * Détection : localStorage 'ma_completed_booking_{proId}'
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext.jsx';

const EASE = [0.22, 1, 0.36, 1];

export default function ClientValidationBanner({ pro }) {
  const { bookings, submitClientValidation } = useApp();

  const pendingId = typeof window !== 'undefined'
    ? localStorage.getItem('ma_completed_booking_' + pro.id)
    : null;

  const booking = pendingId ? bookings.find(b => b.id === pendingId && b.status === 'completed' && b.clientValidated == null) : null;

  const [step,    setStep]    = useState('ask');   // ask | rate | done
  const [thumbs,  setThumbs]  = useState(null);    // true | false
  const [comment, setComment] = useState('');
  const [visible, setVisible] = useState(true);

  if (!booking || !visible) return null;

  function handleValidate(ok) {
    if (step === 'rate') return;
    if (!ok) {
      submitClientValidation(booking.id, false, null);
      setStep('done');
      return;
    }
    setThumbs(true);
    setStep('rate');
  }

  function handleSubmitReview() {
    submitClientValidation(booking.id, thumbs, comment.trim() || null);
    setStep('done');
    setTimeout(() => setVisible(false), 2000);
  }

  function handleSkip() {
    localStorage.removeItem('ma_completed_booking_' + pro.id);
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.38, ease: EASE }}
          style={{
            background: 'linear-gradient(135deg, #0B0B0C 0%, #1C1410 100%)',
            borderRadius: 20,
            padding: '22px 24px',
            marginBottom: 24,
            border: '1px solid rgba(201,134,58,0.25)',
            boxShadow: '0 16px 48px rgba(11,11,12,0.18)',
          }}
        >
          {step === 'ask' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 28 }}>✨</span>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: 0, fontFamily: 'Inter, sans-serif' }}>
                    Votre prestation est terminée !
                  </p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: '2px 0 0', fontFamily: 'Inter, sans-serif' }}>
                    {booking.service} avec {pro.name}
                  </p>
                </div>
                <button onClick={handleSkip} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: 18, flexShrink: 0 }}>✕</button>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', margin: '0 0 16px', fontFamily: 'Inter, sans-serif' }}>
                Comment s'est passée votre séance ?
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => handleValidate(true)}
                  style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #059669, #047857)', color: '#fff', fontSize: 14, fontWeight: 800, fontFamily: 'Inter, sans-serif', transition: 'opacity 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  ✅ Tout s'est bien passé
                </button>
                <button
                  onClick={() => handleValidate(false)}
                  style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1.5px solid rgba(220,38,38,0.4)', cursor: 'pointer', background: 'rgba(220,38,38,0.08)', color: '#FCA5A5', fontSize: 14, fontWeight: 800, fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.08)'; }}
                >
                  ❌ Signaler un problème
                </button>
              </div>
            </>
          )}

          {step === 'rate' && (
            <>
              <p style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: '0 0 16px', fontFamily: 'Inter, sans-serif' }}>
                Vous recommandez {pro.name.split(' ')[0]} ?
              </p>
              <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                {[true, false].map(v => (
                  <button
                    key={String(v)}
                    onClick={() => setThumbs(v)}
                    style={{
                      flex: 1, padding: '10px', borderRadius: 12, cursor: 'pointer',
                      border: `1.5px solid ${thumbs === v ? '#C9863A' : 'rgba(255,255,255,0.12)'}`,
                      background: thumbs === v ? 'rgba(201,134,58,0.18)' : 'rgba(255,255,255,0.05)',
                      color: thumbs === v ? '#F4C16F' : 'rgba(255,255,255,0.65)',
                      fontSize: 18, fontWeight: 700, fontFamily: 'Inter, sans-serif',
                      transition: 'all 0.18s',
                    }}
                  >
                    {v ? '👍 Je recommande' : '👎 Pas recommandé'}
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Commentaire facultatif…"
                rows={2}
                style={{ width: '100%', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '10px 12px', fontSize: 13, fontFamily: 'Inter, sans-serif', resize: 'none', boxSizing: 'border-box', marginBottom: 12 }}
              />
              <button
                onClick={handleSubmitReview}
                disabled={thumbs === null}
                style={{
                  width: '100%', padding: '12px', borderRadius: 12, border: 'none', cursor: thumbs !== null ? 'pointer' : 'not-allowed',
                  background: thumbs !== null ? 'linear-gradient(135deg, #C9863A, #8A4F26)' : '#374151',
                  color: '#fff', fontSize: 14, fontWeight: 800, fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
                }}
              >
                Publier mon avis
              </button>
            </>
          )}

          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🙏</div>
              <p style={{ fontSize: 15, fontWeight: 800, color: '#F4C16F', margin: '0 0 4px', fontFamily: 'Inter, sans-serif' }}>
                Merci pour votre retour !
              </p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontFamily: 'Inter, sans-serif' }}>
                Votre avis aide la communauté MatchAfro.
              </p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
