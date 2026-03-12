import React, { useState, useEffect, useRef } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

// --- Configuration ---
const API_URL = 'https://api.chatter3.com'; 
const WS_URL = 'wss://api.chatter3.com';
const GOOGLE_CLIENT_ID = "935611169333-7rdmfeic279un9jdl03vior15463aaba.apps.googleusercontent.com";

// --- SOUND ASSETS ---
const SOUNDS = {
  match: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3', 
  start: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3', 
  end: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',   
  points: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3' 
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
* { box-sizing: border-box; }
body, html { margin: 0; padding: 0; width: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; background-color: #f5f5f5; }
#root { width: 100%; margin: 0; padding: 0; }
.app-container { display: flex; flex-direction: column; min-height: 100vh; width: 100%; }
.app-content { flex: 1; display: flex; flex-direction: column; width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
.app-header { background: white; padding: 1rem 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
.app-header-content { display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
.logo-container { display: flex; align-items: center; gap: 0.5rem; }
.header-logo-img { height: 100px; width: auto; object-fit: contain; }
.auth-logo { width: 100%; max-width: 400px; height: auto; object-fit: contain; margin-bottom: 1rem; }
.user-info { display: flex; gap: 1rem; align-items: center; }
.user-info button { padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; }
.auth-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1rem; }
.auth-box { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); text-align: center; width: 100%; max-width: 500px; }
.error-message { background: #ffebee; color: #c62828; padding: 10px; border-radius: 4px; margin-bottom: 1rem; border-left: 4px solid #c62828; text-align: left; }
.form-group { margin-bottom: 1rem; text-align: left; }
.form-group input, .form-group select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; }
.register-form button { width: 100%; padding: 12px; background: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer; }
`;

export default function App() {
  const [view, setView] = useState('auth');
  const [user, setUser] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('chatter3_user');
    if (saved) {
      setUser(JSON.parse(saved));
      setView('dashboard');
    }
  }, []);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="app-container">
        <style>{STYLES}</style>
        {view === 'auth' ? (
          <AuthView onLogin={(u) => { setUser(u); setView('dashboard'); }} />
        ) : (
          <>
            <header className="app-header">
              <div className="app-header-content">
                <img src="https://i.postimg.cc/50qdw8dy/Catter3logo-new-transparent.png" alt="Logo" className="header-logo-img" />
                {user && (
                  <div className="user-info">
                    <span>{user.nickname || user.username}</span>
                    <button onClick={() => { localStorage.removeItem('chatter3_user'); window.location.reload(); }}>Logout</button>
                  </div>
                )}
              </div>
            </header>
            <main className="app-content">
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <h1>Welcome, {user?.username}</h1>
                    <p>Dashboard active.</p>
                </div>
            </main>
          </>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

function AuthView({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      
      if (!response.ok) {
        throw new Error(data.error || `Server responded with ${response.status}`);
      }
      
      if (data.success) {
        onLogin(data.user);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError(`Network/Server error: ${err.message}. Check API_URL connectivity.`);
      console.error("Auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <img src="https://i.postimg.cc/50qdw8dy/Catter3logo-new-transparent.png" alt="Logo" className="auth-logo" />
        {error && <div className="error-message">{error}</div>}
        {loading ? <p>Signing in...</p> : (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google Sign-in failed')} />
            </div>
        )}
      </div>
    </div>
  );
}