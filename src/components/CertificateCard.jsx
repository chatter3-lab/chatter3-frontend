import { useState, useEffect, useRef } from 'react';

const API_URL = 'https://api.chatter3.com';
const getToken = () => localStorage.getItem('chatter3_token') || '';
const authFetch = (url, opts = {}) => {
  const token = getToken();
  const headers = { ...opts.headers, 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(url, { ...opts, headers });
};

const LEVEL_STYLES = {
  Bronze: { bg: 'linear-gradient(135deg, #cd7f32, #b8860b)', color: '#8b4513', icon: '🥉' },
  Silver: { bg: 'linear-gradient(135deg, #c0c0c0, #a8a8a8)', color: '#4a4a4a', icon: '🥈' },
  Gold: { bg: 'linear-gradient(135deg, #ffd700, #ffb347)', color: '#8b6914', icon: '🥇' },
};

export default function CertificateCard({ user, onBack }) {
  const [certs, setCerts] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef(null);

  useEffect(() => {
    loadCerts();
  }, []);

  const loadCerts = async () => {
    try {
      const r = await authFetch(`${API_URL}/api/certificate/list`);
      const d = await r.json();
      if (d.success) setCerts(d.certificates || []);
    } catch (e) {}
    setLoading(false);
  };

  const generateCert = async () => {
    setGenerating(true);
    try {
      const r = await authFetch(`${API_URL}/api/certificate/generate`, { method: 'POST' });
      const d = await r.json();
      if (d.success) {
        setCerts(prev => [d.certificate, ...prev]);
      }
    } catch (e) {}
    setGenerating(false);
  };

  const downloadCard = () => {
    if (!cardRef.current) return;
    // Use canvas to generate downloadable image
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    const cert = certs[0];
    const style = LEVEL_STYLES[cert?.level] || LEVEL_STYLES.Bronze;

    // Background
    const grad = ctx.createLinearGradient(0, 0, 800, 600);
    grad.addColorStop(0, '#1e1b4b');
    grad.addColorStop(1, '#312e81');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 600);

    // Border
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 760, 560);
    ctx.strokeRect(30, 30, 740, 540);

    // Title
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 36px Sora, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Certificate of Achievement', 400, 100);

    // Level
    ctx.font = 'bold 64px Sora, sans-serif';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`${style.icon} ${cert?.level || 'Bronze'}`, 400, 200);

    // Username
    ctx.font = '28px DM Sans, sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(`Awarded to`, 400, 280);
    ctx.font = 'bold 32px Sora, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(cert?.username || user?.nickname || user?.username || 'Learner', 400, 320);

    // Stats
    ctx.font = '20px DM Sans, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`CEFR Level: ${cert?.cefr_level || 'A1'}  ·  Sessions: ${cert?.sessions || 0}  ·  Hours: ${cert?.hours || 0}  ·  Streak: ${cert?.streak || 0} days`, 400, 380);

    // Date
    ctx.font = '16px DM Sans, sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.fillText(`Issued: ${cert?.issued_at ? new Date(cert.issued_at).toLocaleDateString() : new Date().toLocaleDateString()}`, 400, 440);

    // Footer
    ctx.font = '14px DM Sans, sans-serif';
    ctx.fillStyle = '#4f46e5';
    ctx.fillText('Chatter3 — Free English Conversation Practice', 400, 500);
    ctx.fillText('app.chatter3.com', 400, 520);

    // Download
    const link = document.createElement('a');
    link.download = `chatter3-certificate-${cert?.level || 'bronze'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem', color: '#94a3b8' }}>Loading certificates...</div>
    );
  }

  const latestCert = certs[0];
  const style = latestCert ? LEVEL_STYLES[latestCert.level] || LEVEL_STYLES.Bronze : LEVEL_STYLES.Bronze;

  return (
    <div style={{ maxWidth: 600, margin: '1rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Your Certificate</h2>
        <button onClick={onBack} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', fontSize: '.8rem' }}>← Back</button>
      </div>

      {/* Certificate Card */}
      {latestCert ? (
        <div ref={cardRef} style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', borderRadius: 16, padding: '2rem', textAlign: 'center', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 8, border: '2px solid rgba(255,215,0,0.3)', borderRadius: 12, pointerEvents: 'none' }} />
          <div style={{ fontSize: '3rem', marginBottom: 8 }}>{style.icon}</div>
          <div style={{ color: '#ffd700', fontSize: '.8rem', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Certificate of Achievement</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffd700', marginBottom: 12 }}>{latestCert.level}</div>
          <div style={{ color: '#94a3b8', fontSize: '.85rem', marginBottom: 4 }}>Awarded to</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 16 }}>{latestCert.username || user?.nickname || user?.username}</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16, flexWrap: 'wrap' }}>
            <div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffd700' }}>{latestCert.cefr_level}</div><div style={{ fontSize: '.75rem', color: '#94a3b8' }}>CEFR Level</div></div>
            <div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffd700' }}>{latestCert.sessions}</div><div style={{ fontSize: '.75rem', color: '#94a3b8' }}>Sessions</div></div>
            <div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffd700' }}>{latestCert.hours}h</div><div style={{ fontSize: '.75rem', color: '#94a3b8' }}>Practice</div></div>
            <div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffd700' }}>{latestCert.streak}</div><div style={{ fontSize: '.75rem', color: '#94a3b8' }}>Day Streak</div></div>
          </div>
          <div style={{ fontSize: '.75rem', color: '#6b7280' }}>
            Issued {latestCert.issued_at ? new Date(latestCert.issued_at).toLocaleDateString() : 'Today'}
          </div>
          <div style={{ fontSize: '.7rem', color: '#4f46e5', marginTop: 8 }}>Chatter3 — app.chatter3.com</div>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 16, padding: '2rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,.08)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎓</div>
          <h3 style={{ margin: '0 0 .5rem' }}>No Certificate Yet</h3>
          <p style={{ color: '#6b7280', margin: '0 0 1rem', fontSize: '.9rem' }}>
            Complete sessions and take the CEFR assessment to earn your certificate!
          </p>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={generateCert} disabled={generating} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#4f46e5', color: 'white', cursor: generating ? 'not-allowed' : 'pointer', opacity: generating ? 0.5 : 1, fontSize: '.9rem', fontWeight: 600 }}>
          {generating ? 'Generating...' : latestCert ? 'Regenerate Certificate' : 'Generate Certificate'}
        </button>
        {latestCert && (
          <button onClick={downloadCard} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', fontSize: '.9rem' }}>
            📥 Download PNG
          </button>
        )}
      </div>

      {/* History */}
      {certs.length > 1 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: '1rem', margin: '0 0 8px', color: '#374151' }}>Previous Certificates</h3>
          {certs.slice(1).map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: '#f9fafb', borderRadius: 8, marginBottom: 4, fontSize: '.85rem' }}>
              <span>{LEVEL_STYLES[c.level]?.icon || '🥉'}</span>
              <span style={{ fontWeight: 600 }}>{c.level}</span>
              <span style={{ color: '#6b7280' }}>· {c.cefr_level}</span>
              <span style={{ color: '#9ca3af', marginLeft: 'auto' }}>{new Date(c.issued_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}