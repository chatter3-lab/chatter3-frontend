import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

// --- Configuration ---
const API_URL = 'https://api.chatter3.com'; 
const GOOGLE_CLIENT_ID = "935611169333-7rdmfeic279un9jdl03vior15463aaba.apps.googleusercontent.com";

// --- STYLES (Paste this into App.css locally and uncomment import above) ---
const STYLES = `
/* Reset and base styles */
* { box-sizing: border-box; }
body, html { margin: 0; padding: 0; width: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; background-color: #f5f5f5; }
#root { width: 100%; margin: 0; padding: 0; }

/* Main Layout */
.app-container { display: flex; flex-direction: column; min-height: 100vh; width: 100%; }
.app-content { flex: 1; display: flex; flex-direction: column; width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 1rem; }

/* Header */
.app-header { background: white; padding: 1rem 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
.app-header-content { display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
.logo-container { display: flex; align-items: center; gap: 0.5rem; }
.auth-logo { height: 40px; width: auto; object-fit: contain; }
.logo-text { font-size: 1.5rem; font-weight: bold; color: #333; }
.user-info { display: flex; gap: 1rem; align-items: center; }
.user-info span { font-weight: 500; }
.user-info button { padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; transition: background 0.3s; }
.user-info button:hover { background: #d32f2f; }

/* Auth */
.auth-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1rem; }
.auth-box { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); text-align: center; width: 100%; max-width: 400px; }
.auth-header { display: flex; flex-direction: column; align-items: center; margin-bottom: 1.5rem; }
.auth-title { font-size: 1.5rem; font-weight: bold; color: #333; margin: 0.5rem 0; }
.auth-subtitle { color: #666; margin-bottom: 0.5rem; }
.auth-divider { margin: 1.5rem 0; color: #999; position: relative; }
.auth-divider::before { content: ''; position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: #eee; }
.google-button-container { display: flex; justify-content: center; margin: 1rem 0; width: 100%; }
.auth-link { color: #4285f4; background: none; border: none; cursor: pointer; text-decoration: none; margin-top: 1rem; display: block; width: 100%; }
.auth-link:hover { text-decoration: underline; }
.error-message { background: #ffebee; color: #c62828; padding: 10px; border-radius: 4px; margin-bottom: 1rem; border-left: 4px solid #c62828; }

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

/* Matching & Video */
.matching-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; text-align: center; }
.loader { border: 4px solid #f3f3f3; border-top: 4px solid #4285f4; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin-bottom: 2rem; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.cancel-btn { margin-top: 2rem; padding: 10px 20px; background: transparent; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; }

.video-call-interface { display: flex; flex-direction: column; height: 80vh; gap: 1rem; padding: 1rem; }
.video-container { position: relative; flex: 1; background: #1a1a1a; border-radius: 12px; overflow: hidden; min-height: 400px; }
.video-element { width: 100%; height: 100%; border: none; }
.video-overlay { position: absolute; top: 1rem; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.6); padding: 8px 16px; border-radius: 20px; color: white; display: flex; align-items: center; gap: 0.5rem; }
.call-controls { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; }
.control-btn { background: #f44336; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem; }

@media (max-width: 768px) {
  .app-header-content { flex-direction: column; gap: 1rem; }
  .user-info { flex-direction: column; }
  .auth-box { margin: 1rem; }
}
`;

