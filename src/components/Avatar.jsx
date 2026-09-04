import React, { useState, memo } from 'react';

export default memo(function Avatar({ src, name, size = 40, style = {}, ...props }) {
  const [error, setError] = useState(false);
  const initials = (name || '?').charAt(0).toUpperCase();
  const colors = ['#4f46e5', '#7c3aed', '#2563eb', '#0891b2', '#059669', '#d97706', '#dc2626', '#db2777'];
  const colorIdx = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;
  if (src && !error) {
    return <img src={src} alt={name || ''} loading="lazy" onError={() => setError(true)} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', ...style }} {...props} />;
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: colors[colorIdx], display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: size * 0.4, flexShrink: 0, ...style }} {...props}>
      {initials}
    </div>
  );
});
