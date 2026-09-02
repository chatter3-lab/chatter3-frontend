import React, { useState, useEffect, useRef } from 'react';

export default function ConfirmDialog({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'danger', requireInput, onConfirm, onCancel }) {
  const [inputVal, setInputVal] = useState('');
  const inputRef = useRef(null);
  const confirmDisabled = requireInput && inputVal !== requireInput;
  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);
  const colors = { danger: '#ef4444', warning: '#f59e0b', info: '#4f46e5' };
  return (
    <div role="dialog" aria-modal="true" aria-label={title} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }} onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 12, padding: '1.5rem', maxWidth: 420, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>
        <h3 style={{ margin: '0 0 .75rem', fontSize: '1.1rem', fontWeight: 700 }}>{title}</h3>
        <p style={{ margin: '0 0 1rem', fontSize: '.9rem', color: '#6b7280', lineHeight: 1.5 }}>{message}</p>
        {requireInput && (
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '.82rem', color: '#374151', margin: '0 0 .4rem' }}>Type <b>{requireInput}</b> to confirm:</p>
            <input ref={inputRef} value={inputVal} onChange={e => setInputVal(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '.9rem', boxSizing: 'border-box' }} />
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', fontSize: '.88rem' }}>{cancelLabel}</button>
          <button onClick={onConfirm} disabled={confirmDisabled} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: colors[variant], color: 'white', cursor: confirmDisabled ? 'not-allowed' : 'pointer', opacity: confirmDisabled ? .5 : 1, fontSize: '.88rem', fontWeight: 600 }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
