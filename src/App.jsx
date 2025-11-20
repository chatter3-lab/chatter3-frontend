import { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import './App.css';

const API_URL = 'https://api.chatter3.com';

// Login Form Component for existing users
function LoginForm({ onLogin, onSwitchToRegister }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="form-group">
        <label>Email:</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          placeholder="Enter your email"
          required
        />
      </div>
      
      <div className="form-group">
        <label>Password:</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          placeholder="Enter your password"
          required
        />
      </div>
      
      <button type="submit">Login with Email</button>
      <button type="button" onClick={onSwitchToRegister} className="switch-auth-btn">
        Don't have an account? Sign up
      </button>
    </form>
  );
}

// Email Registration Form Component
function EmailRegisterForm({ onSubmit, onBack, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    english_level: 'beginner'
  });

  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    setPasswordError('');
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="register-form">
      <h3>Create Account</h3>
      
      <div className="form-group">
        <label>Email:</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
      </div>
      
      <div className="form-group">
        <label>Username:</label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          required
        />
      </div>
      
      <div className="form-group">
        <label>Password:</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />
      </div>
      
      <div className="form-group">
        <label>Confirm Password:</label>
        <input
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
          required
        />
        {passwordError && <div className="password-error">{passwordError}</div>}
      </div>
      
      <div className="form-group">
        <label>English Level:</label>
        <select
          value={formData.english_level}
          onChange={(e) => setFormData({...formData, english_level: e.target.value})}
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
      
      <button type="submit">Register</button>
      <button type="button" onClick={onBack} className="back-button">
        Back to Google Sign In
      </button>
      <button type="button" onClick={onSwitchToLogin} className="switch-auth-btn">
        Already have an account? Login
      </button>
    </form>
  );
}

