import { motion } from 'framer-motion';
import { calculateReliability, reliabilityColor } from '../../lib/smartTimeEngine.js';
import { useApp } from '../../context/AppContext.jsx';

/**
 * ReliabilityScore — affiche le score de fiabilité d'un pro.
 * Calcule en temps réel depuis bookings + reviews du contexte.
 */
export default function ReliabilityScore({ proId, compact = false }) {
  const { bookings, reviews } = useApp();
  const { score, label, breakdown } = calculateReliability(proId, bookings, reviews);
  const color = reliabilityColor(score);

  if (compact) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'Inter, sans-serif' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color, background: color + '18', border: `1px solid ${color}30`, borderRadius: 20, padding: '2px 8px' }}>
          ✓ Fiabilité {score}%
        </span>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: '18px 20px', fontFamily: 'Inter, sans-serif' }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
        Score de fiabilité
      </p>

      {/* Score ring */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
        <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
          <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="32" cy="32" r="26" fill="none" stroke="#F3F4F6" strokeWidth="6" />
            <motion.circle
              cx="32" cy="32" r="26" fill="none"
              stroke={color} strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 26}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 26 * (1 - score / 100) }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <span style={{ fontSize: 15, fontWeight: 900, color, lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: 9, color: '#9CA3AF' }}>/ 100</span>
          </div>
        </div>
        <div>
          <p style={{ fontSize: 16, fontWeight: 800, color, marginBottom: 2 }}>{label}</p>
          <p style={{ fontSize: 12, color: '#9CA3AF' }}>{breakdown.total} RDV analysés</p>
        </div>
      </div>

      {/* Breakdown bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <ScoreBar label="Honorés" value={breakdown.completed} total={breakdown.total} color="#059669" />
        <ScoreBar label="Retards"    value={breakdown.late}      total={breakdown.total} color="#D97706" />
        <ScoreBar label="Annulations" value={breakdown.cancelled} total={breakdown.total} color="#EF4444" />
        <div style={{ marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#9CA3AF' }}>Note moyenne</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#F59E0B' }}>
            {'★'.repeat(Math.round(breakdown.avgRating))} {breakdown.avgRating.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ label, value, total, color }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 11, color: '#6B7280', minWidth: 80 }}>{label}</span>
      <div style={{ flex: 1, height: 6, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ height: '100%', background: color, borderRadius: 3 }}
        />
      </div>
      <span style={{ fontSize: 11, color: '#374151', fontWeight: 600, minWidth: 24, textAlign: 'right' }}>{value}</span>
    </div>
  );
}
