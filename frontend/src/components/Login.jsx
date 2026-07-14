import React, { useState } from 'react';
import { useMootCourt } from '../context/MootCourtContext';
import { Scale, Lock, User, CheckCircle, AlertTriangle, ArrowRight, MapPin } from 'lucide-react';

const Login = () => {
  const { loginUser, setUserRole } = useMootCourt();
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [course, setCourse] = useState('LLB Student');
  const [college, setCollege] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [role, setRole] = useState('student');

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setCourse('LLB Student');
    setCollege('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username.trim() || !password) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (!isLoginView && password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const endpoint = isLoginView ? '/auth/login' : '/auth/register';
    const payload = isLoginView 
      ? { username, password } 
      : { username, password, fullName, course, college };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (response.ok && data.success) {
        if (isLoginView) {
          loginUser(
            data.data.userId, 
            data.data.username, 
            data.data.fullName, 
            data.data.course, 
            data.data.college, 
            data.data.profileImage,
            data.data.is_admin || 0
          );
          if (data.data.is_admin) {
            setUserRole('admin');
          } else {
            setUserRole(role);
          }
        } else {
          setSuccessMsg('Registration successful! Please login.');
          setIsLoginView(true);
          setPassword('');
          setConfirmPassword('');
          setFullName('');
          setCourse('LLB Student');
          setCollege('');
        }
      } else {
        setErrorMsg(data.detail || 'Authentication failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Server connection failed. Please ensure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-screen-wrapper" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at bottom, #111827 0%, #030712 100%)',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '420px',
        width: '100%',
        padding: '40px 32px',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        border: '1px solid var(--border-glass)',
        textAlign: 'center'
      }}>
        {/* Logo */}
        <img 
          src="/indian_judiciary_seal.jpg" 
          alt="Indian Court Seal" 
          style={{
            width: '110px',
            height: '110px',
            borderRadius: '50%',
            border: '2px solid var(--color-gold)',
            boxShadow: '0 0 15px rgba(205, 162, 80, 0.4)',
            marginBottom: '16px',
            objectFit: 'cover'
          }} 
        />

        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.75rem',
          fontWeight: '700',
          marginBottom: '6px',
          color: '#ffffff'
        }}>
          MootCourt AI
        </h2>
        <p style={{
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          marginBottom: '30px'
        }}>
          {isLoginView ? 'Sign in to access your advocate workspace' : 'Register a new student advocate account'}
        </p>

        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            color: 'var(--color-danger)',
            fontSize: '0.85rem',
            padding: '12px',
            textAlign: 'left',
            marginBottom: '20px'
          }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '8px',
            color: 'var(--color-success)',
            fontSize: '0.85rem',
            padding: '12px',
            textAlign: 'left',
            marginBottom: '20px'
          }}>
            <CheckCircle size={18} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Role Selector */}
          <div style={{ textAlign: 'left' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>My Role</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => { setRole('student'); setCourse('LLB Student'); }}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: role === 'student' ? '1.5px solid var(--color-gold)' : '1px solid var(--border-glass)',
                  background: role === 'student' ? 'rgba(212, 175, 55, 0.08)' : 'transparent',
                  color: role === 'student' ? 'var(--color-gold)' : 'rgba(255,255,255,0.6)',
                  fontWeight: '700',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
              >
                👨‍🎓 Student
              </button>
              <button
                type="button"
                onClick={() => { setRole('professor'); setCourse('Law Professor'); }}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: role === 'professor' ? '1.5px solid var(--color-gold)' : '1px solid var(--border-glass)',
                  background: role === 'professor' ? 'rgba(212, 175, 55, 0.08)' : 'transparent',
                  color: role === 'professor' ? 'var(--color-gold)' : 'rgba(255,255,255,0.6)',
                  fontWeight: '700',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
              >
                👩‍🏫 Professor
              </button>
            </div>
          </div>

          {/* Username */}
          <div style={{ textAlign: 'left' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Username</label>
            <div className="chat-input-container" style={{ padding: '0 12px', height: '44px', display: 'flex', alignItems: 'center' }}>
              <User size={18} color="var(--text-muted)" style={{ marginRight: '10px' }} />
              <input
                type="text"
                className="chat-input"
                style={{ height: '100%', fontSize: '0.9rem', border: 'none', background: 'transparent', flex: 1, color: 'white', padding: 0 }}
                placeholder="advocate_john"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Full Name (Only in Register) */}
          {!isLoginView && (
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Full Name</label>
              <div className="chat-input-container" style={{ padding: '0 12px', height: '44px', display: 'flex', alignItems: 'center' }}>
                <User size={18} color="var(--text-muted)" style={{ marginRight: '10px' }} />
                <input
                  type="text"
                  className="chat-input"
                  style={{ height: '100%', fontSize: '0.9rem', border: 'none', background: 'transparent', flex: 1, color: 'white', padding: 0 }}
                  placeholder="Archana K L"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {/* Course Name (Only in Register) */}
          {!isLoginView && (
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Course / Title</label>
              <div className="chat-input-container" style={{ padding: '0 12px', height: '44px', display: 'flex', alignItems: 'center' }}>
                <Scale size={18} color="var(--text-muted)" style={{ marginRight: '10px' }} />
                <input
                  type="text"
                  className="chat-input"
                  style={{ height: '100%', fontSize: '0.9rem', border: 'none', background: 'transparent', flex: 1, color: 'white', padding: 0 }}
                  placeholder="LLB Student"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {/* College Name (Only in Register) */}
          {!isLoginView && (
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>College / University</label>
              <div className="chat-input-container" style={{ padding: '0 12px', height: '44px', display: 'flex', alignItems: 'center' }}>
                <MapPin size={18} color="var(--text-muted)" style={{ marginRight: '10px' }} />
                <input
                  type="text"
                  className="chat-input"
                  style={{ height: '100%', fontSize: '0.9rem', border: 'none', background: 'transparent', flex: 1, color: 'white', padding: 0 }}
                  placeholder="Government Law College"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div style={{ textAlign: 'left' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Password</label>
            <div className="chat-input-container" style={{ padding: '0 12px', height: '44px', display: 'flex', alignItems: 'center' }}>
              <Lock size={18} color="var(--text-muted)" style={{ marginRight: '10px' }} />
              <input
                type="password"
                className="chat-input"
                style={{ height: '100%', fontSize: '0.9rem', border: 'none', background: 'transparent', flex: 1, color: 'white', padding: 0 }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Confirm Password (Only in Register) */}
          {!isLoginView && (
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Confirm Password</label>
              <div className="chat-input-container" style={{ padding: '0 12px', height: '44px', display: 'flex', alignItems: 'center' }}>
                <Lock size={18} color="var(--text-muted)" style={{ marginRight: '10px' }} />
                <input
                  type="password"
                  className="chat-input"
                  style={{ height: '100%', fontSize: '0.9rem', border: 'none', background: 'transparent', flex: 1, color: 'white', padding: 0 }}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          <button
            className="btn btn-primary"
            type="submit"
            style={{ width: '100%', justifyContent: 'center', height: '44px', fontSize: '0.95rem', marginTop: '10px' }}
            disabled={isLoading}
          >
            {isLoading ? 'Processing Authentications...' : isLoginView ? 'Sign In to Workspace' : 'Create Account'}
            {!isLoading && <ArrowRight size={16} style={{ marginLeft: '8px' }} />}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)'
        }}>
          {isLoginView ? (
            <>
              Don't have an account?{' '}
              <span onClick={toggleView} style={{ color: 'var(--color-gold)', cursor: 'pointer', fontWeight: '600' }}>
                Sign Up
              </span>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <span onClick={toggleView} style={{ color: 'var(--color-gold)', cursor: 'pointer', fontWeight: '600' }}>
                Sign In
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
