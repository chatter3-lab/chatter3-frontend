import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);
  const success = useCallback((msg) => add(msg, 'success'), [add]);
  const error = useCallback((msg) => add(msg, 'error', 5000), [add]);
  const info = useCallback((msg) => add(msg, 'info'), [add]);
  return (
    <ToastContext.Provider value={{ add, success, error, info }}>
      {children}
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 10000, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360 }}>
        {toasts.map(t => (
          <div key={t.id} role="alert" aria-live="assertive" style={{
            padding: '12px 16px', borderRadius: 8, color: 'white', fontSize: '.88rem', fontWeight: 500,
            boxShadow: '0 4px 12px rgba(0,0,0,.15)', cursor: 'pointer',
            background: t.type === 'success' ? '#22c55e' : t.type === 'error' ? '#ef4444' : '#4f46e5',
            animation: 'toastIn .3s ease'
          }} onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>
            {t.type === 'success' ? '✓ ' : t.type === 'error' ? '✕ ' : 'ℹ '}{t.message}
          </div>
        ))}
      </div>
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </ToastContext.Provider>
  );
}
