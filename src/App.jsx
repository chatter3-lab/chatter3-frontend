import React, { useState, useEffect, useRef } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

// --- Configuration ---
const API_URL = 'https://api.chatter3.com'; 
const WS_URL = 'wss://api.chatter3.com';
const GOOGLE_CLIENT_ID = "935611169333-7rdmfeic279un9jdl03vior15463aaba.apps.googleusercontent.com";

// --- SOUND ASSETS ---
const SOUNDS = {
  match: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3', // Cheerful Bell
  start: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3', // Connection Swish
  end: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',   // Soft Disconnect
  points: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3' // Win/Success
};

const playSound = (type) => {
  try {
    const audio = new Audio(SOUNDS[type]);
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Audio play blocked/failed', e));
  } catch (e) {
    console.error("Sound error", e);
  }
};

// --- INLINE STYLES ---
const STYLES = `
/* Reset */
* { box-sizing: border-box; }
body, html { margin: 0; padding: 0; width: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; background-color: #f5f5f5; }
#root { width: 100%; margin: 0; padding: 0; }

/* Layout */
.app-container { display: flex; flex-direction: column; min-height: 100vh; width: 100%; }
.app-content { flex: 1; display: flex; flex-direction: column; width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 1rem; }

/* Header */
.app-header { background: white; padding: 1rem 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
.app-header-content { display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
.logo-container { display: flex; align-items: center; gap: 0.5rem; }

/* Header Logo (Small) */
.header-logo-img { height: 400px; width: auto; object-fit: contain; }

/* Auth Main Logo (Large 400px) */
.auth-logo { width: 100%; max-width: 400px; height: auto; object-fit: contain; margin-bottom: 1rem; }

.logo-text { font-size: 1.5rem; font-weight: bold; color: #333; }
.user-info { display: flex; gap: 1rem; align-items: center; }
.user-info span { font-weight: 500; }
.user-info button { padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; transition: background 0.3s; }
.user-info button:hover { background: #d32f2f; }

/* Auth */
.auth-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1rem; }
.auth-box { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); text-align: center; width: 100%; max-width: 500px; }
.auth-header { display: flex; flex-direction: column; align-items: center; margin-bottom: 1.5rem; }
.auth-title { font-size: 1.5rem; font-weight: bold; color: #333; margin: 0.5rem 0; }
.auth-subtitle { color: #666; margin-bottom: 0.5rem; font-size: 1.1rem; }
.auth-divider { margin: 1.5rem 0; color: #999; position: relative; }
.auth-divider::before { content: ''; position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: #eee; }
.google-button-container { display: flex; justify-content: center; margin: 1rem 0; width: 100%; }
.auth-link { color: #4285f4; background: none; border: none; cursor: pointer; text-decoration: none; margin-top: 1rem; display: block; width: 100%; }
.auth-link:hover { text-decoration: underline; }
.error-message { background: #ffebee; color: #c62828; padding: 10px; border-radius: 4px; margin-bottom: 1rem; border-left: 4px solid #c62828; text-align: left; }

/* Forms */
.register-form { text-align: left; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500; }
.form-group input, .form-group select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; box-sizing: border-box; }
.register-form button[type="submit"], .email-register-btn { width: 100%; padding: 12px; background: #4285f4; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; margin-top: 1rem; }
.back-button { width: 100%; padding: 12px; background: white; color: #4285f4; border: 2px solid #4285f4; border-radius: 4px; font-size: 16px; cursor: pointer; margin-top: 0.5rem; }

/* Dashboard */
.dashboard-container { padding: 2rem 1rem; text-align: center; }
.welcome-message h2 { color: #333; margin-bottom: 1rem; font-size: 2rem; }
.welcome-message p { color: #666; font-size: 1.2rem; margin-bottom: 2rem; }
.start-matching-btn { padding: 12px 24px; background: #4285f4; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; transition: background 0.3s; }
.user-stats { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin: 2rem auto; max-width: 600px; text-align: left; }
.user-stats h3 { margin-bottom: 1rem; color: #333; }
.stat-item { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #eee; }
.stat-item:last-child { border-bottom: none; }

/* Profile View Styles */
.profile-section { max-width: 600px; margin: 0 auto; text-align: left; background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
.profile-header { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; }
.profile-avatar { width: 100px; height: 100px; border-radius: 50%; background: #e0e7ff; color: #4f46e5; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: bold; object-fit: cover; margin: 0 auto 1.5rem; }
.upload-btn { background: #eee; border: 1px solid #ddd; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.9rem; display: inline-block; }
.save-btn { background: #10b981; color: white; border: none; padding: 12px; width: 100%; border-radius: 4px; font-size: 16px; cursor: pointer; margin-top: 1rem; }
.save-btn:hover { background: #059669; }
.history-list { margin-top: 2rem; border-top: 1px solid #eee; padding-top: 1rem; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto; }
.history-item { display: flex; justify-content: space-between; align-items: center; padding: 15px; background: white; margin-bottom: 10px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #eee; }
.history-avatar { width: 40px; height: 40px; border-radius: 50%; background: #eee; margin-right: 10px; object-fit: cover; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #555; font-size: 1.2rem; }


/* Video & Matching */
.video-call-interface { display: flex; flex-direction: column; height: 80vh; gap: 1rem; padding: 1rem; position: relative; }
.video-container { position: relative; flex: 1; background: #1a1a1a; border-radius: 12px; overflow: hidden; min-height: 400px; display: flex; justify-content: center; align-items: center; }
.video-element { width: 100%; height: 100%; object-fit: cover; }
.video-element.local { position: absolute; bottom: 20px; right: 20px; width: 150px; height: 200px; border: 2px solid white; border-radius: 8px; z-index: 10; object-fit: cover; background: #333; }
.video-overlay { position: absolute; top: 1rem; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.6); padding: 8px 16px; border-radius: 20px; color: white; display: flex; align-items: center; gap: 0.5rem; z-index: 5; }
.status-overlay { position: absolute; bottom: 20px; left: 20px; background: rgba(0,0,0,0.7); color: #fff; padding: 8px 12px; border-radius: 8px; font-size: 0.9rem; z-index: 20; }
.call-controls { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; }
.control-btn { background: #f44336; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem; }

/* Rating Modal */
.rating-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 50;
  border-radius: 12px;
  color: white;
  text-align: center;
}
.rating-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}
.rating-btn {
  padding: 1rem 2rem;
  font-size: 1.2rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
}
.rating-btn.good { background: #10b981; color: white; }
.rating-btn.meh { background: #6b7280; color: white; }
.rating-btn:hover { transform: scale(1.05); }

/* Mobile Optimizations */
@media (max-width: 768px) {
  .app-header-content { flex-direction: column; gap: 1rem; }
  .user-info { flex-direction: column; }
  .auth-box { margin: 1rem; width: auto; }
  .profile-section { padding: 1.5rem; width: auto; margin: 1rem; }
  
  /* Mobile PiP Sizing - Bottom Right */
  .video-element.local { width: 50px !important; height: 75px !important; top: auto !important; bottom: 10px !important; right: 10px !important; }
}
`;