// Matching Screen Component
function MatchingScreen({ user, onMatchFound, onCancel }) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState('');

  const startMatching = async () => {
    setIsSearching(true);
    setSearchStatus('Finding a conversation partner...');
    
    try {
      const response = await fetch(`${API_URL}/api/matching/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          english_level: user.english_level
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (data.matched) {
          setSearchStatus('Partner found! Connecting...');
          // Wait a moment to show the success message
          setTimeout(() => {
            onMatchFound(data);
          }, 2000);
        } else {
          setSearchStatus('Searching for a partner...');
          // Continue polling for a match
          pollForMatch(user.id);
        }
      } else {
        setSearchStatus('Failed to start matching. Please try again.');
        setIsSearching(false);
      }
    } catch (error) {
      console.error('Matching error:', error);
      setSearchStatus('Connection error. Please try again.');
      setIsSearching(false);
    }
  };

  const pollForMatch = async (userId) => {
    const checkMatch = async () => {
      try {
        const response = await fetch(`${API_URL}/api/matching/session/${userId}`);
        const data = await response.json();
        
        if (data.active_session) {
          setSearchStatus('Partner found! Connecting...');
          setTimeout(() => {
            onMatchFound({
              session_id: data.session.id,
              partner: data.session.partner,
              room_name: data.session.room_name
            });
          }, 2000);
        } else {
          // Continue polling every 3 seconds
          setTimeout(() => checkMatch(), 3000);
        }
      } catch (error) {
        console.error('Polling error:', error);
        setTimeout(() => checkMatch(), 3000);
      }
    };
    
    checkMatch();
  };

  const cancelMatching = async () => {
    setIsSearching(false);
    setSearchStatus('');
    
    try {
      await fetch(`${API_URL}/api/matching/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id
        }),
      });
    } catch (error) {
      console.error('Leave matching error:', error);
    }
    
    onCancel();
  };

  return (
    <div className="matching-screen">
      <div className="matching-container">
        <h2>Find a Conversation Partner</h2>
        <p>Practice English with native speakers through video calls</p>
        
        {!isSearching ? (
          <div className="matching-start">
            <div className="user-level-info">
              <p>Your English Level: <strong>{user.english_level}</strong></p>
              <p>Call Duration: <strong>
                {user.english_level === 'beginner' ? '5 minutes' : 
                 user.english_level === 'intermediate' ? '10 minutes' : '10 minutes'}
              </strong></p>
            </div>
            <button onClick={startMatching} className="start-matching-btn">
              Start Matching
            </button>
          </div>
        ) : (
          <div className="matching-search">
            <div className="loading-animation">
              <div className="pulse-dot"></div>
              <div className="pulse-ring"></div>
            </div>
            <p className="search-status">{searchStatus}</p>
            <button onClick={cancelMatching} className="cancel-matching-btn">
              Cancel Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Video Call Ready Screen with Daily.co
function VideoCallReady({ session, user, onEndCall }) {
  const [timeLeft, setTimeLeft] = useState(
    user.english_level === 'beginner' ? 300 : 600
  );
  const [callFrame, setCallFrame] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [roomUrl, setRoomUrl] = useState(null);

  useEffect(() => {
    createDailyRoom();
    startTimer();

    return () => {
      if (callFrame) {
        callFrame.destroy();
      }
    };
  }, []);

  const createDailyRoom = async () => {
    try {
      setIsJoining(true);
      
      const response = await fetch(`${API_URL}/api/daily/create-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: session.session_id,
          user_id: user.id
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setRoomUrl(data.room.url);
        initializeDailyCall(data.room.url, data.room.token);
      } else {
        console.error('Failed to create room:', data.error);
        setIsJoining(false);
      }
    } catch (error) {
      console.error('Room creation error:', error);
      setIsJoining(false);
    }
  };

  const initializeDailyCall = (url, token) => {
    // Load Daily.co iframe
    const iframe = document.createElement('iframe');
    iframe.allow = 'microphone; camera; display-capture';
    iframe.style.width = '100%';
    iframe.style.height = '500px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '12px';
    
    const container = document.getElementById('daily-call-container');
    if (container) {
      container.innerHTML = '';
      container.appendChild(iframe);
    }

    // For MVP, we'll use the direct URL approach
    // In production, you'd use Daily.co's React components
    window.open(url, '_blank');
    
    setIsJoining(false);
  };

  const startTimer = () => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleEndCall();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleEndCall = async () => {
    if (callFrame) {
      callFrame.leave();
    }
    
    try {
      await fetch(`${API_URL}/api/matching/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: session.session_id,
          user_id: user.id
        }),
      });
    } catch (error) {
      console.error('End call error:', error);
    }
    
    onEndCall();
  };

  const joinVideoCall = () => {
    if (roomUrl) {
      window.open(roomUrl, '_blank', 'width=800,height=600');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="video-call-ready">
      <div className="call-container">
        <h2>🎥 Video Call with {session.partner.username}</h2>
        
        <div className="partner-info">
          <div className="partner-avatar">
            {session.partner.username.charAt(0).toUpperCase()}
          </div>
          <h3>{session.partner.username}</h3>
          <p>English Level: <strong>{session.partner.english_level}</strong></p>
        </div>

        <div className="daily-call-interface">
          <div className="timer-section">
            <div className="timer">
              <span className="time-left">{formatTime(timeLeft)}</span>
              <p>Time Remaining</p>
            </div>
          </div>

          {isJoining ? (
            <div className="joining-call">
              <div className="loading-spinner"></div>
              <p>Setting up video call...</p>
            </div>
          ) : (
            <div className="call-ready">
              <div className="call-instructions">
                <h3>🎯 Ready for Your Video Call!</h3>
                <p>Click the button below to start your video conversation with <strong>{session.partner.username}</strong></p>
                
                <div className="feature-list">
                  <div className="feature-item">
                    <span>✅</span> High-quality video & audio
                  </div>
                  <div className="feature-item">
                    <span>✅</span> Built-in chat (optional)
                  </div>
                </div>
              </div>

              <div className="call-actions">
                <button onClick={joinVideoCall} className="join-call-btn">
                  🎥 Join Video Call
                </button>
                <p className="call-note">
                  The call will open in a new window. Both you and {session.partner.username} need to join.
                </p>
              </div>

              <div id="daily-call-container" className="daily-container">
                {/* Daily.co iframe will be inserted here */}
              </div>
            </div>
          )}

          <div className="call-controls">
            <button onClick={handleEndCall} className="end-call-btn">
              📞 End Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [authError, setAuthError] = useState('');
  const [currentSession, setCurrentSession] = useState(null);
  const [appView, setAppView] = useState('main'); // 'main', 'matching', 'video'

  // Check if user is already logged in and has active session
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      // Check for active session
      checkActiveSession(userData.id);
    }
  }, []);

  const checkActiveSession = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/api/matching/session/${userId}`);
      const data = await response.json();
      
      if (data.active_session) {
        setCurrentSession(data.session);
        setAppView('video');
      }
    } catch (error) {
      console.error('Check session error:', error);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: credentialResponse.credential
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setAuthError('');
      } else {
        setAuthError(data.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Google auth error:', error);
      setAuthError('Authentication failed');
    }
  };

  const handleGoogleError = () => {
    setAuthError('Google login failed');
  };

  const handleEmailLogin = async (formData) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setAuthError('');
      } else {
        setAuthError(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthError('Login failed - please try again');
    }
  };

  const handleEmailRegister = async (formData) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          english_level: formData.english_level
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setAuthError('');
      } else {
        setAuthError(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setAuthError('Registration failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setAppView('main');
    setCurrentSession(null);
  };

  const handleStartMatching = () => {
    setAppView('matching');
  };

  const handleMatchFound = (sessionData) => {
    setCurrentSession(sessionData);
    setAppView('video');
  };

  const handleCancelMatching = () => {
    setAppView('main');
  };

  const handleEndCall = () => {
    setCurrentSession(null);
    setAppView('main');
  };

  if (!user) {
    return (
      <GoogleOAuthProvider clientId="935611169333-7rdmfeic279un9jdl03vior15463aaba.apps.googleusercontent.com">
        <div className="auth-container">
          <div className="auth-box">
            <div className="logo-container">
              <img 
                src="https://i.postimg.cc/RhMnVSCY/Catter3logo-transparent-5.png" 
                alt="Chatter3 Logo" 
                className="app-logo"
              />
            </div>
            <h1>Welcome to Chatter3</h1>
            <p>Practice English with native speakers</p>
            
            {authError && <div className="error-message">{authError}</div>}
            
            {!showRegister ? (
              <>
                <div className="google-button-container">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap
                    theme="filled_blue"
                    size="large"
                    text="continue_with"
                  />
                </div>
                <div className="auth-divider">or</div>
                
                <LoginForm 
                  onLogin={handleEmailLogin}
                  onSwitchToRegister={() => setShowRegister(true)}
                />
              </>
            ) : (
              <EmailRegisterForm 
                onSubmit={handleEmailRegister}
                onBack={() => {
                  setShowRegister(false);
                  setAuthError('');
                }}
                onSwitchToLogin={() => setShowRegister(false)}
              />
            )}
          </div>
        </div>
      </GoogleOAuthProvider>
    );
  }

  // Render different app views based on state
  const renderAppView = () => {
    switch (appView) {
      case 'matching':
        return (
          <MatchingScreen 
            user={user}
            onMatchFound={handleMatchFound}
            onCancel={handleCancelMatching}
          />
        );
      
      case 'video':
        return (
          <VideoCallReady 
            session={currentSession}
            user={user}
            onEndCall={handleEndCall}
          />
        );
      
      default:
        return (
          <div className="welcome-message">
            <h2>Ready to start a conversation?</h2>
            <p>Your English practice journey begins here!</p>
            <button onClick={handleStartMatching} className="start-matching-btn">
              Find a Conversation Partner
            </button>
            
            <div className="user-stats">
              <div className="stat-card">
                <h3>Your Stats</h3>
                <p>Points: <strong>{user.points}</strong></p>
                <p>Level: <strong>{user.english_level}</strong></p>
                <p>Call Duration: <strong>
                  {user.english_level === 'beginner' ? '5 minutes' : 
                   user.english_level === 'intermediate' ? '10 minutes' : '10 minutes'}
                </strong></p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-header-content">
          <div className="header-logo">
            <img 
              src="https://i.postimg.cc/RhMnVSCY/Catter3logo-transparent-5.png" 
              alt="Chatter3 Logo" 
              className="header-logo-img"
            />
            <h1>Chatter3</h1>
          </div>
          <div className="user-info">
            <span>Welcome, {user.username}!</span>
            <span>Points: {user.points}</span>
            <span>Level: {user.english_level}</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>
      
      <main className="app-content">
        {renderAppView()}
      </main>
    </div>
  );
}

export default App;