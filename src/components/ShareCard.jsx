import { useState, useRef } from 'react';

const API_URL = 'https://api.chatter3.com';
const getToken = () => localStorage.getItem('chatter3_token') || '';
const authFetch = (url, opts = {}) => {
  const token = getToken();
  const headers = { ...opts.headers, 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(url, { ...opts, headers });
};

const CARD_THEMES = {
  streak: { title: 'Day Streak', emoji: '🔥', gradient: ['#f97316', '#ef4444'] },
  sessions: { title: 'Sessions Milestone', emoji: '🎯', gradient: ['#4f46e5', '#7c3aed'] },
  level: { title: 'Level Up', emoji: '⬆️', gradient: ['#059669', '#10b981'] },
  certificate: { title: 'Certificate Earned', emoji: '🎓', gradient: ['#d97706', '#f59e0b'] },
  milestone: { title: 'Achievement Unlocked', emoji: '🏆', gradient: ['#dc2626', '#f97316'] },
};

export default function ShareCard({ user, onClose }) {
  const [cardData, setCardData] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [cardType, setCardType] = useState('streak');
  const [customText, setCustomText] = useState('');
  const cardRef = useRef(null);

  const generateCard = async () => {
    setGenerating(true);
    try {
      const customData = {};
      if (cardType === 'streak') customData.streak_days = user?.streak_count || 0;
      if (cardType === 'sessions') customData.total_sessions = user?.total_sessions || 0;
      if (cardType === 'milestone') customData.custom_text = customText;

      const r = await authFetch(`${API_URL}/api/share/card`, {
        method: 'POST',
        body: JSON.stringify({ card_type: cardType, data: customData })
      });
      const d = await r.json();
      if (d.success) setCardData(d.card);
    } catch (e) {}
    setGenerating(false);
  };

  const downloadCard = () => {
    if (!cardRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    const theme = CARD_THEMES[cardType] || CARD_THEMES.streak;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 600, 400);
    grad.addColorStop(0, theme.gradient[0]);
    grad.addColorStop(1, theme.gradient[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 400);

    // Pattern overlay
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    for (let i = 0; i < 600; i += 30) {
      for (let j = 0; j < 400; j += 30) {
        if ((i + j) % 60 === 0) {
          ctx.beginPath();
          ctx.arc(i, j, 15, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Emoji
    ctx.font = '64px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(theme.emoji, 300, 120);

    // Title
    ctx.font = 'bold 32px Sora, sans-serif';
    ctx.fillStyle = 'white';
    ctx.fillText(theme.title, 300, 170);

    // Username
    ctx.font = '20px DM Sans, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText(cardData?.username || user?.nickname || user?.username || 'Learner', 300, 210);

    // Stats
    ctx.font = 'bold 48px Sora, sans-serif';
    ctx.fillStyle = 'white';
    let statText = '';
    if (cardType === 'streak') statText = `${cardData?.streak_days || user?.streak_count || 0} Days`;
    else if (cardType === 'sessions') statText = `${cardData?.sessions || user?.total_sessions || 0} Sessions`;
    else if (cardType === 'level') statText = `${cardData?.cefr_level || 'A1'}`;
    else if (cardType === 'certificate') statText = `${cardData?.level || 'Bronze'}`;
    else if (cardType === 'milestone') statText = customText || 'Achievement!';
    ctx.fillText(statText, 300, 280);

    // Subtitle
    ctx.font = '14px DM Sans, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    if (cardType === 'streak') ctx.fillText('Consecutive days practicing English', 300, 310);
    else if (cardType === 'sessions') ctx.fillText('Video calls completed on Chatter3', 300, 310);
    else if (cardType === 'level') ctx.fillText('CEFR English Level', 300, 310);
    else if (cardType === 'certificate') ctx.fillText('Certificate of Achievement', 300, 310);
    else if (cardType === 'milestone') ctx.fillText('Keep up the amazing work!', 300, 310);

    // Footer
    ctx.font = '12px DM Sans, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText('app.chatter3.com — Free English Practice', 300, 370);

    // Download
    const link = document.createElement('a');
    link.download = `chatter3-${cardType}-card.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const shareToSocial = (platform) => {
    const text = encodeURIComponent(`I'm practicing English on Chatter3! 🔥 ${cardType === 'streak' ? `${user?.streak_count || 0}-day streak` : cardType === 'sessions' ? `${user?.total_sessions || 0} sessions completed` : 'Join me for free!'} #Chatter3 #LearnEnglish`);
    const url = 'https://app.chatter3.com';
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${text}`,
      whatsapp: `https://wa.me/?text=${text}%20${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  const theme = CARD_THEMES[cardType] || CARD_THEMES.streak;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '1rem' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 16, padding: '1.5rem', maxWidth: 500, width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Share Your Progress</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#9ca3af' }}>×</button>
        </div>

        {/* Card type selector */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {Object.entries(CARD_THEMES).map(([key, t]) => (
            <button
              key={key}
              onClick={() => { setCardType(key); setCardData(null); }}
              style={{
                padding: '6px 12px', borderRadius: 20, border: '2px solid',
                borderColor: cardType === key ? t.gradient[0] : '#e5e7eb',
                background: cardType === key ? `${t.gradient[0]}11` : 'white',
                cursor: 'pointer', fontSize: '.8rem', fontWeight: 600,
                color: cardType === key ? t.gradient[0] : '#6b7280'
              }}
            >
              {t.emoji} {t.title}
            </button>
          ))}
        </div>

        {/* Custom text for milestone */}
        {cardType === 'milestone' && (
          <input
            value={customText}
            onChange={e => setCustomText(e.target.value)}
            placeholder="e.g., 100 words learned!"
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, marginBottom: 12, fontSize: '.9rem', boxSizing: 'border-box' }}
          />
        )}

        {/* Preview card */}
        <div ref={cardRef} style={{ background: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`, borderRadius: 12, padding: '1.5rem', textAlign: 'center', color: 'white', marginBottom: 16 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 4 }}>{theme.emoji}</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>{theme.title}</div>
          <div style={{ fontSize: '.9rem', opacity: 0.8, marginBottom: 12 }}>{cardData?.username || user?.nickname || user?.username}</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 4 }}>
            {cardType === 'streak' && `${cardData?.streak_days || user?.streak_count || 0} Days`}
            {cardType === 'sessions' && `${cardData?.sessions || user?.total_sessions || 0} Sessions`}
            {cardType === 'level' && (cardData?.cefr_level || 'A1')}
            {cardType === 'certificate' && (cardData?.level || 'Bronze')}
            {cardType === 'milestone' && (customText || 'Achievement!')}
          </div>
          <div style={{ fontSize: '.75rem', opacity: 0.6 }}>app.chatter3.com</div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <button onClick={generateCard} disabled={generating} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#4f46e5', color: 'white', cursor: generating ? 'not-allowed' : 'pointer', opacity: generating ? 0.5 : 1, fontSize: '.85rem', fontWeight: 600, minWidth: 120 }}>
            {generating ? 'Generating...' : 'Generate Card'}
          </button>
          {cardData && (
            <button onClick={downloadCard} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', fontSize: '.85rem', minWidth: 120 }}>
              📥 Download
            </button>
          )}
        </div>

        {/* Share buttons */}
        {cardData && (
          <div>
            <div style={{ fontSize: '.8rem', color: '#6b7280', marginBottom: 8, textAlign: 'center' }}>Share on</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button onClick={() => shareToSocial('twitter')} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#1da1f2', color: 'white', cursor: 'pointer', fontSize: '.8rem' }}>Twitter</button>
              <button onClick={() => shareToSocial('facebook')} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#1877f2', color: 'white', cursor: 'pointer', fontSize: '.8rem' }}>Facebook</button>
              <button onClick={() => shareToSocial('whatsapp')} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#25d366', color: 'white', cursor: 'pointer', fontSize: '.8rem' }}>WhatsApp</button>
              <button onClick={() => shareToSocial('linkedin')} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#0a66c2', color: 'white', cursor: 'pointer', fontSize: '.8rem' }}>LinkedIn</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}