// --- Icon Components (Inline SVG) ---
const Icon = ({ children, className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    {children}
  </svg>
);
const PhoneOff = (props) => <Icon {...props}><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.12 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="23" y1="1" x2="1" y2="23"/></Icon>;
const Wallet = (props) => <Icon {...props}><path d="M20 12V8H6a2 2 0 0 1-2-2 2 2 0 0 1 2-2h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H4z"/></Icon>;
const Sparkles = (props) => <Icon {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 5H1"/><path d="M5 19v4"/><path d="M9 21H1"/></Icon>;
const ArrowLeft = (props) => <Icon {...props}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></Icon>;
const Save = (props) => <Icon {...props}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></Icon>;
const LogOut = (props) => <Icon {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Icon>;
const Clock = (props) => <Icon {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Icon>;
const Loader2 = (props) => <Icon {...props}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></Icon>;
const Phone = (props) => <Icon {...props}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.12 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></Icon>;
const Star = (props) => <Icon {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></Icon>;
const Upload = (props) => <Icon {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></Icon>;

// --- Main App Component ---
export default function App() {
  const [view, setView] = useState('auth');
  const [user, setUser] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('chatter3_user');
    if (saved) {
      const u = JSON.parse(saved);
      setUser(u);
      setView('dashboard');
      checkActiveSession(u.id);
    }
  }, []);

  const checkActiveSession = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/api/matching/session/${userId}`);
      const data = await res.json();
      if (data.active_session) {
        setCurrentSession(data.session);
        setView('video');
      } else if (user && view === 'video') {
        refreshUserData(userId);
      }
    } catch (e) { console.error(e); }
  };

  const refreshUserData = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/api/user/${userId}`);
      const data = await res.json();
      if (data.success) {
        const updatedUser = { ...user, ...data.user };
        localStorage.setItem('chatter3_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (e) { console.error("Failed to refresh user data", e); }
  };

  const handleLoginSuccess = (u) => {
    localStorage.setItem('chatter3_user', JSON.stringify(u));
    setUser(u);
    setView('dashboard');
  };

  const handleLogout = async () => {
    if (user) {
      try {
        await fetch(`${API_URL}/api/matching/leave`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id })
        });
      } catch (e) { console.error("Logout leave failed", e); }
    }
    localStorage.removeItem('chatter3_user');
    setUser(null);
    setView('auth');
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <div className="app-container">
      <style>{STYLES}</style>
      
      {view === 'auth' && <AuthView onLogin={handleLoginSuccess} />}
      
      {view !== 'auth' && (
        <header className="app-header">
          <div className="app-header-content">
            <div className="logo-container">
              <img src="https://i.postimg.cc/RhMnVSCY/Catter3logo-transparent-5.png" alt="Chatter3" className="header-logo-img" />              
            </div>
            {user && (
              <div className="user-info">
                <span>Welcome, {user.nickname || user.username}</span>
                <span style={{color: '#4285f4', fontWeight: 'bold'}}>{user.points} PTS</span>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </header>
      )}

      <main className="app-content">
        {view === 'dashboard' && user && (
          <DashboardView user={user} onNavigate={setView} />
        )}

        {view === 'matching' && user && (
          <MatchingView 
            user={user} 
            onCancel={() => setView('dashboard')}
            onMatch={(session) => {
              playSound('match');
              setCurrentSession(session);
              setView('video'); 
            }}
          />
        )}

        {view === 'video' && user && currentSession && (
          <VideoRoomView 
            user={user} 
            session={currentSession} 
            onEnd={() => {
              setCurrentSession(null);
              refreshUserData(user.id); 
              setView('dashboard');
            }} 
          />
        )}

        {view === 'profile' && user && (
          <ProfileView 
            user={user} 
            onBack={() => setView('dashboard')} 
            onUpdate={setUser}
            onLogout={handleLogout}
          />
        )}
      </main>
    </div>
    </GoogleOAuthProvider>
  );
}

// --- Views ---

function AuthView({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', username: '', english_level: 'beginner' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) onLogin(data.user);
      else setError(data.error || 'Authentication failed');
    } catch (err) { setError('Network error. Is the backend running?'); } 
    finally { setLoading(false); }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      if (!response.ok) throw new Error('Server Error');
      const data = await response.json();
      if (data.success) onLogin(data.user);
      else setError(data.error || 'Google Authentication failed');
    } catch (error) { setError('Network error during Google Login'); } 
    finally { setLoading(false); }
  };

  const handleGoogleError = () => {
    setError('Google Sign In was unsuccessful.');
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <img src="https://i.postimg.cc/RhMnVSCY/Catter3logo-transparent-5.png" alt="Chatter3" className="auth-logo" />
          <p className="auth-subtitle">Master English with native speakers</p>
        </div>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="register-form">
          {isRegistering && (
            <>
              <div className="form-group"><label>Username</label><input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required /></div>
              <div className="form-group"><label>English Level</label><select value={formData.english_level} onChange={e => setFormData({...formData, english_level: e.target.value})}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></div>
            </>
          )}
          <div className="form-group"><label>Email</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required /></div>
          <div className="form-group"><label>Password</label><input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required /></div>
          <button type="submit" disabled={loading}>{loading ? 'Loading...' : (isRegistering ? 'Create Account' : 'Sign In')}</button>
        </form>
        <div className="auth-divider">or</div>
        <div className="google-button-container">
           {}
           {<GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />}
           
           {}
           
        </div>
        <button className="auth-link" onClick={() => setIsRegistering(!isRegistering)}>{isRegistering ? 'Already have an account? Sign In' : 'New to Chatter3? Create Account'}</button>
      </div>
    </div>
  );
}

function DashboardView({ user, onNavigate }) {
  return (
    <div className="dashboard-container">
      <div className="welcome-message">
        <h2>Ready to start a conversation?</h2>
        <p>Your English practice journey begins here!</p>
        <button onClick={() => onNavigate('matching')} className="start-matching-btn">Find a Conversation Partner</button>
        <div className="user-stats">
          <h3>Your Stats</h3>
          <div className="stat-item"><span>Balance</span><span style={{fontWeight: 'bold', color: '#4285f4'}}>{user.points} PTS</span></div>
          <div className="stat-item"><span>Level</span><span style={{fontWeight: 'bold', textTransform: 'capitalize'}}>{user.english_level}</span></div>
          <div className="stat-item"><span>Call Duration</span><span>{user.english_level === 'beginner' ? '5 mins' : '10 mins'}</span></div>
          <button onClick={() => onNavigate('profile')} style={{marginTop:'1rem', padding:'10px', width:'100%', background:'#f5f5f5', border:'1px solid #ddd', borderRadius:'4px', cursor:'pointer'}}>Profile and Conversation History</button>
        </div>
      </div>
    </div>
  );
}

function MatchingView({ user, onCancel, onMatch }) {
  const [status, setStatus] = useState('Looking for a partner...');
  const [isMatched, setIsMatched] = useState(false);

  useEffect(() => {
    let polling;
    const performSearch = async () => {
      try {
        if (!isMatched) {
            const joinRes = await fetch(`${API_URL}/api/matching/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id, english_level: user.english_level })
            });
            const joinData = await joinRes.json();
            
            if (joinData.matched) {
                setIsMatched(true);
                setStatus('Partner found! Preparing session...');
            }
        }

        const sessRes = await fetch(`${API_URL}/api/matching/session/${user.id}`);
        const sessData = await sessRes.json();
        if (sessData.active_session) {
            clearInterval(polling);
            setStatus('Connecting...');
            onMatch(sessData.session);
        }

      } catch (e) { 
        console.error("Match error:", e);
        setStatus('Connection error. Retrying...'); 
      }
    };

    performSearch();
    polling = setInterval(performSearch, 3000);
    return () => clearInterval(polling);
  }, [isMatched]);

  const handleCancelSearch = async () => {
    try {
      await fetch(`${API_URL}/api/matching/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });
    } catch (e) {}
    onCancel();
  };

  return (
    <div className="matching-screen">
      <div className="loader"></div>
      <h2 style={{fontSize: '1.5rem', marginBottom: '1rem', color: '#333'}}>{status}</h2>
      <p style={{color: '#666'}}>Matching you with {user.english_level} speakers</p>
      <button onClick={handleCancelSearch} className="cancel-btn">Cancel Search</button>
    </div>
  );
}

// --- NEW WEBRTC VIDEO VIEW ---
function VideoRoomView({ user, session, onEnd }) {
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(session.english_level === 'beginner' ? 300 : 600);
  const [connectionStatus, setConnectionStatus] = useState('Initializing...');
  const [showRating, setShowRating] = useState(false);
  const [waitingForPartner, setWaitingForPartner] = useState(false);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const wsRef = useRef(null);
  const remoteStreamRef = useRef(null);
  
  const localCandidatesQueue = useRef([]); 
  const remoteCandidatesQueue = useRef([]); 
  const negotiatingRef = useRef(false);
  const streamRef = useRef(null);
  const hasConnectedRef = useRef(false); 

  const cleanupMedia = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => { track.stop(); });
      streamRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
  };

  useEffect(() => {
    const initConnection = async () => {
        try {
          const res = await fetch(`${API_URL}/api/ice-servers`);
          const iceData = await res.json();
          const iceServers = iceData.iceServers || [{ urls: 'stun:stun.l.google.com:19302' }];
          startCall(iceServers);
        } catch(e) {
          console.error("Failed to fetch ICE servers, using default", e);
          startCall([{ urls: 'stun:stun.l.google.com:19302' }]);
        }
    };

    const startCall = async (iceServers) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream; 
        
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        // Initialize persistent remote stream
        remoteStreamRef.current = new MediaStream();
        if (remoteVideoRef.current) {
             remoteVideoRef.current.srcObject = remoteStreamRef.current;
        }

        const pc = new RTCPeerConnection({ iceServers });
        
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        // Use standard track handling
        pc.ontrack = (event) => {
          console.log("Track received:", event.track.kind);
          // Standard: Use event.streams[0]
          // Prefer the browser's grouped stream (syncs audio/video automatically)
          const streamToAdd = event.streams && event.streams[0] ? event.streams[0] : remoteStreamRef.current;
          if (!event.streams || !event.streams[0]) {
             remoteStreamRef.current.addTrack(event.track);
          }
          
          if (remoteVideoRef.current) {
             remoteVideoRef.current.srcObject = streamToAdd;
             remoteVideoRef.current.play().catch(e => console.log('Autoplay blocked:', e));
          }
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
             const payload = JSON.stringify({ type: 'candidate', candidate: event.candidate });
             if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(payload);
             } else {
                localCandidatesQueue.current.push(payload);
             }
          }
        };

        pc.onconnectionstatechange = () => {
            console.log("Connection State:", pc.connectionState);
            setConnectionStatus(pc.connectionState);
            if (pc.connectionState === 'connected') {
                hasConnectedRef.current = true;
                playSound('start'); // Connected sound
            }
            if (pc.connectionState === 'failed') {
               setError("Connection failed. Try refreshing or check firewall.");
            }
        };
        pcRef.current = pc;

        const ws = new WebSocket(`${WS_URL}/api/signal?sessionId=${session.id}`);
        wsRef.current = ws;

        ws.onopen = async () => {
          console.log("WS Open.");
          setConnectionStatus('Signal Connected');
          while (localCandidatesQueue.current.length > 0) {
             ws.send(localCandidatesQueue.current.shift());
          }
          // Handshake trigger
          ws.send(JSON.stringify({ type: 'join' }));
        };

        ws.onmessage = async (msg) => {
          const data = JSON.parse(msg.data);
          
          if (data.type === 'bye') {
             // Partner ended call - SHOW RATING
             cleanupMedia();
             playSound('end'); // Play end sound
             setShowRating(true); 
          }
          else if (data.type === 'join') {
            ws.send(JSON.stringify({ type: 'join_ack' }));
            if (user.id === session.user1_id && !negotiatingRef.current) {
               console.log("Peer Joined. Initiating Offer...");
               startNegotiation();
            }
          }
          else if (data.type === 'join_ack') {
             if (user.id === session.user1_id && !negotiatingRef.current) {
                console.log("Peer Ack. Initiating Offer...");
                startNegotiation();
             }
          }
          else if (data.type === 'offer') {
            negotiatingRef.current = true;
            await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
            processRemoteCandidates();
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            ws.send(JSON.stringify({ type: 'answer', sdp: answer }));
          } 
          else if (data.type === 'answer') {
            await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
            processRemoteCandidates();
          } 
          else if (data.type === 'candidate') {
            const candidate = new RTCIceCandidate(data.candidate);
            if (pc.remoteDescription && pc.remoteDescription.type) {
               await pc.addIceCandidate(candidate);
            } else {
               remoteCandidatesQueue.current.push(candidate);
            }
          }
        };

        const startNegotiation = async () => {
           negotiatingRef.current = true;
           const offer = await pc.createOffer();
           await pc.setLocalDescription(offer);
           ws.send(JSON.stringify({ type: 'offer', sdp: offer }));
        };

      } catch (err) {
        console.error(err);
        setError('Could not access camera/microphone');
      }
    };

    const processRemoteCandidates = async () => {
        if (!pcRef.current) return;
        while (remoteCandidatesQueue.current.length > 0) {
            const cand = remoteCandidatesQueue.current.shift();
            try {
                await pcRef.current.addIceCandidate(cand);
            } catch (e) { console.error("Error adding queued candidate", e); }
        }
    };

    const handleBeforeUnload = (e) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
         wsRef.current.send(JSON.stringify({ type: 'bye' }));
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    const startObj = new Date(session.created_at.endsWith('Z') ? session.created_at : session.created_at + 'Z');
    const totalDuration = session.english_level === 'beginner' ? 300 : 600;
    
    const updateTimer = () => {
      const now = new Date();
      const elapsedSeconds = Math.floor((now.getTime() - startObj.getTime()) / 1000);
      const remaining = Math.max(0, totalDuration - elapsedSeconds);
      setTimeLeft(remaining);
      return remaining;
    };
    updateTimer();

    initConnection();

    const timer = setInterval(() => {
      const remaining = updateTimer();
      if (remaining <= 0) {
        // Time up - end call and show rating
        handleHangup();
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      window.removeEventListener('beforeunload', () => {});
      // Only clean up if not showing rating (persists logic for rating view if needed, but here we just cleanup)
      // Actually cleanup is safe as long as we don't need the stream for rating screen bg
    };
  }, []);

  const handleHangup = async () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
       wsRef.current.send(JSON.stringify({ type: 'bye' }));
    }
    
    // Explicitly end session on server so refresh doesn't bring us back
    try {
      await fetch(`${API_URL}/api/matching/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: session.id, user_id: user.id, reason: 'hangup' })
      });
    } catch (e) {}

    playSound('end');
    cleanupMedia();
    setShowRating(true);
  };

  const handleRate = async (rating) => {
    try {
      setWaitingForPartner(true);
      const res = await fetch(`${API_URL}/api/matching/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: session.id, user_id: user.id, rating })
      });
      const data = await res.json();
      
      // If we got points, it means both rated
      if (data.points_awarded) {
         playSound('points');
         alert(`You earned ${data.points_awarded} points!`);
      } else {
         // Partner hasn't rated yet
         alert("Rating submitted. Points will be awarded when your partner rates you.");
      }
    } catch (e) {}
    
    // Explicitly call /end to clean up if not already done by rate logic
    // but rate logic handles transaction.
    // Just exit
    onEnd();
  };

  const formatTime = (s) => {
    if (s === null) return '--:--';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (error) return (
    <div className="matching-screen">
      <p style={{color: 'red'}}>{error}</p>
      <button onClick={onEnd} className="cancel-btn">Go Back</button>
    </div>
  );

  return (
    <div className="video-call-interface">
      <div className="video-container">
        <video ref={remoteVideoRef} autoPlay playsInline className="video-element" />
        <video ref={localVideoRef} autoPlay playsInline muted className="video-element local" />
        <div className="video-overlay"><Clock className="w-4 h-4" color="white" /><span>{formatTime(timeLeft)}</span></div>
        <div className="status-overlay">{connectionStatus}</div>
      </div>
      
      {showRating && (
         <div className="rating-overlay">
           <h2>Rate your partner</h2>
           <p>How was your conversation with {session.partner.username}?</p>
           <div className="rating-buttons">
              <button className="rating-btn good" onClick={() => handleRate('good')}><Star className="w-6 h-6 inline"/> Good</button>
              <button className="rating-btn meh" onClick={() => handleRate('meh')}>Meh</button>
           </div>
         </div>
      )}

      {!showRating && (
        <div className="call-controls">
            <div style={{textAlign: 'left'}}><p style={{fontSize: '0.9rem', color: '#666'}}>Talking to</p><p style={{fontWeight: 'bold', fontSize: '1.1rem'}}>{session.partner.username}</p></div>
            <button onClick={handleHangup} className="control-btn"><PhoneOff className="w-5 h-5" /> End Call</button>
        </div>
      )}
    </div>
  );
}

