import { useState, useEffect, useCallback, createContext, useContext } from 'react';

const API_URL = 'https://api.chatter3.com';

// Simple hash function for deterministic variant assignment
function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

// Client-side deterministic variant assignment (no network needed)
function assignVariantLocally(experimentId, userId, variants, trafficPct = 50) {
  if (!variants || variants.length === 0) return null;
  const hash = userId ? hashStr(userId + experimentId) : Math.floor(Math.random() * 10000);
  const bucket = hash % 100;
  if (bucket >= trafficPct) return variants[0]; // control for out-of-traffic
  const idx = hashStr(String(hash)) % variants.length;
  return variants[idx];
}

// Experiment context
const ExperimentContext = createContext({
  variants: {},
  trackEvent: () => {},
  getVariant: () => null,
});

export function ExperimentProvider({ children, userId }) {
  const [variants, setVariants] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('chatter3_experiments') || '{}');
    } catch { return {}; }
  });

  const trackEvent = useCallback(async (experimentId, eventName, value = 0, metadata = {}) => {
    try {
      await fetch(`${API_URL}/api/experiments/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experiment_id: experimentId,
          user_id: userId,
          event_name: eventName,
          value,
          metadata
        })
      });
    } catch (e) {
      console.error('Failed to track experiment event:', e);
    }
  }, [userId]);

  const getVariant = useCallback((experimentId) => {
    return variants[experimentId] || null;
  }, [variants]);

  const assignVariant = useCallback(async (experimentId) => {
    if (variants[experimentId]) return variants[experimentId];
    try {
      const r = await fetch(`${API_URL}/api/experiments/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experiment_id: experimentId, user_id: userId })
      });
      const d = await r.json();
      if (d.variant) {
        setVariants(prev => {
          const next = { ...prev, [experimentId]: d.variant };
          localStorage.setItem('chatter3_experiments', JSON.stringify(next));
          return next;
        });
        return d.variant;
      }
    } catch (e) {
      console.error('Failed to assign experiment variant:', e);
    }
    return null;
  }, [userId, variants]);

  return (
    <ExperimentContext.Provider value={{ variants, trackEvent, getVariant, assignVariant }}>
      {children}
    </ExperimentContext.Provider>
  );
}

// Hook for using experiments
export function useExperiment(experimentId, variants = ['control', 'variant_a'], options = {}) {
  const { trackEvent, getVariant, assignVariant } = useContext(ExperimentContext);
  const [variant, setVariant] = useState(() => getVariant(experimentId));
  const [loading, setLoading] = useState(!variant);

  useEffect(() => {
    if (!variant) {
      assignVariant(experimentId).then(v => {
        setVariant(v);
        setLoading(false);
      });
    }
  }, [experimentId]);

  const track = useCallback((eventName, value = 0, metadata = {}) => {
    if (variant) {
      trackEvent(experimentId, eventName, value, metadata);
    }
  }, [variant, experimentId, trackEvent]);

  return { variant, loading, track, isControl: variant === variants[0] };
}

// Helper component for conditional rendering based on variant
export function ExperimentVariant({ experimentId, variants, children }) {
  const { variant } = useExperiment(experimentId, variants);
  if (typeof children === 'function') {
    return children({ variant, isControl: variant === variants[0] });
  }
  return children;
}