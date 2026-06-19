import { useState, useEffect } from 'react';

/**
 * LiveClock — horloge temps réel avec secondes.
 * Se met à jour chaque seconde.
 */
export default function LiveClock({ size = 'md' }) {
  const [time, setTime] = useState(getTimeStr());

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeStr()), 1000);
    return () => clearInterval(id);
  }, []);

  const styles = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: styles.icon }}>🕒</span>
      <span style={{
        fontFamily: "'Inter', monospace", fontWeight: 700,
        fontSize: styles.text, color: '#0F0F0F', letterSpacing: '0.04em',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {time}
      </span>
    </div>
  );
}

function getTimeStr() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

const SIZE_MAP = {
  sm: { icon: 12, text: 12 },
  md: { icon: 14, text: 14 },
  lg: { icon: 18, text: 22 },
};
