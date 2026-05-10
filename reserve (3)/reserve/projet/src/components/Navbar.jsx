import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Brain, Menu, X as CloseIcon, ChevronDown, ChevronUp, Bell } from 'lucide-react';
import { UserContext } from '../context/UserContext';
import api from '../api';

export default function Navbar() {
  const { userData, logout } = React.useContext(UserContext);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [showDashboardLinks, setShowDashboardLinks] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = React.useState([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);
  
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;
  const userType = localStorage.getItem('user_type'); 
  const isNutritionist = userType?.toLowerCase() === 'nutritionist';

  const handleLogout = (e) => {
    e.preventDefault();
    logout(); // This clears userData in context and localStorage
    setIsNotificationsOpen(false);
    navigate('/');
  };

  const getLinkStyle = (path) => {
    return location.pathname === path ? { color: 'var(--color-highlight)' } : {};
  };

  const handleNavClick = (e, targetId) => {
    setIsMenuOpen(false); 
    if (location.pathname === '/') {
      e.preventDefault();
      const element = document.getElementById(targetId.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/${targetId}`);
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('notifications/');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unread_count);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const markAsRead = async (id = null) => {
    try {
      await api.post('notifications/mark-read/', { notification_id: id });
      if (id) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        // Recalculate unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      }
    } catch (err) {
      console.error("Error marking notifications as read:", err);
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    setIsNotificationsOpen(false);
    // Redirection is handled by the <Link> component
  };

  React.useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // 30 seconds polling
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, token]);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };


  return (
    <nav className="navbar" id="navbar">
      {isLoggedIn ? (
        <div className="nav-brand" style={{ 
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '1px',
          marginTop: '10px',
          height: '100%'
        }}>
          <img 
            src="/photo.svg" 
            alt="Logo" 
            style={{ 
              height: '32px', 
              width: 'auto',
              transform: 'scale(3)',
              objectFit: 'contain'
            }} 
          />
        </div>
      ) : (
        <Link to="/" className="nav-brand" style={{ 
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '1px',
          marginTop: '10px',
          height: '100%'
        }}>
          <img 
            src="/photo.svg" 
            alt="Logo" 
            style={{ 
              height: '32px', 
              width: 'auto',
              transform: 'scale(3)',
              objectFit: 'contain'
            }} 
          />
        </Link>
      )}

      {/* Hamburger Menu Button */}
      <button 
        className="mobile-menu-btn" 
        onClick={toggleMenu}
        style={{ display: 'none', background: 'none', border: 'none', color: '#F3E5AB', zIndex: 1002 }}
      >
        {isMenuOpen ? <CloseIcon size={28} /> : <Menu size={28} />}
      </button>

      <div className={`nav-overlay ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)} />
      
      <div className={`nav-links ${isMenuOpen ? 'mobile-active' : ''}`}>
        {!isLoggedIn ? (
          /* GUEST VIEW */
          <div className="nav-links-container">
            <Link to="/" onClick={(e) => handleNavClick(e, '#home')} className="nav-link">Home</Link>
            <Link to="/#services" onClick={(e) => handleNavClick(e, '#services')} className="nav-link">Services</Link>
            <Link to="/#programs" onClick={(e) => handleNavClick(e, '#programs')} className="nav-link">Programs</Link>
            <Link to="/about" className="nav-link" style={getLinkStyle('/about')}>About Us</Link>
            <div className="nav-auth-buttons">
              <Link to="/login" className="btn-nav-login">Login</Link>
              <Link to="/signup" className="btn-nav-signup">Sign Up</Link>
            </div>
          </div>
        ) : (
          /* LOGGED IN VIEW (Shared logic for Nutritionist & Patient) */
          <>
            <div className="mobile-drawer-content">

              <div className="mobile-primary-links">
                <Link to="/publications" onClick={() => setIsMenuOpen(false)} className="nav-link">Publications</Link>
                {isNutritionist ? (
                  <>
                    <Link to="/schedule" onClick={() => setIsMenuOpen(false)} className="nav-link">Schedule</Link>
                    <Link to="/my-patients" onClick={() => setIsMenuOpen(false)} className="nav-link">My Patients</Link>
                  </>
                ) : (
                  <>
                    <Link to="/ai-tracker" onClick={() => setIsMenuOpen(false)} className="nav-link">AI Tracker</Link>
                    <Link to="/appointments" onClick={() => setIsMenuOpen(false)} className="nav-link">Appointments</Link>
                  </>
                )}
                <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="nav-link">Profile</Link>
              </div>

              <button onClick={handleLogout} className="btn-logout-nav" style={{ marginTop: 'auto', width: 'fit-content' }}>
                <LogOut size={16} /> Logout
              </button>
            </div>

            {/* DESKTOP LINKS */}
            <div className="nav-links-container desktop-only">
                <Link to="/publications" className="nav-link" style={getLinkStyle('/publications')}>Publications</Link>
                
                {isNutritionist ? (
                  <>
                    <Link to="/schedule" className="nav-link" style={getLinkStyle('/schedule')}>Schedule</Link>
                    <Link to="/my-patients" className="nav-link" style={getLinkStyle('/my-patients')}>My Patients</Link>
                  </>
                ) : (
                  <>
                    <Link to="/ai-tracker" className="nav-link" style={getLinkStyle('/ai-tracker')}><Brain size={14} /> AI Tracker</Link>
                    <Link to="/appointments" className="nav-link" style={getLinkStyle('/appointments')}>Appointments</Link>
                  </>
                )}

                <div className="nav-user-area">
                  {/* Notification Bell */}
                  <div className="notification-bell-container" onClick={toggleNotifications} ref={dropdownRef}>
                    <Bell size={22} />
                    {unreadCount > 0 && <span className="notification-badge" />}
                    
                    {isNotificationsOpen && (
                      <div className="notification-dropdown">
                        <div className="notification-header">
                          <h3>Notifications</h3>
                          {unreadCount > 0 && <span className="pro-badge" style={{ background: '#ef4444', color: 'white' }}>{unreadCount} New</span>}
                        </div>
                        <div className="notification-list">
                          {notifications.length > 0 ? (
                            notifications.map(notification => (
                                <Link 
                                key={notification.id} 
                                to={notification.link} 
                                className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                                onClick={() => handleNotificationClick(notification)}
                              >
                                <div className="notification-text">{notification.text}</div>
                                <div className="notification-time">{new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                              </Link>
                            ))
                          ) : (
                            <div className="notification-empty">No new updates</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <Link to="/profile">
                    <div className="nav-avatar" style={isNutritionist ? { border: '2px solid #88B699' } : {}}>
                      <img src={userData?.profile?.image || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} alt="user" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </Link>
                  <button onClick={handleLogout} className="btn-logout-nav">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}