import React, { createContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useParams } from 'react-router-dom';
import './App.css';
import API_BASE_URL from './config';

const AuthContext = createContext();

function AppContent() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      <Router>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/projects" element={token ? <Projects /> : <Navigate to="/signup" />} />
          <Route path="/chat/:projectId" element={token ? <Chat /> : <Navigate to="/signup" />} />
          <Route path="/" element={token ? <Navigate to="/projects" /> : <Navigate to="/signup" />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (res.ok && data.token) {
        alert('Account created successfully! Redirecting to login...');
        window.location.href = '/login';
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      setError('Signup error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Create Account</h2>
      {error && (
        <div style={{ 
          padding: '12px', 
          margin: '10px 0', 
          background: '#f8d7da', 
          color: '#721c24', 
          borderRadius: '5px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email" 
            required 
            style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '5px', 
              border: '1px solid #ccc',
              fontSize: '14px',
              boxSizing: 'border-box'
            }} 
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 characters" 
            required 
            style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '5px', 
              border: '1px solid #ccc',
              fontSize: '14px',
              boxSizing: 'border-box'
            }} 
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Confirm Password</label>
          <input 
            type="password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password" 
            required 
            style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '5px', 
              border: '1px solid #ccc',
              fontSize: '14px',
              boxSizing: 'border-box'
            }} 
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '12px', 
            background: loading ? '#ccc' : '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: '#007bff', textDecoration: 'none', fontWeight: '500' }}>
          Login here
        </Link>
      </p>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState('test@123.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = React.useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.token) {
        login(data.token);
        window.location.href = '/projects';
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Login error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Login to Chatbot Platform</h2>
      {error && (
        <div style={{ 
          padding: '12px', 
          margin: '10px 0', 
          background: '#f8d7da', 
          color: '#721c24', 
          borderRadius: '5px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email" 
            required 
            style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '5px', 
              border: '1px solid #ccc',
              fontSize: '14px',
              boxSizing: 'border-box'
            }} 
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password" 
            required 
            style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '5px', 
              border: '1px solid #ccc',
              fontSize: '14px',
              boxSizing: 'border-box'
            }} 
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '12px', 
            background: loading ? '#ccc' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
        <p style={{ marginBottom: '10px', color: '#666', fontSize: '14px' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#28a745', textDecoration: 'none', fontWeight: '500' }}>
            Sign up here
          </Link>
        </p>
        <details style={{ fontSize: '12px', color: '#999' }}>
          <summary style={{ cursor: 'pointer' }}>Test Credentials</summary>
          <p style={{ marginTop: '8px' }}>
            Email: test@123.com<br />
            Password: password123
          </p>
        </details>
      </div>
    </div>
  );
}

function Projects() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const { token, logout } = React.useContext(AuthContext);

  const handleLogout = () => {
    logout();
    window.location.href = '/signup';
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/projects`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setProjects)
      .catch(err => console.error('Projects error:', err));
  }, [token]);

  const createProject = async () => {
    if (!name.trim()) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: name.trim() })
      });
      const project = await res.json();
      setProjects([...projects, project]);
      setName('');
    } catch (err) {
      alert('Failed to create project');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>🚀 Your Projects</h1>
        <button 
          onClick={handleLogout}
          style={{ 
            padding: '10px 20px', 
            background: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Sign Out
        </button>
      </div>
      <div style={{ marginBottom: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
        <input 
          value={name} 
          onChange={e => setName(e.target.value)} 
          placeholder="Enter project name..." 
          style={{ 
            padding: '12px', 
            marginRight: '10px', 
            borderRadius: '5px', 
            border: '1px solid #ccc',
            width: '300px'
          }} 
        />
        <button 
          onClick={createProject} 
          disabled={!name.trim()}
          style={{ 
            padding: '12px 24px', 
            background: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            fontSize: '16px'
          }}
        >
          Create Project
        </button>
      </div>
      
      <div>
        {projects.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', fontSize: '18px' }}>
            No projects yet. Create your first project above! 🎉
          </p>
        ) : (
          projects.map(project => (
            <div key={project.id} style={{ 
              border: '2px solid #007bff', 
              padding: '20px', 
              margin: '15px 0', 
              borderRadius: '10px',
              background: 'white',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <Link 
                to={`/chat/${project.id}`} 
                style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: '#007bff',
                  textDecoration: 'none'
                }}
              >
                📱 {project.name}
              </Link>
              <p style={{ color: '#666', marginTop: '5px' }}>
                Prompts: {project.prompts?.length || 0}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { token, logout } = React.useContext(AuthContext);
  const { projectId } = useParams();

  const handleLogout = () => {
    logout();
    window.location.href = '/signup';
  };

  useEffect(() => {
    if (projectId && token) {
      fetch(`${API_BASE_URL}/api/chat/${projectId}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(setMessages);
    }
  }, [projectId, token]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/${projectId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: ' + err.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px', background: '#007bff', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/projects" style={{ color: 'white', textDecoration: 'none', fontSize: '18px' }}>
          ← Back to Projects
        </Link>
        <button 
          onClick={handleLogout}
          style={{ 
            padding: '8px 16px', 
            background: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Sign Out
        </button>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#f8f9fa' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ 
            marginBottom: '20px',
            textAlign: msg.role === 'user' ? 'right' : 'left'
          }}>
            <div style={{
              display: 'inline-block',
              padding: '12px 18px',
              background: msg.role === 'user' ? '#007bff' : '#ffffff',
              color: msg.role === 'user' ? 'white' : '#333',
              borderRadius: '20px',
              maxWidth: '70%',
              boxShadow: '0 1px 5px rgba(0,0,0,0.1)',
              wordWrap: 'break-word'
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ textAlign: 'center', color: '#666' }}>
            <div>🤖 AI is typing...</div>
          </div>
        )}
      </div>
      
      <div style={{ padding: '20px', borderTop: '1px solid #dee2e6' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..." 
            disabled={loading}
            style={{ 
              flex: 1, 
              padding: '15px', 
              borderRadius: '25px', 
              border: '1px solid #ccc',
              fontSize: '16px'
            }} 
          />
          <button 
            onClick={sendMessage} 
            disabled={!input.trim() || loading}
            style={{
              padding: '15px 30px', 
              borderRadius: '25px', 
              background: '#007bff', 
              color: 'white', 
              border: 'none',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '⏳' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
