import React, { useState, useEffect, useRef } from 'react';

export default function NotificationCenter({ user, API_URL, authFetch }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);
  const buttonRef = useRef(null);
  const [popupStyle, setPopupStyle] = useState({});

  useEffect(() => {
    if (!user) return;
    const load = () => {
      authFetch(`${API_URL}/api/notifications`).then(r => r.json()).then(d => {
        if (d.success) { setNotifications(d.notifications || []); setUnread(d.unread || 0); }
      }).catch(() => {});
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleToggle = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const pw = Math.min(320, vw - 16);
      let left = rect.right - pw;
      if (left < 8) left = 8;
      setPopupStyle({ position: 'fixed', top: rect.bottom + 4, left, width: pw });
    }
    setOpen(!open);
  };

  if (!user) return null;
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button ref={buttonRef} onClick={handleToggle} aria-label="Notifications" style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: 4 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        {unread > 0 && <span style={{ position: 'absolute', top: 0, right: 0, background: '#ef4444', color: 'white', borderRadius: '50%', width: 16, height: 16, fontSize: '.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <div role="dialog" aria-label="Notifications" style={{ ...popupStyle, background: 'white', borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,.15)', maxHeight: 400, overflow: 'auto', zIndex: 100 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontWeight: 700, fontSize: '.9rem' }}>Notifications</div>
          {notifications.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: '#9ca3af', fontSize: '.85rem' }}>No notifications yet</div>
          ) : notifications.map(n => (
            <div key={n.id} style={{ padding: '10px 16px', borderBottom: '1px solid #f3f4f6', background: n.read ? 'white' : '#f0f4ff', fontSize: '.85rem', overflowWrap: 'break-word' }}>
              <div>{n.message}</div>
              <div style={{ fontSize: '.72rem', color: '#9ca3af', marginTop: 2 }}>{new Date(n.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
