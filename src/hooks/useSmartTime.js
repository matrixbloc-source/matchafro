import { useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { getSmartTimeStatus, calculateReliability } from '../lib/smartTimeEngine.js';

/**
 * useSmartTime(proId)
 * Gives a component read/write access to Smart Time™ state for a given pro.
 */
export function useSmartTime(proId) {
  const {
    proDelays, applyProDelay,
    notifications, clearNotification, clearAllNotifications,
    bookings, reviews,
  } = useApp();

  const currentDelay = proDelays?.[proId] ?? 0;
  const status = useMemo(() => getSmartTimeStatus(currentDelay), [currentDelay]);

  const proNotifications = useMemo(
    () => (notifications || []).filter(n => n.proId === proId && !n.read),
    [notifications, proId]
  );

  const reliability = useMemo(
    () => calculateReliability(proId, bookings, reviews),
    [proId, bookings, reviews]
  );

  return {
    currentDelay,
    status,
    proNotifications,
    reliability,
    applyDelay: (mins) => applyProDelay(proId, mins),
    resetDelay: () => applyProDelay(proId, 0),
    clearNotification,
    clearAll: () => clearAllNotifications?.(proId),
  };
}