// --- Icon Components (Inline SVGs) ---
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
      }
    } catch (e) { console.error(e); }
  };

  const handleLoginSuccess = (u) => {
    localStorage.setItem('chatter3_user', JSON.stringify(u));
    setUser(u);
    setView('dashboard');
  };

  const handleLogout = () => {
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
                <img src="https://i.postimg.cc/RhMnVSCY/Catter3logo-transparent-5.png" alt="Chatter3" className="auth-logo" />
                <span className="logo-text">Chatter3</span>
              </div>
              {user && (
                <div className="user-info">
                  <span>Welcome, {user.username}!</span>
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        onLogin(data.user);
      } else {
        setError(data.error || 'Google Authentication failed at Backend');
      }
    } catch (error) {
      console.error('Google auth error:', error);
      setError('Network error during Google Login. Is the API running?');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign In was unsuccessful.');
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <img src="https://i.postimg.cc/RhMnVSCY/Catter3logo-transparent-5.png" alt="Chatter3" className="auth-logo" />
          <h1 className="auth-title">Chatter3</h1>
          <p className="auth-subtitle">Master English with native speakers</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="register-form">
          {isRegistering && (
            <>
              <div className="form-group">
                <label>Username</label>
                <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>English Level</label>
                <select value={formData.english_level} onChange={e => setFormData({...formData, english_level: e.target.value})}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </>
          )}
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : (isRegistering ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="auth-divider">or</div>

        <div className="google-button-container">
           <GoogleLogin
             onSuccess={handleGoogleSuccess}
             onError={handleGoogleError}
             useOneTap
             theme="filled_blue"
             size="large"
             width="100%"
             text="continue_with"
           />
        </div>

        <button className="auth-link" onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? 'Already have an account? Sign In' : 'New to Chatter3? Create Account'}
        </button>
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
        
        <button onClick={() => onNavigate('matching')} className="start-matching-btn">
           Find a Conversation Partner
        </button>

        <div className="user-stats">
          <h3>Your Stats</h3>
          <div className="stat-item">
             <span>Balance</span>
             <span style={{fontWeight: 'bold', color: '#4285f4'}}>{user.points} PTS</span>
          </div>
          <div className="stat-item">
             <span>Level</span>
             <span style={{fontWeight: 'bold', textTransform: 'capitalize'}}>{user.english_level}</span>
          </div>
          <div className="stat-item">
             <span>Call Duration</span>
             <span>{user.english_level === 'beginner' ? '5 mins' : '10 mins'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MatchingView({ user, onCancel, onMatch }) {
  const [status, setStatus] = useState('Looking for a partner...');
  
  useEffect(() => {
    let polling;
    const startMatching = async () => {
      try {
        const joinRes = await fetch(`${API_URL}/api/matching/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, english_level: user.english_level })
        });
        const joinData = await joinRes.json();
        if (joinData.matched) {
          setStatus('Partner found! Preparing session...');
          checkSession();
        } else {
          polling = setInterval(checkSession, 3000);
        }
      } catch (e) { setStatus('Connection error. Retrying...'); }
    };

    const checkSession = async () => {
      try {
        const res = await fetch(`${API_URL}/api/matching/session/${user.id}`);
        const data = await res.json();
        if (data.active_session) {
          clearInterval(polling);
          setStatus('Connecting...');
          setTimeout(() => onMatch(data.session), 1000);
        }
      } catch (e) { console.error(e); }
    };
    startMatching();
    return () => clearInterval(polling);
  }, []);

  return (
    <div className="matching-screen">
      <div className="loader"></div>
      <h2 style={{fontSize: '1.5rem', marginBottom: '1rem', color: '#333'}}>{status}</h2>
      <p style={{color: '#666'}}>Matching you with {user.english_level} speakers</p>
      <button onClick={onCancel} className="cancel-btn">Cancel Search</button>
    </div>
  );
}

function VideoRoomView({ user, session, onEnd }) {
  const [roomUrl, setRoomUrl] = useState(null);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(session.english_level === 'beginner' ? 300 : 600);

  useEffect(() => {
    const setupRoom = async () => {
      try {
        const res = await fetch(`${API_URL}/api/daily/create-room`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: session.id, user_id: user.id })
        });
        const data = await res.json();
        if (data.success) setRoomUrl(data.room.url);
        else setError('Failed to create video room');
      } catch (e) { setError('Connection failed'); }
    };
    setupRoom();

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { handleEnd(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleEnd = async () => {
    try {
      await fetch(`${API_URL}/api/matching/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: session.id, user_id: user.id })
      });
    } catch (e) {}
    onEnd();
  };

  const formatTime = (s) => {
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
        {roomUrl ? (
          <iframe 
            src={roomUrl} 
            allow="camera; microphone; autoplay; fullscreen"
            className="video-element"
            title="Daily Call"
          />
        ) : (
          <div className="matching-screen" style={{minHeight: '100%'}}>
             <div className="loader"></div>
             <p style={{color: 'white'}}>Connecting to Daily.co...</p>
          </div>
        )}
        <div className="video-overlay">
          <Clock className="w-4 h-4" color="white" />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="call-controls">
        <div style={{textAlign: 'left'}}>
          <p style={{fontSize: '0.9rem', color: '#666'}}>Talking to</p>
          <p style={{fontWeight: 'bold', fontSize: '1.1rem'}}>{session.partner.username}</p>
        </div>
        <button onClick={handleEnd} className="control-btn">
          <PhoneOff className="w-5 h-5" /> End Call
        </button>
      </div>
    </div>
  );
}

function ProfileView({ user, onBack, onUpdate, onLogout }) {
  const [bio, setBio] = useState(user.bio || '');

  return (
    <div className="dashboard-container">
      <div className="auth-header">
         <h2 className="auth-title">My Profile</h2>
      </div>
      
      <div className="auth-box" style={{textAlign: 'left'}}>
        <div className="form-group">
           <label>Username</label>
           <input type="text" value={user.username} disabled style={{background: '#f5f5f5'}} />
        </div>
        <div className="form-group">
           <label>Email</label>
           <input type="text" value={user.email} disabled style={{background: '#f5f5f5'}} />
        </div>
        <div className="form-group">
           <label>Bio</label>
           <textarea 
             value={bio} 
             onChange={e => setBio(e.target.value)}
             style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
             rows={4}
           />
        </div>
        <button className="email-register-btn" style={{background: '#4285f4', color: 'white', border: 'none'}} onClick={() => { onUpdate({ ...user, bio }); onBack(); }}>
           <Save className="w-4 h-4" style={{display: 'inline', marginRight: '5px'}}/> Save Changes
        </button>
        <button className="back-button" onClick={onBack} style={{marginTop: '1rem'}}>
           <ArrowLeft className="w-4 h-4" style={{display: 'inline', marginRight: '5px'}}/> Back
        </button>
      </div>
    </div>
  );
}