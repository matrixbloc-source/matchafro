import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PRESETS = [
  { label: '+15 min', value: 15 },
  { label: '+30 min', value: 30 },
  { label: '+45 min', value: 45 },
  { label: '+60 min', value: 60 },
];

/**
 * DelayManager — panneau de gestion des retards pro.
 * Permet d'appliquer un retard global en cascade sur tous les RDV futurs.
 */
export default function DelayManager({ proId, currentDelay, onApply }) {
  const [loading, setLoading] = useState(false);
  const [lastApplied, setLastApplied] = useState(null);

  async function handleApply(mins) {
    setLoading(true);
    setLastApplied(mins);
    await new Promise(r => setTimeout(r, 300));
    onApply(mins);
    setLoading(false);
  }

  function handleReset() {
    setLastApplied(null);
    onApply(0);
  }

  return (
    <div>
      <p style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, fontFamily: 'Inter, sans-serif' }}>
        Déclarer un retard
      </p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {PRESETS.map(p => {
          const isActive = currentDelay === p.value;
          return (
            <button
              key={p.value}
              onClick={() => handleApply(p.value)}
              disabled={loading}
              aria-pressed={isActive}
              style={{
                padding: '8px 14px', borderRadius: 10, fontFamily: 'Inter, sans-serif',
                fontSize: 13, fontWeight: isActive ? 700 : 500, cursor: 'pointer',
                border: isActive ? '1.5px solid #D97706' : '1.5px solid #E5E7EB',
                background: isActive ? '#FFFBEB' : '#F9FAFB',
                color: isActive ? '#92400E' : '#374151',
                transition: 'all 0.15s',
                opacity: loading ? 0.6 : 1,
                minWidth: 44, minHeight: 44,
              }}
            >
              {p.label}
            </button>
          );
        })}

        {currentDelay > 0 && (
          <button
            onClick={handleReset}
            disabled={loading}
            style={{
              padding: '8px 14px', borderRadius: 10, fontFamily: 'Inter, sans-serif',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              border: '1.5px solid #FECACA', background: '#FEF2F2', color: '#DC2626',
              transition: 'all 0.15s', minWidth: 44, minHeight: 44,
            }}
          >
            ✕ Annuler le retard
          </button>
        )}
      </div>

      <AnimatePresence>
        {lastApplied && currentDelay > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ marginTop: 12, padding: '10px 14px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, fontSize: 12, color: '#92400E', fontFamily: 'Inter, sans-serif' }}>
              🔔 Retard de +{currentDelay} min appliqué. Toutes les clientes ont été notifiées.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
