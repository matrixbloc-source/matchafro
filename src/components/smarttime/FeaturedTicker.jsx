import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext.jsx';

/** Vitesse : pixels/seconde — adaptée à la largeur du contenu */
const SPEED = 40;

function TickerItem({ pro, type }) {
  const isFounder  = type === 'founder';
  const isSponsored = type === 'sponsored';

  const now = new Date();
  const hour = now.getHours();
  const available = hour < 14 ? 'aujourd\'hui' : 'demain matin';

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, paddingRight: 40, flexShrink: 0, fontFamily: 'Inter, sans-serif' }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: isFounder ? '#D97706' : '#7C3AED' }}>
        {isFounder ? '🔥 Fondateur' : '⭐ Sponsorisé'}
      </span>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
        {pro.name}
      </span>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
        {pro.city}
      </span>
      <span style={{ fontSize: 11, color: '#D97706' }}>
        · Disponible {available}
      </span>
      {isSponsored && (
        <span style={{ fontSize: 11, background: '#7C3AED', color: '#fff', borderRadius: 4, padding: '1px 6px', fontWeight: 700 }}>
          -20%
        </span>
      )}
      <span style={{ color: 'rgba(255,255,255,0.15)', margin: '0 4px' }}>·</span>
    </span>
  );
}

/**
 * FeaturedTicker — bandeau défilant infini affichant les pros fondateurs
 * et sponsorisés, avec animation premium.
 */
export default function FeaturedTicker() {
  const { pros } = useApp();

  const items = useMemo(() => {
    const founders  = pros.filter(p => p.founder  && p.active && !p.suspended).map(p => ({ pro: p, type: 'founder' }));
    const sponsored = pros.filter(p => p.verified && !p.founder && p.active && !p.suspended).slice(0, 3).map(p => ({ pro: p, type: 'sponsored' }));
    return [...founders, ...sponsored];
  }, [pros]);

  if (items.length === 0) return null;

  const doubled = [...items, ...items];
  const approxWidth = items.length * 260;
  const duration = approxWidth / SPEED;

  return (
    <div style={{
      overflow: 'hidden', background: '#0F0F0F', borderRadius: 14,
      padding: '11px 0', borderTop: '1px solid rgba(217,119,6,0.25)',
      position: 'relative',
    }}>
      {/* Fade edges */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 40, background: 'linear-gradient(to right, #0F0F0F, transparent)', zIndex: 1, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 40, background: 'linear-gradient(to left, #0F0F0F, transparent)', zIndex: 1, pointerEvents: 'none' }} />

      <motion.div
        animate={{ x: ['0px', `-${approxWidth}px`] }}
        transition={{ duration, repeat: Infinity, ease: 'linear' }}
        style={{ display: 'inline-flex', paddingLeft: 20, willChange: 'transform' }}
      >
        {doubled.map(({ pro, type }, i) => (
          <TickerItem key={`${pro.id}-${i}`} pro={pro} type={type} />
        ))}
      </motion.div>
    </div>
  );
}
