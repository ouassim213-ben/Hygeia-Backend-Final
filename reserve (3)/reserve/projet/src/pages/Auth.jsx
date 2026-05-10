import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, ArrowRight, LogIn } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import { UserContext } from '../context/UserContext';
import api from '../api';

export default function Auth() {
  const { theme, toggleTheme } = React.useContext(ThemeContext);
  const { fetchUser } = React.useContext(UserContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect to home
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/publications');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('auth/login/', { email, password });
      if(res.data && res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('isLoggedIn', 'true');
        
        const user = res.data.user;
        if (user) {
          localStorage.setItem('firstName', user.first_name || '');
          localStorage.setItem('lastName', user.last_name || '');
          localStorage.setItem('isStaff', user.is_staff ? 'true' : 'false');
          localStorage.setItem('is_superuser', String(user.is_superuser));
          localStorage.setItem('user_type', (user.profile?.role || 'PATIENT').toLowerCase());
          await fetchUser();
        }
        
        if (email === 'ouasssimbenmourallah@yahoo.com' || user.is_staff === true || user.role === 'ADMIN') {
            // ONLY Admin goes to the blue Django page
            window.location.href = "http://127.0.0.1:8000/admin/";
        } else if (user.role === 'NUTRITIONIST' || user.profile?.role === 'NUTRITIONIST') {
            // Nutritionists land directly on the Publications feed
            navigate('/publications');
        } else {
            // Normal Users stay in the React Site
            const pendingPlan = localStorage.getItem('pendingPlan');
            if (pendingPlan) {
                navigate('/appointments'); // Redirect if they picked a plan
            } else {
                navigate('/publications'); // Standard entry
            }
        }
      }
    } catch(e) {
      if (e.response && e.response.status === 403) {
        alert(e.response.data.error || "Your account is pending admin approval. Please wait.");
      } else {
        alert("Login Error: Please check your credentials");
      }
    }
  };

  return (
    <>
      <style>{`
        body, html {
          margin: 0;
          padding: 0;
          height: 100vh;
          overflow: hidden;
        }
        .page-wrapper {
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
        }
        .split-layout-wrapper {
          display: flex;
          align-items: stretch;
          flex: 1;
          min-height: 0;
          background-color: white;
        }
        .split-image {
          display: none;
          flex: 1;
          position: relative;
          overflow: hidden;
          height: 100%;
        }
        .split-image::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 60%);
          z-index: 5;
        }
        .image-overlay {
          position: absolute;
          bottom: 15%;
          left: 10%;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          max-width: 600px;
        }
        .headline {
          color: white;
          font-family: 'Outfit', sans-serif;
          font-size: 4rem;
          font-weight: 800;
          margin: 0 0 15px 0;
          line-height: 1.1;
          letter-spacing: -0.5px;
          text-shadow: 0 4px 30px rgba(0,0,0,0.9);
        }
        .description {
          color: white;
          font-family: 'Outfit', sans-serif;
          font-size: 1.4rem;
          font-weight: 500;
          opacity: 1;
          margin: 0;
          line-height: 1.4;
          text-shadow: 0 2px 15px rgba(0,0,0,0.9);
        }

        .split-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          height: 100%;
          background-color: white;
          overflow: hidden;
        }
        @media (min-width: 992px) {
          .split-image {
            display: block;
          }
          .split-content {
            max-width: 50vw;
          }
        }
      `}</style>
      <div className="page-wrapper">
      <nav style={{ 
        backgroundColor: '#194459', 
        padding: '1.1rem 5% 1.1rem 0', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        width: '100%',
        zIndex: 1000,
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        boxSizing: 'border-box',
        flexShrink: 0
      }}>
        <Link to="/" className="nav-brand" style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '1.5rem' }}>
            <Link to="/login" style={{ 
              color: 'rgba(255, 255, 255, 0.92)', 
              textDecoration: 'none', 
              fontSize: '0.9rem',
              padding: '0.55rem 1.4rem',
              borderRadius: '50px',
              border: '1.5px solid rgba(255, 255, 255, 0.6)',
              fontWeight: '700',
              letterSpacing: '0.02em'
            }}>Login</Link>
            <Link to="/signup" style={{ 
              backgroundColor: '#F1CC61', 
              color: '#194459', 
              padding: '0.55rem 1.4rem', 
              borderRadius: '50px', 
              textDecoration: 'none', 
              fontWeight: '700',
              fontSize: '0.9rem',
              letterSpacing: '0.02em',
              boxShadow: '0 4px 14px rgba(241, 204, 97, 0.35)'
            }}>Sign Up</Link>
          </div>
        </div>
      </nav>

      <div className="split-layout-wrapper">
        <div className="split-image">
          <img src="/auth.jpg" alt="Health and Nutrition" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', imageRendering: 'auto' }} />
          <div className="image-overlay">
            <h1 className="headline">Nourish Smarter, Live Better.</h1>
            <p className="description">Join Hygeia to transform your health with AI insights.</p>
          </div>
        </div>
        <div className="split-content">
          <main style={{ width: '100%', overflowY: 'auto', padding: '2rem 0' }}>
            <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto', padding: '0 2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                <Link to="/" style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  color: '#6B7280', 
                  fontSize: '0.875rem', 
                  textDecoration: 'none', 
                  marginBottom: '1.5rem',
                  fontWeight: '500',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.color = '#194459'}
                onMouseOut={(e) => e.target.style.color = '#6B7280'}
                >
                  &lt; Home
                </Link>
              </div>
              <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '2.5rem', color: '#194459', fontFamily: 'serif', fontWeight: 'bold' }}>Welcome Back</h2>
            <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#194459', opacity: 0.7 }}>Sign in to your account.</p>
            
            <form onSubmit={handleLogin}>
              <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#194459', fontWeight: '600', fontSize: '0.9rem' }}>Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control" 
                  required 
                  placeholder="user3@gmail.com"
                  style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1.5px solid #194459', background: '#eef4ff', color: '#194459', fontSize: '1rem', outline: 'none' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#194459', fontWeight: '600', fontSize: '0.9rem' }}>Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control" 
                  required 
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1.5px solid #194459', background: '#eef4ff', color: '#194459', fontSize: '1rem', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#194459', cursor: 'pointer' }}>
                  <input type="checkbox" /> Remember me
                </label>
                <a href="#" style={{ color: '#B0B761', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none' }}>Forgot Password?</a>
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', borderRadius: '50px', background: '#f0c27b', border: 'none', color: '#194459', fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer' }}>
                Sign In <ArrowRight size={20} />
              </button>
              
              <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#194459' }}>
                Don't have an account? <Link to="/signup" style={{ color: '#f0c27b', fontWeight: '700', textDecoration: 'none' }}>Sign Up</Link>
              </p>
            </form>
            </div>
          </main>
        </div>
      </div>
      </div>
    </>
  );
}
