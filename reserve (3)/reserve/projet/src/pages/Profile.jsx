import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import ProgressTracker from '../components/ProgressTracker';
import { 
  User, Settings, Calendar, CreditCard, 
  Activity, Phone, Award, Camera, 
  Save, LogOut, ChevronRight, CheckCircle, 
  Clock, ArrowUpCircle, Info, Heart,
  Briefcase, ShieldCheck, CalendarCheck, Users, Star, Video, Check,
  Paperclip, FileText, Download
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { UserContext } from '../context/UserContext';

const PATIENT_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: Activity },
  { id: 'appointments', label: 'My Bookings', icon: Calendar },
  { id: 'agenda', label: 'My Active Program', icon: CalendarCheck },
  { id: 'clinical', label: 'Clinical Messages', icon: Phone },
  { id: 'support', label: 'Support', icon: Heart },
  { id: 'subscription', label: 'Subscription', icon: CreditCard },
  { id: 'settings', label: 'Settings', icon: Settings }
];

const NUTRITIONIST_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: Activity },
  { id: 'workspace', label: 'My Tools', icon: Briefcase },
  { id: 'clinical', label: 'Clinical Messages', icon: Phone },
  { id: 'support', label: 'Support', icon: Heart },
  { id: 'settings', label: 'Settings', icon: Settings }
];

