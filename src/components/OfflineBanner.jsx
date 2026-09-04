import React, { useState, useEffect, memo } from 'react';

export default memo(function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);
  if (online) return null;
  return (
    <div role="alert" style={{ background: '#f59e0b', color: '#78350f', padding: '8px 16px', textAlign: 'center', fontSize: '.85rem', fontWeight: 600, position: 'sticky', top: 0, zIndex: 1000 }}>
      ⚠️ You are offline — some features may not work
    </div>
  );
});
