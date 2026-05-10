import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, ArrowRight, UserPlus } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import api from '../api';

export default function SignUp() {
  const { theme, toggleTheme } = React.useContext(ThemeContext);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match!");
      return;
    }

    try {
      const res = await api.post('auth/register/', { 
        first_name: firstName, 
        last_name: lastName,
        email: email, 
        password: password 
      });
      if(res.data) {
        // Automatically login the user or redirect
        alert("Registration successful! Please sign in.");
        navigate('/auth');
      }
    } catch(e) {
      if (e.response && e.response.data) {
        // Usually Django returns {"email": ["user with this email already exists."]} or similar
        const backendErrors = Object.values(e.response.data).flat().join(" ");
        setErrorMsg(backendErrors || "Registration Error: Email may already exist.");
      } else {
        setErrorMsg("Registration Error: Please try again.");
      }
    }
  };

  return (
    <>
      <nav className="navbar" id="navbar">
        <Link to="/" className="nav-brand" style={{ 
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '1px',
          marginTop: '8px',
          height: '100%'
        }}>
          <img 
            src="/photo.svg" 
            alt="Logo" 
            style={{ 
              height: '35px', 
              width: 'auto',
              transform: 'scale(2.5)',
              transformOrigin: 'left center',
              objectFit: 'contain'
            }} 
          />
        </Link>
        <div className="nav-links">

          <button 
            onClick={toggleTheme} 
            className="btn btn-outline" 
            style={{ border: 'none', fontSize: '1.2rem', padding: '0.5rem', cursor: 'pointer' }}
          >
            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <Link to="/auth" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Sign In <ArrowRight size={18} />
          </Link>
        </div>
      </nav>

      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <section className="auth-wrapper" style={{ paddingTop: '120px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '3rem' }}>
          <div className="auth-box glass-panel animate-fade" style={{ maxWidth: '450px', width: '100%', padding: '3rem', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              <Link to="/" style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '4px',
                color: '#6B7280', 
                fontSize: '0.875rem', 
                textDecoration: 'none', 
                marginBottom: '1rem',
                fontWeight: '500'
              }}>
                &lt; Home
              </Link>
            </div>
            <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '2rem', color: 'var(--theme-text)' }}>Create Account</h2>
            <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--theme-text-muted)' }}>Join Hygeia to start tracking your health journey today.</p>
            
            {errorMsg && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', padding: '1rem', marginBottom: '1.5rem', color: 'var(--theme-text)', fontSize: '0.95rem', borderRadius: '4px' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleRegister}>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '1.5rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--theme-text)' }}>First Name</label>
                  <input 
                    type="text" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="form-control" 
                    required 
                    placeholder="Jane"
                    style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--theme-input-border)', background: 'var(--theme-input-bg)', color: 'var(--theme-text)', fontSize: '1rem', outline: 'none' }}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--theme-text)' }}>Last Name</label>
                  <input 
                    type="text" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="form-control" 
                    required 
                    placeholder="Doe"
                    style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--theme-input-border)', background: 'var(--theme-input-bg)', color: 'var(--theme-text)', fontSize: '1rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--theme-text)' }}>Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control" 
                  required 
                  placeholder="you@example.com"
                  style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--theme-input-border)', background: 'var(--theme-input-bg)', color: 'var(--theme-text)', fontSize: '1rem', outline: 'none' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--theme-text)' }}>Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control" 
                  required 
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--theme-input-border)', background: 'var(--theme-input-bg)', color: 'var(--theme-text)', fontSize: '1rem', outline: 'none' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--theme-text)' }}>Confirm Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-control" 
                  required 
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--theme-input-border)', background: 'var(--theme-input-bg)', color: 'var(--theme-text)', fontSize: '1rem', outline: 'none' }}
                />
              </div>
              
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem', border: 'none', borderRadius: 'var(--radius-full)', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#85B599', color: 'white' }}>
                Sign Up <UserPlus size={20} />
              </button>
              
              <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--theme-text-muted)' }}>
                Already have an account? <Link to="/auth" style={{ color: '#85B599', fontWeight: '600', textDecoration: 'none' }}>Sign In</Link>
              </p>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
