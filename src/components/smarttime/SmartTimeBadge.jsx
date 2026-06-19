import { motion } from 'framer-motion';
import { getSmartTimeStatus } from '../../lib/smartTimeEngine.js';

/**
 * SmartTimeBadge — badge temps réel indiquant le statut de ponctualité.
 * 🟢 À l'heure (0–10 min)
 * 🟠 Léger retard (11–25 min)
 * 🔴 Retard important (26+ min)
 */
export default function SmartTimeBadge({ delayMinutes = 0, showDelay = true, size = 'md' }) {
  const s = getSmartTimeStatus(delayMinutes);
  const styles = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <motion.div
      key={s.level}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: styles.gap,
        background: s.bg, border: `1px solid ${s.border}`,
        borderRadius: 20, padding: styles.padding,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <span style={{ fontSize: styles.emoji }}>{s.emoji}</span>
      <span style={{ fontSize: styles.text, fontWeight: 700, color: s.color }}>
        {s.label}
      </span>
      {showDelay && delayMinutes > 0 && (
        <span style={{ fontSize: styles.sub, color: s.color, opacity: 0.75 }}>
          +{delayMinutes} min
        </span>
      )}
    </motion.div>
  );
}

const SIZE_MAP = {
  sm: { gap: 4,  padding: '2px 8px',   emoji: 10, text: 11, sub: 10 },
  md: { gap: 5,  padding: '4px 10px',  emoji: 12, text: 12, sub: 11 },
  lg: { gap: 6,  padding: '6px 14px',  emoji: 14, text: 14, sub: 12 },
};