function ProfileView({ user, onBack, onUpdate, onLogout }) {
  const [formData, setFormData] = useState({
    nickname: user.nickname || user.username || '',
    country: user.country || '',
    native_language: user.native_language || '',
    english_level: user.english_level || 'beginner',
    bio: user.bio || '',
    avatar_url: user.avatar_url || '' 
  });
  const [history, setHistory] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Fetch History
    fetch(`${API_URL}/api/user/history`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ user_id: user.id })
    })
    .then(res => res.json())
    .then(data => { if(data.success) setHistory(data.history); });
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10,485,760) { 
        alert("File is too large. Please select an image under 10MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    const res = await fetch(`${API_URL}/api/user/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, ...formData })
    });
    const data = await res.json();
    if(data.success) {
      onUpdate(data.user);
      alert("Profile Saved!");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="auth-header"><h2>Edit Profile</h2></div>
      
      <div className="profile-section">
         <div className="profile-avatar">
            {formData.avatar_url ? (
              <img 
                src={formData.avatar_url} 
                style={{width:'100%', height:'100%', borderRadius:'50%', objectFit: 'cover'}} 
                onError={(e) => e.target.style.display = 'none'} 
                alt="Profile"
              />
            ) : (
              (formData.nickname || user.username).charAt(0).toUpperCase()
            )}
         </div>

         <div className="form-group" style={{textAlign: 'center', marginBottom: '20px'}}>
             <input 
               type="file" 
               accept="image/*" 
               onChange={handleFileChange} 
               style={{display: 'none'}} 
               ref={fileInputRef}
             />
             <button type="button" className="upload-btn" onClick={() => fileInputRef.current.click()}>
               <Upload className="w-4 h-4 inline" style={{marginRight:'5px'}}/> Upload Picture
             </button>
         </div>

         <div className="form-group">
            <label>Nickname / Display Name</label>
            <input value={formData.nickname} onChange={e => setFormData({...formData, nickname: e.target.value})} />
         </div>
         <div className="form-group">
            <label>Country of Origin</label>
            <input value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} placeholder="e.g. Japan" />
         </div>
         <div className="form-group">
            <label>Native Language</label>
            <input value={formData.native_language} onChange={e => setFormData({...formData, native_language: e.target.value})} placeholder="e.g. Japanese" />
         </div>
         <div className="form-group">
            <label>English Level</label>
            <select value={formData.english_level} onChange={e => setFormData({...formData, english_level: e.target.value})}>
               <option value="beginner">Beginner</option>
               <option value="intermediate">Intermediate</option>
               <option value="advanced">Advanced</option>
            </select>
         </div>

         <button className="save-btn" onClick={handleSave}>Save Profile</button>
         <button className="cancel-btn" onClick={onBack} style={{marginTop:'10px'}}>Back</button>
      </div>

      <div className="history-list">
        <h3>Recent Conversations</h3>
        {history.length === 0 && <p>No calls yet.</p>}
        {history.map(h => (
          <div key={h.id} className="history-item">
             <div>
               <strong>{h.partner_name || 'Unknown'}</strong><br/>
               <span style={{fontSize:'0.8rem', color:'#666'}}>{new Date(h.created_at).toLocaleDateString()}</span>
             </div>
             <div>
                {h.duration ? Math.floor(h.duration / 60) + 'm' : 'Incomplete'}
             </div>
             <div className="history-avatar">
               {h.partner_avatar ? <img src={h.partner_avatar} style={{width:'100%', height:'100%', borderRadius:'50%'}}/> : (h.partner_name || '?').charAt(0).toUpperCase()}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}