export default function Profile() {
  const { setUserData: setGlobalUserData, logout } = React.useContext(UserContext);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeChatPartner, setActiveChatPartner] = useState(null); // { id, name }
  const [tick, setTick] = useState(0); // Force re-render for timers
  const [isLoading, setIsLoading] = useState(true);
  const userType = localStorage.getItem('user_type'); // 'patient' | 'nutritionist' | 'admin'
  const isNutritionist = userType?.toLowerCase() === 'nutritionist';
  const TABS = isNutritionist ? NUTRITIONIST_TABS : PATIENT_TABS;
  const [userData, setUserData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    age: '',
    weight: '',
    height: '',
    bio: '',
    specialty_type: '',
    office_address: '',
    meeting_url: '',
    health_issues: '',
    primary_goal: '',
    allergies_meds: '',
    lifestyle: ''
  });
  const [profilePic, setProfilePic] = useState(null); // The actual File object
  const [profilePreview, setProfilePreview] = useState(null); // The local preview URL
  const [updateMsg, setUpdateMsg] = useState({ type: '', text: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [supportMessages, setSupportMessages] = useState([]);
  const [clinicalMessages, setClinicalMessages] = useState([]);
  const [newSupportMessage, setNewSupportMessage] = useState('');
  const [newClinicalMessage, setNewClinicalMessage] = useState('');
  const [clinicalFile, setClinicalFile] = useState(null);
  const [supportBadge, setSupportBadge] = useState(false);
  const lastSeenId = useRef(null);
  const notificationSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Professional Default Avatar (Initials or generic icon)
  const defaultAvatar = "https://ui-avatars.com/api/?background=cbd5e1&color=64748b&name=" + (userData?.first_name || 'U');

  useEffect(() => {
    fetchInitial();
    
    // Handle URL params (e.g., from notifications or MyPatients)
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    const partnerIdParam = params.get('partner');
    const partnerNameParam = params.get('name');

    if (tabParam) setActiveTab(tabParam);
    if (location.pathname.includes('/dashboard/messages') || tabParam === 'clinical') {
      setActiveTab('clinical');
    }
    
    if (partnerIdParam) {
      setActiveChatPartner({ id: partnerIdParam, name: partnerNameParam || 'Patient' });
    }

    // Force Light background for this page
    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#FFFFFF';
    return () => {
      document.body.style.backgroundColor = originalBg;
    };
  }, [location.search, location.pathname]);

  const fetchInitial = async () => {
    await Promise.all([fetchUserData(), fetchAppointments()]);
    if (activeTab === 'support') fetchSupportMessages();
    if (activeTab === 'clinical') fetchClinicalMessages();
  };

  useEffect(() => {
    // Start global polling for messages
    const msgInterval = setInterval(() => {
        fetchSupportMessages();
        if (activeChatPartner) fetchClinicalMessages();
    }, 3000); 
    
    // Live countdown refresh (30s heartbeat)
    const tickInterval = setInterval(() => {
        setTick(t => t + 1);
    }, 30000);

    return () => {
        clearInterval(msgInterval);
        clearInterval(tickInterval);
    };
  }, [activeChatPartner]); // Re-bind polling when partner changes

  useEffect(() => {
    if (activeTab === 'support') fetchSupportMessages();
    if (activeTab === 'clinical') fetchClinicalMessages();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'support' || activeTab === 'clinical') {
      scrollToBottom();
    }
  }, [supportMessages, clinicalMessages, activeTab]);

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
    }
  };

  const fetchSupportMessages = async () => {
    try {
      const res = await api.get('messages/?chat_type=SUPPORT');
      setSupportMessages(res.data);
    } catch (e) {
      console.error("Support API failed:", e);
    }
  };

  const fetchClinicalMessages = async () => {
    try {
      if (!activeChatPartner) return;
      const res = await api.get(`messages/?chat_type=CONSULTATION&partner=${activeChatPartner.id}`);
      setClinicalMessages(res.data);
    } catch (e) {
      console.error("Clinical API failed:", e);
    }
  };

  // Dedicated Effect for Support Notifications
  useEffect(() => {
    if (supportMessages.length > 0) {
      const lastMsg = supportMessages[supportMessages.length - 1];
      
      if (lastMsg.is_admin_sent && lastMsg.id !== lastSeenId.current) {
        if (activeTab !== 'support') {
          setSupportBadge(true);
        }
        
        const token = localStorage.getItem('token');
        if (lastSeenId.current !== null && token) {
          window.alert('Message Support!');
          notificationSound.current.play().catch(() => {}); 
        }
        lastSeenId.current = lastMsg.id;
      } else if (!lastMsg.is_admin_sent) {
        lastSeenId.current = lastMsg.id;
      }
    }
  }, [supportMessages, activeTab]);

  const sendAdminMessage = async (e) => {
    e.preventDefault();
    if (!newSupportMessage.trim()) return;
    try {
      await api.post('messages/', { 
        content: newSupportMessage, 
        chat_type: 'SUPPORT' 
      });
      setNewSupportMessage('');
      fetchSupportMessages();
    } catch (err) {
      console.error("Failed to send support message:", err);
    }
  };

  const sendClinicalMessage = async (e) => {
    e.preventDefault();
    if ((!newClinicalMessage.trim() && !clinicalFile) || !activeChatPartner) return;
    try {
      // Always use FormData — lets the browser set the correct multipart boundary automatically.
      // NEVER manually set Content-Type: multipart/form-data (it strips the boundary and breaks parsing).
      const formData = new FormData();
      formData.append('content', newClinicalMessage);
      formData.append('receiver', activeChatPartner.id);
      formData.append('chat_type', 'CONSULTATION');
      if (clinicalFile) {
        formData.append('attachment', clinicalFile);
      }

      await api.post('messages/', formData);
      setNewClinicalMessage('');
      setClinicalFile(null);
      fetchClinicalMessages();
    } catch (err) {
      console.error("Failed to send clinical message:", err.response?.data || err.message);
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      // Create a local URL for instant preview
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('auth/user/');
      if (res.data) {
        setUserData(res.data);
        setGlobalUserData(res.data);
        localStorage.setItem('firstName', res.data.first_name || '');
        localStorage.setItem('lastName', res.data.last_name || '');
        if (res.data.profile?.image) {
          localStorage.setItem('profileImage', res.data.profile.image);
        }
        setFormData({
          first_name: res.data.first_name || '',
          last_name: res.data.last_name || '',
          phone: res.data.profile?.phone || '',
          age: res.data.profile?.age || '',
          weight: res.data.profile?.weight || '',
          height: res.data.profile?.height || '',
          bio: res.data.profile?.bio || '',
          specialty_type: res.data.profile?.specialty_type || '',
          office_address: res.data.profile?.office_address || '',
          meeting_url: res.data.profile?.meeting_url || '',
          health_issues: res.data.profile?.health_issues || '',
          primary_goal: res.data.profile?.primary_goal || '',
          allergies_meds: res.data.profile?.allergies_meds || '',
          lifestyle: res.data.profile?.lifestyle || ''
        });
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setUpdateMsg({ type: 'error', text: 'Error loading profile data.' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await api.get('user/appointments/');
      if (Array.isArray(res.data)) {
        setAppointments(res.data);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateMsg({ type: '', text: '' });
    
    const data = new FormData();
    data.append('first_name', formData.first_name);
    data.append('last_name', formData.last_name);
    
    // Step 1 & 2: Explicit Conversion & Pruning empty fields
    // Phone is a string, keep as is
    if (formData.phone) data.append('profile.phone', formData.phone);
    
    // Numeric fields: parse and only append if valid
    const age = parseInt(formData.age, 10);
    if (!isNaN(age)) data.append('profile.age', age);
    
    const weight = parseFloat(formData.weight);
    if (!isNaN(weight)) data.append('profile.weight', weight);
    
    const height = parseFloat(formData.height);
    if (!isNaN(height)) data.append('profile.height', height);
    
    if (formData.bio) data.append('profile.bio', formData.bio);
    if (formData.meeting_url) data.append('profile.meeting_url', formData.meeting_url);
    if (formData.health_issues) data.append('profile.health_issues', formData.health_issues);
    if (formData.primary_goal) data.append('profile.primary_goal', formData.primary_goal);
    if (formData.allergies_meds) data.append('profile.allergies_meds', formData.allergies_meds);
    if (formData.lifestyle) data.append('profile.lifestyle', formData.lifestyle);
    
    // Smart Image Handling: Only send if a new file is actually chosen
    if (profilePic && typeof profilePic !== 'string') {
      data.append('profile.image', profilePic);
    }

    setIsSaving(true);
    try {
      // Step 3: Ensure multipart/form-data header
      const res = await api.patch('auth/user/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUserData(res.data);
      setGlobalUserData(res.data);
      setUpdateMsg({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setUpdateMsg({ type: '', text: '' }), 4000);
      
      localStorage.setItem('firstName', res.data.first_name);
      localStorage.setItem('lastName', res.data.last_name);
      if (res.data.profile?.image) {
        localStorage.setItem('profileImage', res.data.profile.image);
      }
    } catch (err) {
      console.error("FULL BACKEND ERROR:", err.response?.data || err);
      
      const serverError = err.response?.data;
      let errorText = 'Update failed. Please check your inputs.';
      
      if (serverError && typeof serverError === 'object') {
        const firstKey = Object.keys(serverError)[0];
        const errorVal = serverError[firstKey];
        if (firstKey === 'profile' && typeof errorVal === 'object') {
           const profileKey = Object.keys(errorVal)[0];
           errorText = `${profileKey}: ${errorVal?.[profileKey]?.[0] || 'Unknown profile error'}`;
        } else {
           errorText = Array.isArray(errorVal) ? errorVal[0] : (typeof errorVal === 'string' ? errorVal : 'Validation error.');
        }
      }
      setUpdateMsg({ type: 'error', text: errorText });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusBadge = (dateStr) => {
    if (!dateStr) return null;
    const apptDate = new Date(dateStr);
    const now = new Date();
    if (apptDate > now) {
      return (
        <span style={{ 
          display: 'inline-flex', alignItems: 'center', gap: '5px', 
          background: '#e0f2fe', color: '#0369a1', 
          padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' 
        }}>
          <Clock size={12} /> Confirmed
        </span>
      );
    }
    return (
      <span style={{ 
        display: 'inline-flex', alignItems: 'center', gap: '5px', 
        background: '#dcfce7', color: '#15803d', 
        padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' 
      }}>
        <CheckCircle size={12} /> Completed
      </span>
    );
  };

  if (isLoading) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', color: '#1a202c' }}>
      <Activity size={40} color="#85B599" className="animate-spin" />
      <p style={{ marginTop: '1rem', fontWeight: '500' }}>Loading Patient Record...</p>
      <style>{`
        .animate-spin { animation: spin 2s linear infinite; } 
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .pulse-reminder { animation: pulse 2s infinite; }
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
          70% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
        }
      `}</style>
    </div>
  );

  if (!userData) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
      <p style={{ color: '#1a202c' }}>Unable to retrieve patient record.</p>
      <button onClick={fetchUserData} style={{ marginTop: '1rem', padding: '0.6rem 1.2rem', borderRadius: '8px', background: '#85B599', border: 'none', color: 'white', cursor: 'pointer' }}>Retry Sync</button>
    </div>
  );



  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date();
    // Expected format: "Thu 16.04"
    const parts = dateStr.split(' ');
    if (parts.length < 2) return false;
    const dmy = parts[1].split('.');
    if (dmy.length < 2) return false;
    return parseInt(dmy[0], 10) === today.getDate() && parseInt(dmy[1], 10) === (today.getMonth() + 1);
  };

  const isStartingSoon = (dateStr, timeStr) => {
    if (!isToday(dateStr)) return false;
    const now = new Date();
    const [hrs, mins] = timeStr.split(':').map(Number);
    const apptTime = new Date();
    apptTime.setHours(hrs, mins, 0);
    const diff = (apptTime - now) / 60000; // minutes
    return diff <= 15 && diff > -60;
  };

  const isPassed = (dateStr, timeStr) => {
    if (!isToday(dateStr)) {
        // Simple past date check if needed, but for today:
        return false; 
    }
    const now = new Date();
    const [hrs, mins] = timeStr.split(':').map(Number);
    const apptTime = new Date();
    apptTime.setHours(hrs, mins, 0);
    const diff = (now - apptTime) / 60000;
    return diff > 45;
  };

  const navItemStyle = (id) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 18px',
    borderRadius: '12px',
    color: activeTab === id ? '#FFFFFF' : '#64748b',
    background: activeTab === id ? '#1a202c' : 'transparent',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    border: 'none',
    textAlign: 'left',
    width: '100%'
  });

  return (
    <div style={{ backgroundColor: '#f8fafc' }}>
      <Navbar />
      <style>{`
        body { background-color: #FFFFFF !important; }
        .sidebar-nav { 
          background-color: #FFFFFF !important; 
          width: 280px;
          border-right: 1px solid #e2e8f0;
          padding: 2rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          height: calc(100vh - 80px);
          position: fixed;
          top: 80px;
          left: 0;
          zIndex: 10;
        }
        .dashboard-main {
          margin-left: 280px;
          padding: 3rem;
          padding-top: 110px;
          background-color: #f8fafc;
          min-height: 100vh;
          width: calc(100% - 280px);
        }
        input:focus, textarea:focus { border-color: #85B599 !important; box-shadow: 0 0 0 2px rgba(133,181,153,0.1) !important; }
        .medical-card { background: #FFFFFF; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }

        @media (max-width: 768px) {
          .sidebar-nav {
            display: none !important;
          }
          .dashboard-main {
            margin-left: 0 !important;
            width: 100% !important;
            padding: 1.5rem !important;
            padding-top: 100px !important;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .header-container {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
          }
        }
      `}</style>

      <div style={{ display: 'flex' }}>
        <aside className="sidebar-nav">
          <div style={{ padding: '0 0.5rem 1.5rem 0.5rem', borderBottom: '1px solid #f1f5f9', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '48px', height: '48px', borderRadius: '50%', 
                backgroundImage: `url(${profilePreview || userData?.profile?.image || defaultAvatar})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                border: isNutritionist ? '2px solid #88B699' : '2px solid #f1f5f9'
              }}></div>
              <div>
                <h4 style={{ margin: 0, color: '#1a202c', fontSize: '0.9rem', fontWeight: '700' }}>{userData?.first_name || 'User'} {userData?.last_name || ''}</h4>
                {isNutritionist ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#88B699', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nutritionist</div>
                    <ShieldCheck size={12} color="#88B699" />
                  </div>
                ) : (
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Patient Dashboard</div>
                )}
              </div>
            </div>
            {/* Nutritionist Pro Info */}
            {isNutritionist && (
              <div style={{ marginTop: '1.25rem', background: 'linear-gradient(135deg, #f0fdf4, #e8f5e9)', borderRadius: '12px', padding: '1rem', border: '1px solid #bbf7d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Briefcase size={14} color="#15803d" />
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#15803d' }}>{userData?.profile?.specialty || 'Clinical Nutritionist'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Star size={14} color="#f59e0b" />
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>{userData?.profile?.experience || '—'} yrs experience</span>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#021B27', color: 'white', padding: '4px 12px', borderRadius: '99px', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '1px', marginTop: '4px' }}>
                  <ShieldCheck size={12} /> VERIFIED PRO
                </div>
              </div>
            )}
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {TABS.map(tab => {
              const hasBadge = tab.id === 'support' && supportBadge;
              return (
                <button 
                  key={tab.id} 
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === 'support') setSupportBadge(false);
                  }} 
                  style={{ ...navItemStyle(tab.id), position: 'relative' }}
                >
                  <tab.icon size={18} /> {tab.label}
                  {hasBadge && (
                    <span style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%',
                      boxShadow: '0 0 10px rgba(239, 68, 68, 0.4)'
                    }} />
                  )}
                </button>
              );
            })}
          </div>

          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 18px', color: '#ef4444', fontWeight: '600', cursor: 'pointer', background: 'transparent', border: 'none', marginTop: 'auto' }}>
            <LogOut size={18} /> Exit Dashboard
          </button>
        </aside>

        <main className="dashboard-main">
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            
            {/* NUTRITIONIST WORKSPACE TAB */}
            {activeTab === 'workspace' && isNutritionist && (
              <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
                <header style={{ marginBottom: '2.5rem' }}>
                  <h1 style={{ color: '#021B27', fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px' }}>My Tools</h1>
                  <p style={{ color: '#64748b' }}>Manage your schedule, review pending appointments, and monitor patient progress.</p>
                </header>

                {/* Management Dashboard Title */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                  {[
                    { icon: CalendarCheck, label: 'Confirmed Today', val: appointments.filter(a => new Date(a.date) > new Date()).length, color: '#88B699', bg: '#f0fdf4' },
                    { icon: Users, label: 'Total Patients', val: appointments.length, color: '#3b82f6', bg: '#eff6ff' },
                  ].map((stat, i) => (
                    <div key={i} className="medical-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <stat.icon size={26} color={stat.color} />
                      </div>
                      <div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: '#021B27' }}>{stat.val}</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Working Hours Setter */}
                <div className="medical-card" style={{ padding: '2.5rem', marginBottom: '2.5rem' }}>
                  <h3 style={{ color: '#021B27', fontWeight: '800', marginBottom: '1.5rem', fontSize: '1.2rem' }}>⏰ Set Availability (Valable Hours)</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.2rem' }}>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                      <div key={day} style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: '700', color: '#021B27', marginBottom: '10px', fontSize: '0.85rem' }}>{day}</div>
                        <input type="time" defaultValue="09:00" style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#021B27', marginBottom: '6px', fontSize: '0.85rem' }} />
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>to</span>
                        <input type="time" defaultValue="17:00" style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#021B27', marginTop: '6px', fontSize: '0.85rem' }} />
                      </div>
                    ))}
                  </div>
                  <button style={{ marginTop: '1.5rem', padding: '0.9rem 2.5rem', borderRadius: '12px', background: '#021B27', color: 'white', fontWeight: '700', border: 'none', cursor: 'pointer', fontSize: '0.95rem' }}>
                    Save Availability
                  </button>
                </div>

                {/* Pending & Confirmed Appointments */}
                <div className="medical-card" style={{ padding: '2rem' }}>
                  <h3 style={{ color: '#021B27', fontWeight: '800', marginBottom: '1.5rem', fontSize: '1.2rem' }}>📋 Patient Appointment List</h3>
                  {appointments.length === 0 ? (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>No patient appointments yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {appointments.map((appt, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <User size={18} color="#0369a1" />
                            </div>
                            <div>
                              <div style={{ fontWeight: '700', color: '#021B27' }}>{appt.specialist_name || 'Patient'}</div>
                              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{appt.plan_name}</div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#021B27' }}>{appt?.date} • {appt?.time}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                              {(appt?.status === 'UPCOMING' && !isPassed(appt?.date, appt?.time)) ? (
                                isToday(appt?.date) && appt?.zoom_link && (
                                  <>
                                    {isStartingSoon(appt?.date, appt?.time) && (
                                      <div className="pulse-reminder" style={{ 
                                        fontSize: '0.75rem', color: '#854d0e', fontWeight: '800', 
                                        background: '#fef3c7', padding: '6px 12px', borderRadius: '8px', 
                                        border: '1px solid #fde68a', marginBottom: '4px',
                                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
                                      }}>
                                        ⚠️ Starting Soon: Join the Zoom session now!
                                      </div>
                                    )}
                                    <button 
                                      onClick={() => window.open(appt?.zoom_link, '_blank')}
                                      style={{ padding: '6px 14px', borderRadius: '8px', background: '#22c55e', color: 'white', border: 'none', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 6px rgba(34, 197, 94, 0.2)' }}
                                    >
                                      Start Zoom Session 🎥 <Video size={14} />
                                    </button>
                                  </>
                                )
                              ) : (
                                <button 
                                  onClick={() => {
                                    setActiveTab('support');
                                    setActiveChatPartner({ id: appt.patient, name: appt.patient_name });
                                  }}
                                  style={{ padding: '6px 14px', borderRadius: '8px', background: '#021B27', color: 'white', border: 'none', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
                                >
                                  Send Diet Plan / Chat
                                </button>
                              )}
                              {getStatusBadge(appt?.date)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'dashboard' && (
              <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
                {/* DYNAMIC GREETING & IDENTITY */}
                <header className="header-container" style={{ 
                  display: 'flex', alignItems: 'center', gap: '2.5rem', 
                  marginBottom: '3rem', background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                  padding: '2.5rem', borderRadius: '24px', border: '1px solid #f1f5f9'
                }}>
                  <div style={{ position: 'relative', group: 'true' }}>
                    <div style={{ 
                      width: '120px', height: '120px', borderRadius: '50%', 
                      backgroundImage: `url(${profilePreview || userData?.profile?.image || defaultAvatar})`,
                      backgroundSize: 'cover', backgroundPosition: 'center', border: '4px solid white',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      transition: 'all 0.3s ease'
                    }}></div>
                    
                    {/* Floating Upload Button */}
                    <button 
                      onClick={() => fileInputRef.current.click()}
                      style={{
                        position: 'absolute', bottom: '0', right: '0',
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: '#021B27', color: 'white', border: '3px solid white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                        transition: 'transform 0.2s ease'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <Camera size={18} />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleProfilePicChange} 
                      style={{ display: 'none' }} 
                      accept="image/*"
                    />
                  </div>
                  <div>
                    <h1 style={{ color: '#1a202c', fontSize: '2.4rem', fontWeight: '800', margin: '0 0 8px 0' }}>
                      Welcome back, {isNutritionist ? 'Dr.' : ''} {userData?.first_name || (isNutritionist ? 'Doctor' : 'Patient')}!
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', margin: 0 }}>
                      {isNutritionist
                        ? <>Your professional dashboard is ready. <span style={{ color: '#88B699', fontWeight: '700' }}>All systems are operational.</span></>
                        : <>Hygeia clinical record is synchronized. <span style={{ color: '#85B599', fontWeight: '700' }}>Everything looks optimal today.</span></>
                      }
                    </p>
                  </div>
                </header>

                {/* ONBOARDING BANNER (CONDITIONAL) */}
                {(!userData?.profile?.weight || !userData?.profile?.height) && (
                  <div style={{ 
                    padding: '1.25rem 2rem', borderRadius: '16px', marginBottom: '2.5rem',
                    background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', 
                    alignItems: 'center', gap: '15px', color: '#15803d', fontWeight: '600'
                  }}>
                    <Info size={20} />
                    <span>Help us personalize your experience—complete your health profile in <button onClick={() => setActiveTab('settings')} style={{ background: 'none', border: 'none', color: '#15803d', fontWeight: '800', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}>Settings</button> to see your BMI.</span>
                  </div>
                )}

                {/* STATS SECTION — Role-aware */}
                {isNutritionist ? (
                  // NUTRITIONIST: Professional summary instead of health metrics
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                    <div className="medical-card" style={{ padding: '1.75rem', gridColumn: 'span 2' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Specialty</div>
                          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#021B27' }}>{userData?.profile?.specialty_type || 'Clinical Nutritionist'}</div>
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#021B27', color: 'white', padding: '6px 16px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '1px' }}>
                          <ShieldCheck size={14} /> VERIFIED PRO
                        </div>
                      </div>
                    </div>
                    <div className="medical-card" style={{ padding: '1.75rem' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Patients Booked</div>
                      <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#021B27' }}>{appointments.length}</div>
                      <div style={{ fontSize: '0.85rem', color: '#88B699', fontWeight: '600', marginTop: '4px' }}>Total appointments</div>
                    </div>
                    <div className="medical-card" style={{ padding: '1.75rem' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Next Available Slot</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#021B27' }}>See Schedule</div>
                      <Link to="/schedule" style={{ fontSize: '0.85rem', color: '#88B699', fontWeight: '700', marginTop: '4px', display: 'inline-block' }}>Manage availability →</Link>
                    </div>
                  </div>
                ) : (
                  // PATIENT: Standard health metrics grid
                  <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                  {[
                    { label: 'Weight', val: userData?.profile?.weight, unit: 'kg', icon: Activity, color: '#3b82f6' },
                    { label: 'Height', val: userData?.profile?.height, unit: 'cm', icon: ArrowUpCircle, color: '#8b5cf6' },
                    { label: 'Age', val: userData?.profile?.age, unit: 'yrs', icon: User, color: '#f59e0b' },
                    { 
                      label: 'BMI Index', 
                      val: (userData?.profile?.weight && userData?.profile?.height) 
                        ? (userData?.profile?.weight / Math.pow(userData?.profile?.height / 100, 2)).toFixed(1) 
                        : null, 
                      unit: 'Score', 
                      icon: Heart, 
                      color: '#ef4444' 
                    }
                  ].map((stat, i) => (
                    <div key={i} className="medical-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '12px', border: stat.val ? '1px solid #e2e8f0' : '1px dashed #cbd5e1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <stat.icon size={20} color={stat.color} />
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>{stat.label}</span>
                      </div>
                      <h3 style={{ color: stat.val ? '#1a202c' : '#94a3b8', fontSize: '1.8rem', margin: 0, fontWeight: '800' }}>
                        {stat.val || 'N/A'}
                      </h3>
                      <div style={{ fontSize: '0.85rem', color: stat.val ? '#64748b' : '#cbd5e1', fontWeight: '600' }}>
                        {stat.val ? (stat.label === 'BMI Index' ? (parseFloat(stat.val) < 25 ? 'Healthy Range' : 'Attention Needed') : `${stat.unit} recorded`) : 'Set in Settings'}
                      </div>
                    </div>
                  ))}
                  </div>
                )}

                {/* SECONDARY TILES */}
                <div className="medical-card" style={{ padding: '2.5rem', display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '3rem' }}>
                  <div style={{ background: '#f0fdf4', padding: '1.5rem', borderRadius: '16px' }}>
                    <Calendar size={40} color="#85B599" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: '#1a202c', margin: '0 0 8px', fontWeight: '800', fontSize: '1.25rem' }}>Next Consultation</h3>
                    {appointments.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <p style={{ color: '#64748b', margin: 0, fontSize: '1.05rem' }}>
                          {isNutritionist ? (
                            <>Next Patient: <strong style={{ color: '#1a202c' }}>{appointments[0]?.patient_name || 'Anonymous Patient'}</strong></>
                          ) : (
                            <>Meeting with <strong style={{ color: '#1a202c' }}>Dr. {appointments[0]?.specialist_name}</strong></>
                          )}
                          <span style={{ margin: '0 8px', opacity: 0.3 }}>|</span>
                          {appointments[0]?.date} at {appointments[0]?.time}
                        </p>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '5px' }}>
                          {/* Live Zoom Action */}
                          {(appointments[0]?.status === 'UPCOMING' && !isPassed(appointments[0]?.date, appointments[0]?.time)) ? (
                            isToday(appointments[0]?.date) && appointments[0]?.zoom_link && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                {(!isNutritionist && isStartingSoon(appointments[0]?.date, appointments[0]?.time)) && (
                                  <div className="pulse-reminder" style={{ 
                                    fontSize: '0.75rem', color: '#854d0e', fontWeight: '800', 
                                    background: '#fef3c7', padding: '6px 12px', borderRadius: '8px', 
                                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)'
                                  }}>
                                    ⚠️ Starting Soon!
                                  </div>
                                )}
                                <button 
                                  onClick={() => window.open(appointments[0].zoom_link, '_blank')}
                                  style={{ 
                                    padding: '0.8rem 2rem', borderRadius: '12px', 
                                    background: isNutritionist ? '#22c55e' : '#3b82f6', 
                                    color: 'white', border: 'none', fontWeight: '800', 
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                                    boxShadow: isNutritionist ? '0 4px 15px rgba(34, 197, 94, 0.2)' : '0 4px 15px rgba(59, 130, 246, 0.2)'
                                  }}
                                >
                                  {isNutritionist ? 'Start Zoom Session 🎥' : 'Join Zoom Meeting 🔵'} <Video size={18} />
                                </button>
                              </div>
                            )
                          ) : (
                            <button 
                              onClick={() => {
                                navigate(`/dashboard/messages?partner=${isNutritionist ? appointments[0].patient : appointments[0].specialist}&name=${encodeURIComponent(isNutritionist ? appointments[0].patient_name : appointments[0].specialist_name)}`);
                              }}
                              style={{ padding: '0.8rem 2rem', borderRadius: '12px', background: '#f8fafc', color: '#1a202c', border: '1px solid #e2e8f0', fontWeight: '800', cursor: 'pointer' }}
                            >
                              {isNutritionist ? 'Send Diet Plan / Chat' : 'Chat with Specialist'}
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p style={{ color: '#64748b' }}>Your consultation list is currently empty.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'clinical' && (
              <div style={{ animation: 'fadeIn 0.4s ease-out', height: 'calc(100vh - 250px)', display: 'flex', flexDirection: 'column' }}>
                <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <h1 style={{ color: '#1a202c', fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px' }}>
                      {activeChatPartner?.name ? `Clinical Chat: ${activeChatPartner.name}` : 'Select a Patient/Specialist'}
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1rem' }}>Secure, direct 1-on-1 medical consultation channel.</p>
                  </div>
                  <button 
                    onClick={fetchClinicalMessages}
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 15px', borderRadius: '10px', color: '#1a202c', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Activity size={16} /> Sync Chat
                  </button>
                </header>

                <div className="medical-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
                  <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {clinicalMessages.length === 0 ? (
                      <div style={{ textAlign: 'center', margin: 'auto', color: '#94a3b8' }}>
                        <Phone size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p>No messages in this consultation yet.</p>
                      </div>
                    ) : (
                      clinicalMessages.map((msg) => {
                        const isMe = msg.sender === userData?.id;

                        // Resolve URL — ensure it's always absolute
                        const attachmentUrl = msg.attachment 
                          ? (msg.attachment.startsWith('http') 
                              ? msg.attachment 
                              : `http://192.168.1.103:8000${msg.attachment}`)
                          : null;

                        // Extract filename from URL
                        const filename = attachmentUrl 
                          ? decodeURIComponent(attachmentUrl.split('/').pop().split('?')[0]) 
                          : '';

                        // Detect if it's an image
                        const isImage = attachmentUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);

                        return (
                          <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: '10px' }}>
                            {!isMe && (
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#021B27', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', flexShrink: 0 }}>
                                {msg.sender_image ? <img src={msg.sender_image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : 'P'}
                              </div>
                            )}
                            <div style={{ 
                              maxWidth: '70%', padding: '0.9rem 1.25rem', borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                              background: isMe ? '#85B599' : '#e0f2fe', color: isMe ? 'white' : '#1e3a8a',
                              boxShadow: '0 4px 10px rgba(0,0,0,0.04)', fontWeight: '500', fontSize: '0.95rem', border: isMe ? 'none' : '1px solid #dbeafe'
                            }}>
                              {/* Text content */}
                              {msg.content && msg.content.trim() && (
                                <div style={{ marginBottom: attachmentUrl ? '10px' : '0' }}>{msg.content}</div>
                              )}
                              
                              {/* Attachment block */}
                              {attachmentUrl && (
                                isImage ? (
                                  /* Image preview */
                                  <a href={attachmentUrl} target="_blank" rel="noreferrer" style={{ display: 'block', marginTop: msg.content ? '6px' : '0' }}>
                                    <img 
                                      src={attachmentUrl} 
                                      alt={filename}
                                      style={{ 
                                        maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', 
                                        objectFit: 'contain', display: 'block',
                                        border: '2px solid rgba(255,255,255,0.4)'
                                      }} 
                                    />
                                    <div style={{ fontSize: '0.7rem', marginTop: '4px', opacity: 0.7 }}>
                                      Click to open full size
                                    </div>
                                  </a>
                                ) : (
                                  /* PDF / file card */
                                  <a 
                                    href={attachmentUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    style={{ 
                                      marginTop: msg.content ? '8px' : '0',
                                      display: 'flex', alignItems: 'center', gap: '10px', 
                                      padding: '10px 14px', borderRadius: '10px', 
                                      background: isMe ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.8)',
                                      border: isMe ? '1px solid rgba(255,255,255,0.4)' : '1px solid #93c5fd',
                                      textDecoration: 'none', color: 'inherit',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <FileText size={28} style={{ flexShrink: 0, color: isMe ? 'white' : '#1d4ed8' }} />
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                      <div style={{ 
                                        fontSize: '0.82rem', fontWeight: '700', 
                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                        color: isMe ? 'white' : '#1e40af'
                                      }}>
                                        {filename || 'Attachment'}
                                      </div>
                                      <div style={{ fontSize: '0.65rem', opacity: 0.75, marginTop: '2px' }}>
                                        Click to download / open
                                      </div>
                                    </div>
                                    <Download size={18} style={{ flexShrink: 0, color: isMe ? 'white' : '#1d4ed8' }} />
                                  </a>
                                )
                              )}

                              {/* Timestamp */}
                              <div style={{ fontSize: '0.65rem', marginTop: '6px', opacity: 0.6, textAlign: 'right', fontWeight: '800' }}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                            {isMe && (
                              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#85B599', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                                <Check size={12} />
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <form onSubmit={sendClinicalMessage} style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#f8fafc' }}>
                    
                    {/* File Preview Chip — shows when a file is selected */}
                    {clinicalFile && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: '10px', padding: '8px 14px' }}>
                        <FileText size={16} style={{ color: '#0369a1', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0369a1', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {clinicalFile.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => setClinicalFile(null)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0369a1', fontWeight: '900', fontSize: '1rem', lineHeight: 1, padding: '0 4px' }}
                          title="Remove file"
                        >✕</button>
                      </div>
                    )}

                    {/* Input Row */}
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      {/* Clinical-Only Paperclip */}
                      <label style={{ cursor: 'pointer', color: clinicalFile ? '#16a34a' : '#64748b', display: 'flex', alignItems: 'center', transition: 'color 0.2s', flexShrink: 0 }} title="Attach PDF / Image">
                        <input 
                          type="file" 
                          accept=".pdf,image/*" 
                          onChange={(e) => setClinicalFile(e.target.files[0])} 
                          style={{ display: 'none' }} 
                        />
                        <Paperclip size={24} />
                      </label>

                      <input 
                        type="text"
                        value={newClinicalMessage}
                        onChange={(e) => setNewClinicalMessage(e.target.value)}
                        placeholder={clinicalFile ? "Add a message with the file (optional)..." : "Type your medical response..."}
                        style={{ flex: 1, padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: 'white', outline: 'none', fontSize: '1rem' }}
                      />
                      <button 
                        type="submit"
                        disabled={(!newClinicalMessage.trim() && !clinicalFile) || !activeChatPartner}
                        style={{ padding: '0 2rem', height: '54px', borderRadius: '12px', background: '#021B27', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', flexShrink: 0, opacity: (newClinicalMessage.trim() || clinicalFile) && activeChatPartner ? 1 : 0.6 }}
                      >
                        Send
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'support' && (
              <div style={{ animation: 'fadeIn 0.4s ease-out', height: 'calc(100vh - 250px)', display: 'flex', flexDirection: 'column' }}>
                <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <h1 style={{ color: '#1a202c', fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px' }}>
                      Support Inbox
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1rem' }}>Chat directly with our administrative team for assistance.</p>
                  </div>
                  <button 
                    onClick={fetchSupportMessages}
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 15px', borderRadius: '10px', color: '#1a202c', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Activity size={16} /> Refresh Chat
                  </button>
                </header>

                <div className="medical-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
                  <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {supportMessages.length === 0 ? (
                      <div style={{ textAlign: 'center', margin: 'auto', color: '#94a3b8' }}>
                        <Heart size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p>No support messages yet. How can we help you today?</p>
                      </div>
                    ) : (
                      supportMessages.map((msg) => {
                        const isMe = !msg.is_admin_sent; 
                        return (
                          <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: '10px' }}>
                            {!isMe && (
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0ea5e9', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                {msg.sender_image ? <img src={msg.sender_image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : 'A'}
                              </div>
                            )}
                            <div style={{ 
                              maxWidth: '70%', padding: '0.9rem 1.25rem', borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                              background: isMe ? '#85B599' : '#e0f2fe', color: isMe ? 'white' : '#1e3a8a',
                              boxShadow: '0 4px 10px rgba(0,0,0,0.04)', fontWeight: '500', fontSize: '0.95rem', border: isMe ? 'none' : '1px solid #dbeafe'
                            }}>
                              {msg.content}
                              <div style={{ fontSize: '0.65rem', marginTop: '6px', opacity: 0.6, textAlign: 'right', fontWeight: '800' }}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                            {isMe && (
                              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#85B599', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                <Check size={12} />
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <form onSubmit={sendAdminMessage} style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '15px', backgroundColor: '#f8fafc' }}>
                    <input 
                      type="text"
                      value={newSupportMessage}
                      onChange={(e) => setNewSupportMessage(e.target.value)}
                      placeholder="Type your support request..."
                      style={{ flex: 1, padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: 'white', outline: 'none', fontSize: '1rem' }}
                    />
                    <button 
                      type="submit"
                      disabled={!newSupportMessage.trim()}
                      style={{ padding: '0 2rem', borderRadius: '12px', background: '#1a202c', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', opacity: newSupportMessage.trim() ? 1 : 0.6 }}
                    >
                      Send Message
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
                <h2 style={{ color: '#1a202c', fontSize: '1.75rem', fontWeight: '800', marginBottom: '2rem' }}>Consultation History</h2>
                <div className="medical-card" style={{ overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>
                        <th style={{ padding: '1.25rem' }}>Specialist</th>
                        <th style={{ padding: '1.25rem' }}>Plan</th>
                        <th style={{ padding: '1.25rem' }}>Schedule</th>
                        <th style={{ padding: '1.25rem' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map(appt => (
                        <tr key={appt.id} style={{ borderBottom: '1px solid #f1f5f9', color: '#1a202c' }}>
                          <td style={{ padding: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundImage: `url(${appt?.specialist_image || 'https://images.unsplash.com/photo-1559839734-2b71f1536783?w=100'})`, backgroundSize: 'cover' }}></div>
                              <span style={{ fontWeight: '600' }}>{appt?.specialist_name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '1.25rem', color: '#64748b', fontSize: '0.9rem' }}>{appt?.plan_name}</td>
                          <td style={{ padding: '1.25rem', fontSize: '0.9rem' }}>{appt?.date} • {appt?.time}</td>
                          <td style={{ padding: '1.25rem' }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                               {(appt?.status === 'UPCOMING' && !isPassed(appt?.date, appt?.time)) ? (
                                 isToday(appt?.date) && appt?.zoom_link && (
                                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                      {isStartingSoon(appt?.date, appt?.time) && (
                                        <div className="pulse-reminder" style={{ 
                                            fontSize: '0.75rem', color: '#854d0e', fontWeight: '800', 
                                            background: '#fef3c7', padding: '6px 12px', borderRadius: '8px', 
                                            border: '1px solid #fde68a',
                                            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
                                        }}>
                                          ⚠️ Starting Soon: Join the Zoom session now!
                                        </div>
                                      )}
                                      <button 
                                        onClick={() => window.open(appt?.zoom_link, '_blank')}
                                        style={{ padding: '8px 16px', borderRadius: '10px', background: '#3b82f6', color: 'white', border: 'none', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)' }}
                                      >
                                        Join Zoom Meeting 🔵 <Video size={14} />
                                      </button>
                                   </div>
                                 )
                               ) : (
                                 <button 
                                   onClick={() => {
                                     navigate(`/dashboard/messages?partner=${isNutritionist ? appt.patient : appt.specialist}&name=${encodeURIComponent(isNutritionist ? appt.patient_name : appt.specialist_name)}`);
                                   }}
                                   style={{ padding: '8px 16px', borderRadius: '10px', background: '#f8fafc', color: '#1a202c', border: '1px solid #e2e8f0', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
                                 >
                                   {isNutritionist ? 'Send Diet Plan / Chat' : 'Chat with Specialist'}
                                 </button>
                               )}
                               {getStatusBadge(appt?.date)}
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'agenda' && (
              <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
                <h2 style={{ color: '#1a202c', fontSize: '1.75rem', fontWeight: '800', marginBottom: '2rem' }}>My Active Program</h2>
                <ProgressTracker readOnly={false} patientId={null} />
              </div>
            )}

            {activeTab === 'subscription' && (
              <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
                <h2 style={{ color: '#1a202c', fontSize: '1.75rem', fontWeight: '800', marginBottom: '2rem' }}>Membership Overview</h2>
                <div className="medical-card" style={{ padding: '3rem', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ 
                      display: 'inline-flex', padding: '8px 18px', borderRadius: '30px', 
                      background: '#FFFFFF', color: '#1a202c', fontWeight: '800', fontSize: '0.85rem',
                      border: '2px solid #85B599', boxShadow: '0 4px 15px rgba(133,181,153,0.15)',
                      marginBottom: '2rem', textTransform: 'uppercase'
                    }}>
                      <Award size={16} style={{ marginRight: '8px', color: '#85B599' }} /> {(userData?.profile?.tier || 'Basic').toUpperCase()} Membership
                    </div>
                    <h3 style={{ color: '#1a202c', fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>Patient Status: Active</h3>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '600px', lineHeight: '1.6', marginBottom: '2.5rem' }}>
                      You have full access to specialist consultations, health tracking reports, and personalized nutrition plans.
                    </p>
                    <Link to="/plans" style={{ textDecoration: 'none' }}>
                      <button style={{ padding: '1rem 2.5rem', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', background: '#1a202c', color: 'white', border: 'none', cursor: 'pointer', transition: 'transform 0.2s' }}>
                        Modify Subscription
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
                <h2 style={{ color: '#1a202c', fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                  {isNutritionist ? 'Professional Profile' : 'Profile Management'}
                </h2>
                <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.95rem' }}>
                  {isNutritionist
                    ? 'Update your professional information visible to patients and the platform.'
                    : 'Manage your personal health record and contact details.'}
                </p>

                {updateMsg.text && (
                  <div style={{
                    padding: '1rem', borderRadius: '12px', marginBottom: '2rem', fontWeight: '600',
                    background: updateMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
                    color: updateMsg.type === 'success' ? '#15803d' : '#b91c1c',
                    border: `1px solid ${updateMsg.type === 'success' ? '#bbf7d0' : '#fecaca'}`
                  }}>
                    {updateMsg.text}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

                  {/* SECTION 1: IDENTITY — Shared by both roles */}
                  <div className="medical-card" style={{ padding: '2rem' }}>
                    <h5 style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.1em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Identity Information</h5>
                    <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start' }}>
                      <div style={{ position: 'relative' }}>
                        <div style={{
                          width: '140px', height: '140px', borderRadius: '50%',
                          backgroundImage: `url(${profilePic && typeof profilePic !== 'string' ? URL.createObjectURL(profilePic) : (userData?.profile?.image || 'https://images.unsplash.com/photo-1559839734-2b71f1536783?w=200')})`,
                          backgroundSize: 'cover', backgroundPosition: 'center',
                          border: isNutritionist ? '4px solid #88B699' : '4px solid #f1f5f9',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                        }}></div>
                        <label style={{
                          position: 'absolute', bottom: '5px', right: '5px',
                          background: '#021B27', color: 'white', padding: '10px',
                          borderRadius: '50%', cursor: 'pointer', border: '3px solid #FFFFFF',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }}>
                          <Camera size={18} />
                          <input type="file" onChange={(e) => setProfilePic(e.target.files[0])} style={{ display: 'none' }} />
                        </label>
                      </div>
                      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', color: '#1a202c', fontWeight: '700', fontSize: '0.85rem' }}>First Name</label>
                          <input type="text" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1a202c', outline: 'none', fontWeight: '500' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', color: '#1a202c', fontWeight: '700', fontSize: '0.85rem' }}>Last Name</label>
                          <input type="text" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1a202c', outline: 'none', fontWeight: '500' }} />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                          <label style={{ display: 'block', marginBottom: '8px', color: '#1a202c', fontWeight: '700', fontSize: '0.85rem' }}>Primary Phone Number</label>
                          <div style={{ position: 'relative' }}>
                            <Phone size={16} style={{ position: 'absolute', top: '15px', left: '16px', color: '#64748b' }} />
                            <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+33 ..." style={{ width: '100%', padding: '0.85rem 1rem', paddingLeft: '45px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1a202c', outline: 'none', fontWeight: '500' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {isNutritionist ? (
                    /* ===================== NUTRITIONIST SECTION 2: PROFESSIONAL CREDENTIALS ===================== */
                    <div className="medical-card" style={{ padding: '2rem' }}>
                      <h5 style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.1em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Professional Credentials</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

                        {/* Specialization Dropdown */}
                        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#1a202c', fontWeight: '700', fontSize: '0.85rem' }}>
                            <Briefcase size={16} color="#88B699" /> Specialization
                          </label>
                          <select
                            value={formData.specialty_type || ''}
                            onChange={(e) => setFormData({...formData, specialty_type: e.target.value})}
                            style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', background: '#FFFFFF', border: '1px solid #e2e8f0', color: '#1a202c', outline: 'none', fontWeight: '600', fontSize: '0.9rem' }}
                          >
                            <option value="">Select specialization...</option>
                            <option value="Clinical Nutritionist">Clinical Nutritionist</option>
                            <option value="Sports Nutrition">Sports Nutrition</option>
                            <option value="Pediatric Nutrition">Pediatric Nutrition</option>
                            <option value="Weight Management">Weight Management</option>
                            <option value="Renal Dietitian">Renal Dietitian</option>
                            <option value="Diabetes Specialist">Diabetes Specialist</option>
                            <option value="Oncology Nutrition">Oncology Nutrition</option>
                            <option value="Holistic Nutritionist">Holistic Nutritionist</option>
                          </select>
                        </div>

                        {/* Office Address */}
                        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#1a202c', fontWeight: '700', fontSize: '0.85rem' }}>
                            <Star size={16} color="#88B699" /> Office Address
                          </label>
                          <input
                            type="text"
                            value={formData.office_address || ''}
                            onChange={(e) => setFormData({...formData, office_address: e.target.value})}
                            placeholder="e.g. 12 Rue de Santé, Paris"
                            style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', background: '#FFFFFF', border: '1px solid #e2e8f0', color: '#1a202c', outline: 'none', fontWeight: '500', fontSize: '0.9rem' }}
                          />
                        </div>

                        {/* Meeting Link (Zoom/Meet) */}
                        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#1a202c', fontWeight: '700', fontSize: '0.85rem' }}>
                            <Video size={16} color="#88B699" /> Professional Zoom / Meeting Link
                          </label>
                          <input
                            type="url"
                            value={formData.meeting_url || ''}
                            onChange={(e) => setFormData({...formData, meeting_url: e.target.value})}
                            placeholder="e.g. https://us05web.zoom.us/j/..."
                            style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', background: '#FFFFFF', border: '1px solid #e2e8f0', color: '#1a202c', outline: 'none', fontWeight: '500', fontSize: '0.9rem' }}
                          />
                        </div>

                        {/* Professional Bio */}
                        <div style={{ gridColumn: 'span 2', background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#1a202c', fontWeight: '700', fontSize: '0.85rem' }}>
                            <ShieldCheck size={16} color="#88B699" /> Professional Biography
                          </label>
                          <textarea
                            rows="5"
                            value={formData.bio}
                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                            placeholder="Describe your clinical approach, credentials, and areas of expertise..."
                            style={{ width: '100%', padding: '1rem', borderRadius: '10px', background: '#FFFFFF', border: '1px solid #e2e8f0', color: '#1a202c', outline: 'none', resize: 'vertical', fontWeight: '500', lineHeight: '1.6', fontSize: '0.9rem' }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ===================== PATIENT SECTION 2: VITAL METRICS ===================== */
                    <>
                      <div className="medical-card" style={{ padding: '2rem' }}>
                        <h5 style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.1em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Health Information</h5>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                          <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#1a202c', fontWeight: '700', fontSize: '0.85rem' }}><Activity size={16} color="#85B599" /> Current Health Issues</label>
                            <textarea 
                              placeholder="Do you have any chronic diseases or current health concerns?"
                              style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1a202c', outline: 'none', resize: 'vertical', minHeight: '80px' }}
                              value={formData.health_issues}
                              onChange={(e) => setFormData({...formData, health_issues: e.target.value})}
                            />
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#1a202c', fontWeight: '700', fontSize: '0.85rem' }}><Award size={16} color="#85B599" /> Primary Goal</label>
                              <select 
                                style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1a202c', outline: 'none', fontWeight: '500' }}
                                value={formData.primary_goal}
                                onChange={(e) => setFormData({...formData, primary_goal: e.target.value})}
                              >
                                <option value="">Select a goal</option>
                                <option value="WEIGHT_LOSS">Weight Loss</option>
                                <option value="MUSCLE_GAIN">Muscle Gain</option>
                                <option value="MANAGE_ILLNESS">Manage Illness</option>
                                <option value="GENERAL_HEALTH">General Health</option>
                              </select>
                            </div>
                            <div>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#1a202c', fontWeight: '700', fontSize: '0.85rem' }}><Activity size={16} color="#85B599" /> Lifestyle Activity Level</label>
                              <select 
                                style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1a202c', outline: 'none', fontWeight: '500' }}
                                value={formData.lifestyle}
                                onChange={(e) => setFormData({...formData, lifestyle: e.target.value})}
                              >
                                <option value="">Select activity level</option>
                                <option value="SEDENTARY">Sedentary (Little to no exercise)</option>
                                <option value="LIGHTLY_ACTIVE">Lightly Active (1-3 days/week)</option>
                                <option value="VERY_ACTIVE">Very Active (4-7 days/week)</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#1a202c', fontWeight: '700', fontSize: '0.85rem' }}><ShieldCheck size={16} color="#85B599" /> Allergies & Medications</label>
                            <textarea 
                              placeholder="List any allergies or current medications you are taking."
                              style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1a202c', outline: 'none', resize: 'vertical', minHeight: '80px' }}
                              value={formData.allergies_meds}
                              onChange={(e) => setFormData({...formData, allergies_meds: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="medical-card" style={{ padding: '2rem' }}>
                        <h5 style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.1em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Vital Health Metrics</h5>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                          {[
                            { label: 'Patient Age', field: 'age', icon: User, unit: 'Years' },
                            { label: 'Weight', field: 'weight', icon: Activity, unit: 'Kilograms' },
                            { label: 'Height', field: 'height', icon: ArrowUpCircle, unit: 'Centimeters' }
                          ].map((item) => (
                            <div key={item.field} style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#1a202c', fontWeight: '700', fontSize: '0.85rem' }}>
                                <item.icon size={16} color="#85B599" /> {item.label}
                              </label>
                              <div style={{ position: 'relative' }}>
                                <input
                                  type="number"
                                  step={item.field === 'weight' ? '0.1' : '1'}
                                  value={formData[item.field]}
                                  onChange={(e) => setFormData({...formData, [item.field]: e.target.value})}
                                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', background: '#FFFFFF', border: '1px solid #e2e8f0', color: '#1a202c', outline: 'none', fontWeight: '700' }}
                                />
                                <span style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>{item.unit}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="medical-card" style={{ padding: '2rem' }}>
                        <h5 style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.1em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Patient Summary & Bio</h5>
                        <textarea
                          rows="5" value={formData.bio}
                          onChange={(e) => setFormData({...formData, bio: e.target.value})}
                          placeholder="Enter your medical history, dietary preferences, or goals..."
                          style={{ width: '100%', padding: '1.5rem', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1a202c', outline: 'none', resize: 'vertical', fontWeight: '500', lineHeight: '1.6' }}
                        />
                      </div>
                    </>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button type="submit" disabled={isSaving} style={{
                      display: 'flex', alignItems: 'center', gap: '10px', padding: '1.2rem 3.5rem',
                      borderRadius: '16px', background: isNutritionist ? '#021B27' : '#85B599', color: 'white', fontWeight: '800',
                      fontSize: '1rem', border: 'none', cursor: isSaving ? 'not-allowed' : 'pointer',
                      boxShadow: isNutritionist ? '0 4px 14px rgba(2,27,39,0.25)' : '0 4px 14px rgba(133,181,153,0.3)', transition: 'all 0.2s',
                      opacity: isSaving ? 0.7 : 1
                    }}>
                      {isSaving ? <Activity size={20} className="animate-spin" /> : <Save size={20} />}
                      {isSaving ? 'Synchronizing...' : (isNutritionist ? 'Update Professional Profile' : 'Update Health Record')}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
