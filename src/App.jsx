import React, { useState, useEffect } from 'react';
import { 
  Video, Mic, MicOff, VideoOff, PhoneOff, Settings, 
  User, Wallet, Phone, ArrowLeft, Save, LogOut, Loader2, Sparkles, Clock, Mail
} from 'lucide-react';

// --- Configuration ---
// Point this to your Cloudflare Worker URL
const API_URL = 'https://api.chatter3.com'; 

// --- Main App Component ---
export default function App() {
  const [view, setView] = useState('auth');
  const [user, setUser] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);

  // Restore session
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
    <div className="font-sans antialiased text-slate-900 bg-slate-50 min-h-screen">
      {view === 'auth' && <AuthView onLogin={handleLoginSuccess} />}
      
      {view === 'dashboard' && user && (
        <DashboardView 
          user={user} 
          onNavigate={setView} 
        />
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
            // Refresh user points
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
    </div>
  );
}

// --- 1. Polished Auth View ---
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
      
      if (data.success) {
        onLogin(data.user);
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  // Mock Google Login Handler for MVP
  const handleGoogleMock = () => {
    // In a real implementation, you would redirect to your OAuth endpoint
    console.log("Simulating Google Login");
    onLogin({ 
      id: 'google-user-' + Math.random().toString(36).substr(2, 9), 
      username: 'Google User', 
      email: 'google@test.com', 
      points: 100, 
      english_level: 'beginner' 
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-600 to-purple-700">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8 pb-6 text-center">
          <div className="mx-auto bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transform rotate-3">
            <Video className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Chatter3</h1>
          <p className="text-gray-500 mt-2">Master English with native speakers</p>
        </div>

        <div className="px-8 pb-8 space-y-6">
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <>
                <input 
                  type="text" placeholder="Username" required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                />
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  value={formData.english_level}
                  onChange={e => setFormData({...formData, english_level: e.target.value})}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </>
            )}
            <input 
              type="email" placeholder="Email address" required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
            <input 
              type="password" placeholder="Password" required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
            
            <button 
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition flex justify-center items-center"
            >
              {loading ? <Loader2 className="animate-spin" /> : (isRegistering ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with</span></div>
          </div>

          <div className="flex justify-center">
             <button
               onClick={handleGoogleMock}
               className="flex items-center justify-center gap-2 w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-xl transition shadow-sm"
             >
                {/* Simple Google G Icon Mock */}
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.52 12.29C23.52 11.43 23.44 10.61 23.3 9.81H12V14.45H18.45C18.17 15.93 17.32 17.18 16.05 18.03V21H19.92C22.18 18.91 23.52 15.86 23.52 12.29Z" fill="#4285F4"/>
                  <path d="M12 24C15.24 24 17.96 22.92 19.92 21.11L16.05 18.03C14.98 18.75 13.61 19.18 12 19.18C8.87 19.18 6.22 17.06 5.27 14.16H1.27V17.26C3.25 21.19 7.32 24 12 24Z" fill="#34A853"/>
                  <path d="M5.27 14.16C5.03 13.26 4.9 12.31 4.9 11.33C4.9 10.35 5.03 9.4 5.27 8.5V5.4H1.27C0.46 7.02 0 8.83 0 10.74C0 12.65 0.46 14.46 1.27 16.08L5.27 14.16Z" fill="#FBBC05"/>
                  <path d="M12 3.49C13.76 3.49 15.34 4.1 16.58 5.29L19.97 1.9C17.96 0.03 15.24 0 12 0C7.32 0 3.25 2.81 1.27 6.74L5.27 9.84C6.22 6.94 8.87 3.49 12 3.49Z" fill="#EA4335"/>
                </svg>
                <span>Continue with Google</span>
             </button>
          </div>

          <p className="text-center text-sm text-gray-600">
            {isRegistering ? 'Already have an account?' : 'New to Chatter3?'}
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              className="ml-1 text-indigo-600 font-semibold hover:underline"
            >
              {isRegistering ? 'Sign In' : 'Create Account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// --- 2. Dashboard View ---
function DashboardView({ user, onNavigate }) {
  return (
    <div className="min-h-screen pb-20">
      <header className="bg-white px-6 py-5 shadow-sm flex justify-between items-center sticky top-0 z-10">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Chatter3</h2>
        <button onClick={() => onNavigate('profile')} className="relative">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
        </button>
      </header>

      <main className="p-6 space-y-6">
        {/* Wallet */}
        <div className="bg-gray-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 opacity-80">
              <Wallet className="w-5 h-5" />
              <span className="text-sm font-medium">Balance</span>
            </div>
            <div className="text-4xl font-bold mb-6">{user.points} <span className="text-lg font-normal text-gray-400">PTS</span></div>
            <div className="flex gap-3">
              <button className="flex-1 bg-indigo-500 hover:bg-indigo-600 py-3 rounded-xl font-semibold transition">Top Up</button>
              <button className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-xl font-semibold transition backdrop-blur-md">Withdraw</button>
            </div>
          </div>
        </div>

        {/* Level Badge */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide">Current Level</p>
            <p className="text-lg font-bold text-indigo-900 capitalize">{user.english_level}</p>
          </div>
          <Sparkles className="text-indigo-400 w-8 h-8" />
        </div>

        {/* Main Action */}
        <button 
          onClick={() => onNavigate('matching')}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-1 rounded-3xl shadow-xl shadow-indigo-200 transform transition active:scale-95"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-[20px] p-6 flex items-center justify-between">
            <div className="text-left">
              <h3 className="text-xl font-bold">Find a Partner</h3>
              <p className="text-indigo-100 text-sm">Practice speaking now</p>
            </div>
            <div className="bg-white text-indigo-600 w-12 h-12 rounded-full flex items-center justify-center">
              <Phone className="w-6 h-6 fill-current" />
            </div>
          </div>
        </button>
      </main>
    </div>
  );
}

// --- 3. Matching View (Queue Logic) ---
function MatchingView({ user, onCancel, onMatch }) {
  const [status, setStatus] = useState('Looking for a partner...');
  
  useEffect(() => {
    let polling;

    const startMatching = async () => {
      try {
        // 1. Join Queue
        const joinRes = await fetch(`${API_URL}/api/matching/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, english_level: user.english_level })
        });
        const joinData = await joinRes.json();

        if (joinData.matched) {
          setStatus('Partner found! Preparing session...');
          // Immediate match
          checkSession();
        } else {
          // 2. Poll for match
          polling = setInterval(checkSession, 3000);
        }
      } catch (e) {
        setStatus('Connection error. Retrying...');
      }
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

    return () => {
      clearInterval(polling);
      // Optional: call /leave endpoint here
    };
  }, []);

  return (
    <div className="h-screen bg-indigo-600 flex flex-col items-center justify-center text-white p-6 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500 rounded-full animate-ping opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-400 rounded-full animate-pulse opacity-30"></div>
      </div>

      <div className="relative z-10 text-center space-y-8">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-xl">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold mb-2">{status}</h2>
          <p className="text-indigo-200">Matching you with {user.english_level} speakers</p>
        </div>

        <button 
          onClick={onCancel}
          className="px-8 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full font-semibold transition border border-white/10"
        >
          Cancel Search
        </button>
      </div>
    </div>
  );
}

// --- 4. Video Room View (Daily.co Integration) ---
function VideoRoomView({ user, session, onEnd }) {
  const [roomUrl, setRoomUrl] = useState(null);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(session.english_level === 'beginner' ? 300 : 600);

  useEffect(() => {
    // 1. Get/Create Daily Room
    const setupRoom = async () => {
      try {
        const res = await fetch(`${API_URL}/api/daily/create-room`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: session.id, user_id: user.id })
        });
        const data = await res.json();
        if (data.success) {
          setRoomUrl(data.room.url);
        } else {
          setError('Failed to create video room');
        }
      } catch (e) { setError('Connection failed'); }
    };
    setupRoom();

    // 2. Timer
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          handleEnd();
          return 0;
        }
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
    <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={onEnd} className="px-6 py-2 bg-white text-black rounded-lg">Go Back</button>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-black">
      {/* Video Area (Iframe) */}
      <div className="flex-1 relative">
        {roomUrl ? (
          <iframe 
            src={roomUrl} 
            allow="camera; microphone; autoplay; fullscreen"
            className="w-full h-full border-0"
            title="Daily Call"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            <Loader2 className="w-8 h-8 animate-spin mr-2" /> Connecting to Daily.co...
          </div>
        )}
        
        {/* Timer Overlay */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur text-white px-4 py-1 rounded-full font-mono font-bold flex items-center gap-2 border border-white/10">
          <Clock className="w-4 h-4 text-red-400" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-gray-900 p-4 pb-8 flex items-center justify-between px-8">
        <div className="text-white">
          <p className="text-xs text-gray-400">Talking to</p>
          <p className="font-bold">{session.partner.username}</p>
        </div>
        <button 
          onClick={handleEnd}
          className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition shadow-lg shadow-red-900/50"
        >
          <PhoneOff className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
}

// --- 5. Profile View ---
function ProfileView({ user, onBack, onUpdate, onLogout }) {
  const [bio, setBio] = useState(user.bio || '');

  return (
    <div className="min-h-screen bg-white">
      <div className="p-4 flex items-center border-b border-gray-100">
        <button onClick={onBack} className="p-2 hover:bg-gray-50 rounded-full mr-2"><ArrowLeft className="w-6 h-6" /></button>
        <h2 className="font-bold text-lg">My Profile</h2>
      </div>

      <div className="p-6">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-3xl font-bold text-indigo-700 mb-3">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <h3 className="text-xl font-bold">{user.username}</h3>
          <p className="text-gray-500">{user.email}</p>
        </div>

        <div className="space-y-4">
          <div>
             <label className="text-sm font-medium text-gray-700">Bio</label>
             <textarea 
               value={bio} onChange={e => setBio(e.target.value)}
               className="w-full mt-1 p-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" 
               rows={3} 
             />
          </div>
          <button 
            onClick={() => {
              // Call API to update bio
              onUpdate({ ...user, bio });
              onBack();
            }}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
          
          <button onClick={onLogout} className="w-full py-3 text-red-600 font-medium flex items-center justify-center gap-2 mt-4">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}