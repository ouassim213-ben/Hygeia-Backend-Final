import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ProgressTracker from '../components/ProgressTracker';
import { Users, Clock, ChevronDown, Send, FileText, CheckCircle, User, ArrowRight, X, Video, ClipboardList, Activity, Target, ShieldAlert, LineChart } from 'lucide-react';
import api from '../api';

const STANDARD_PLANS = [
  { id: 0, title: 'Ramadan Healthy Fasting', emoji: '🌙', desc: 'Optimized nutrition for the holy month.' },
  { id: 1, title: '10kg Weight Loss Intro', emoji: '🔥', desc: '10-day metabolism kickstart guide.' },
  { id: 2, title: 'Sugar-Free Challenge', emoji: '🍎', desc: '7-day whole-foods detox plan.' },
  { id: 3, title: 'High Protein Essentials', emoji: '💪', desc: 'Muscle recovery nutrition plan.' },
];

const StatusBadge = ({ status }) => {
  const isConfirmed = status === 'UPCOMING';
  const label = isConfirmed ? 'Confirmed' : (status === 'COMPLETED' ? 'Completed' : 'Cancelled');
  
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      background: isConfirmed ? '#dcfce7' : '#f1f5f9',
      color: isConfirmed ? '#065f46' : '#64748b',
      padding: '4px 12px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: '800'
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isConfirmed ? '#065f46' : '#94a3b8', display: 'inline-block' }} />
      {label}
    </span>
  );
};

export default function MyPatients() {
  const [tick, setTick] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null); // appointment id with open menu
  const [sendPlanModal, setSendPlanModal] = useState(null); // User info for plan
  const [sendingPlan, setSendingPlan] = useState(false);
  const [sentConfirm, setSentConfirm] = useState('');
  const [profileModal, setProfileModal] = useState(null); // Appt/User detail
  const [questionnaireModal, setQuestionnaireModal] = useState(null); // Appt object
  const [progressModal, setProgressModal] = useState(null); // Appt object

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAppointments();

    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 30000); 
    return () => clearInterval(interval);
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('nutritionist/patients/');
      setAppointments(res.data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkCompleted = async (apptId) => {
    try {
      await api.post(`appointments/${apptId}/complete/`);
      await fetchAppointments();
      setActiveMenu(null);
    } catch (err) {
      console.error('Failed to mark appointment as completed:', err);
      alert('Could not mark as completed. Please try again.');
    }
  };

  const handleSendPlan = async (appt, plan) => {
    setSendingPlan(true);
    try {
      await api.post('nutritionist/send-plan/', {
        patient_id: appt.patient, // from serializer
        plan_title: plan.title,
      });
      setSentConfirm(`✅ "${plan.title}" sent to ${appt.patient_name}!`);
      setTimeout(() => {
        setSendPlanModal(null);
        setSentConfirm('');
      }, 2500);
    } catch (err) {
      setSentConfirm('❌ Failed to send. Please try again.');
    } finally {
      setSendingPlan(false);
    }
  };

  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date();
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
    const diff = (apptTime - now) / 60000;
    return diff <= 15 && diff > -60;
  };

  const isPassed = (dateStr, timeStr) => {
    if (!isToday(dateStr)) return false;
    const now = new Date();
    const [hrs, mins] = timeStr.split(':').map(Number);
    const apptTime = new Date();
    apptTime.setHours(hrs, mins, 0);
    const diff = (now - apptTime) / 60000;
    return diff > 45;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />

      {/* Send Plan Modal */}
      {sendPlanModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ background: 'white', borderRadius: '28px', padding: '3rem', maxWidth: '520px', width: '100%', boxShadow: '0 40px 80px rgba(0,0,0,0.3)', position: 'relative' }}>
            <button onClick={() => { setSendPlanModal(null); setSentConfirm(''); }} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <X size={22} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send size={22} color="#065f46" />
              </div>
              <div>
                <h2 style={{ color: '#021B27', fontSize: '1.5rem', margin: 0 }}>Send Nutrition Plan</h2>
                <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>To: <strong>{sendPlanModal.patient_name}</strong></p>
              </div>
            </div>

            {sentConfirm ? (
              <div style={{ textAlign: 'center', padding: '2rem', background: '#f0fdf4', borderRadius: '16px', color: '#15803d', fontWeight: '700', fontSize: '1.05rem' }}>
                {sentConfirm}
              </div>
            ) : (
              <>
                <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Select a standard plan to send, or create a custom one:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.5rem' }}>
                  {STANDARD_PLANS.map(plan => (
                    <button
                      key={plan.id}
                      onClick={() => handleSendPlan(sendPlanModal, plan)}
                      disabled={sendingPlan}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '16px', padding: '1.2rem 1.5rem',
                        background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '16px',
                        cursor: sendingPlan ? 'not-allowed' : 'pointer', textAlign: 'left', transition: 'all 0.2s ease',
                        width: '100%'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#065f46'; e.currentTarget.style.background = '#f0fdf4'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
                    >
                      <span style={{ fontSize: '1.8rem' }}>{plan.emoji}</span>
                      <div>
                        <div style={{ fontWeight: '700', color: '#021B27', fontSize: '0.95rem' }}>{plan.title}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{plan.desc}</div>
                      </div>
                      <ArrowRight size={16} color="#065f46" style={{ marginLeft: 'auto', flexShrink: 0 }} />
                    </button>
                  ))}
                </div>
                <button
                  style={{ width: '100%', padding: '1rem', background: '#021B27', color: 'white', borderRadius: '12px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  onClick={() => setSendPlanModal(null)}
                >
                  <FileText size={16} /> Create Custom Plan (Coming Soon)
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* View Intake Form Modal */}
      {questionnaireModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ background: 'white', borderRadius: '28px', padding: '3rem', maxWidth: '600px', width: '100%', boxShadow: '0 40px 80px rgba(0,0,0,0.3)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setQuestionnaireModal(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <X size={22} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ClipboardList size={22} color="#065f46" />
              </div>
              <div>
                <h2 style={{ color: '#021B27', fontSize: '1.5rem', margin: 0 }}>Medical Intake Form</h2>
                <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>Patient: <strong>{questionnaireModal.patient_name}</strong></p>
              </div>
            </div>

            {(questionnaireModal.patient_health_issues || questionnaireModal.patient_primary_goal || questionnaireModal.patient_allergies_meds || questionnaireModal.patient_lifestyle) ? (
              <div style={{ display: 'grid', gap: '24px' }}>
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ color: '#065f46', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={18} /> Health Issues</h4>
                  <p style={{ color: '#021B27', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>{questionnaireModal.patient_health_issues || 'Not provided'}</p>
                </div>

                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ color: '#065f46', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}><Target size={18} /> Primary Goal</h4>
                  <span style={{ 
                    background: '#065f46', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold'
                  }}>
                    {questionnaireModal.patient_primary_goal ? questionnaireModal.patient_primary_goal.replace('_', ' ') : 'Not provided'}
                  </span>
                </div>

                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ color: '#065f46', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldAlert size={18} /> Allergies & Medications</h4>
                  <p style={{ color: '#021B27', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>{questionnaireModal.patient_allergies_meds || 'Not provided'}</p>
                </div>

                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ color: '#065f46', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={18} /> Lifestyle Activity</h4>
                  <span style={{ 
                    background: '#e2e8f0', color: '#021B27', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold'
                  }}>
                    {questionnaireModal.patient_lifestyle ? questionnaireModal.patient_lifestyle.replace('_', ' ') : 'Not provided'}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                 <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: '600' }}>Form not completed by patient.</p>
                 <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>This might be an older record or the patient skipped the step.</p>
              </div>
            )}
            
            <button 
              onClick={() => setQuestionnaireModal(null)}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: '#021B27', color: 'white', fontWeight: '700', cursor: 'pointer', marginTop: '32px' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* View Health Profile Modal */}
      {profileModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ background: 'white', borderRadius: '28px', padding: '3rem', maxWidth: '480px', width: '100%', boxShadow: '0 40px 80px rgba(0,0,0,0.3)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setProfileModal(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <X size={22} />
            </button>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f0fdf4', border: '3px solid #065f46', overflow: 'hidden', margin: '0 auto 1rem' }}>
                {profileModal.patient_image
                  ? <img src={profileModal.patient_image} alt={profileModal.patient_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={32} color="#065f46" /></div>
                }
              </div>
              <h2 style={{ color: '#021B27', margin: '0 0 4px' }}>{profileModal.patient_name}</h2>
              <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>{profileModal.patient_email}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Consultation Date', val: profileModal.date },
                { label: 'Time Slot', val: profileModal.time },
                { label: 'Service Plan', val: profileModal.plan_name },
                { label: 'Link', val: profileModal.zoom_link },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', borderRadius: '12px', fontSize: '0.9rem' }}>
                  <span style={{ color: '#64748b', fontWeight: '600' }}>{item.label}</span>
                  <span style={{ color: '#021B27', fontWeight: '800', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.val}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '2rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ color: '#021B27', fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="#065f46" /> Patient Health Info
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: '#64748b' }}>
                <div><strong style={{ color: '#021B27' }}>Health Issues:</strong> {profileModal.patient_health_issues || 'N/A'}</div>
                <div><strong style={{ color: '#021B27' }}>Primary Goal:</strong> <span style={{ textTransform: 'capitalize' }}>{profileModal.patient_primary_goal?.replace('_', ' ').toLowerCase() || 'N/A'}</span></div>
                <div><strong style={{ color: '#021B27' }}>Allergies & Meds:</strong> {profileModal.patient_allergies_meds || 'N/A'}</div>
                <div><strong style={{ color: '#021B27' }}>Lifestyle:</strong> <span style={{ textTransform: 'capitalize' }}>{profileModal.patient_lifestyle?.replace('_', ' ').toLowerCase() || 'N/A'}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Progress Modal */}
      {progressModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ background: 'white', borderRadius: '28px', padding: '3rem', maxWidth: '800px', width: '100%', boxShadow: '0 40px 80px rgba(0,0,0,0.3)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setProgressModal(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <X size={22} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LineChart size={22} color="#065f46" />
              </div>
              <div>
                <h2 style={{ color: '#021B27', fontSize: '1.5rem', margin: 0 }}>Program Progress</h2>
                <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>Patient: <strong>{progressModal.patient_name}</strong></p>
              </div>
            </div>
            
            <ProgressTracker readOnly={true} patientId={progressModal.patient} />
          </div>
        </div>
      )}

      <div style={{ paddingTop: '120px', maxWidth: '1100px', margin: '0 auto', padding: '120px 2rem 4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#021B27', color: 'white', padding: '6px 16px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1.5px', marginBottom: '1rem' }}>
              <Users size={14} /> CONSULTATION SESSIONS
            </div>
            <h1 style={{ color: '#021B27', fontSize: 'clamp(2rem, 4vw, 3rem)', fontFamily: 'var(--font-heading)', margin: 0 }}>Appointment History</h1>
            <p style={{ color: '#64748b', marginTop: '8px', fontSize: '1rem' }}>
              Review all patient bookings and health intake forms securely.
            </p>
          </div>
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#021B27' }}>{appointments.length}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Total Slots</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'visible', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', gap: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
            <span>Patient</span>
            <span>Consultation Time</span>
            <span>Status</span>
            <span style={{ textAlign: 'right' }}>Actions</span>
          </div>

          {isLoading ? (
            <div style={{ padding: '5rem', textAlign: 'center', color: '#94a3b8' }}>
              <Users size={48} style={{ opacity: 0.2, marginBottom: '1rem', display: 'block', margin: '0 auto 1rem' }} />
              <p>Fetching session data...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div style={{ padding: '5rem', textAlign: 'center', color: '#94a3b8' }}>
              <Users size={48} style={{ opacity: 0.2, marginBottom: '1rem', display: 'block', margin: '0 auto 1rem' }} />
              <p style={{ fontSize: '1rem', margin: 0 }}>No bookings found. Ensure your availability is configured.</p>
            </div>
          ) : (
            appointments.map((appt, index) => (
              <div
                key={appt.id}
                style={{
                  display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', gap: '1rem',
                  padding: '1.25rem 2rem', alignItems: 'center',
                  borderBottom: index < appointments.length - 1 ? '1px solid #f1f5f9' : 'none',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#f0fdf4', border: '2px solid #e2e8f0', overflow: 'hidden', flexShrink: 0 }}>
                    {appt.patient_image
                      ? <img src={appt.patient_image} alt={appt.patient_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={20} color="#065f46" /></div>
                    }
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', color: '#021B27', fontSize: '0.95rem' }}>{appt.patient_name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{appt.patient_email}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.9rem' }}>
                    <Clock size={14} color="#94a3b8" />
                    {appt.date} · {appt.time}
                  </div>
                  {!isPassed(appt.date, appt.time) ? (
                    isToday(appt.date) && appt.zoom_link && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {isStartingSoon(appt.date, appt.time) && (
                          <div style={{ 
                            fontSize: '0.65rem', color: '#854d0e', fontWeight: '800', 
                            background: '#fef3c7', padding: '4px 10px', borderRadius: '6px', 
                            border: '1px solid #fde68a', animation: 'pulse 2s infinite',
                            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
                          }}>
                            ⚠️ Starting Soon: Join session now!
                          </div>
                        )}
                        <button 
                          onClick={() => window.open(appt.zoom_link, '_blank')}
                          style={{ 
                            padding: '6px 12px', borderRadius: '8px', background: '#22c55e', 
                            color: 'white', border: 'none', fontSize: '0.75rem', fontWeight: '800', 
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', 
                            boxShadow: '0 4px 6px rgba(34, 197, 94, 0.2)', width: 'fit-content'
                          }}
                        >
                          <Video size={14} /> Start Zoom Session 🎥
                        </button>
                      </div>
                    )
                  ) : (
                        <button 
                          onClick={() => navigate(`/dashboard/messages?partner=${appt.patient}&name=${encodeURIComponent(appt.patient_name)}`)}
                          style={{ padding: '8px 14px', borderRadius: '8px', background: '#021B27', color: 'white', border: 'none', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(2, 27, 39, 0.1)' }}
                        >
                          Send Diet Plan / Chat
                        </button>
                  )}
                </div>

                <StatusBadge status={appt.status} />

                <div style={{ position: 'relative', textAlign: 'right' }}>
                  <button
                    onClick={() => setActiveMenu(activeMenu === appt.id ? null : appt.id)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', color: '#021B27' }}
                  >
                    Actions <ChevronDown size={14} />
                  </button>

                  {activeMenu === appt.id && (
                    <>
                      <div onClick={() => setActiveMenu(null)} style={{ position: 'fixed', inset: 0, zIndex: 50 }} />
                      <div style={{ position: 'absolute', right: 0, top: '44px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 16px 40px rgba(0,0,0,0.12)', padding: '8px', zIndex: 100, minWidth: '200px' }}>
                        <button
                          onClick={() => { setQuestionnaireModal(appt); setActiveMenu(null); }}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#065f46', fontWeight: '700', fontSize: '0.9rem', textAlign: 'left' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                          <ClipboardList size={16} color="#065f46" /> View Intake Form
                        </button>
                        <button
                          onClick={() => { setProgressModal(appt); setActiveMenu(null); }}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#021B27', fontWeight: '600', fontSize: '0.9rem', textAlign: 'left' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                          <LineChart size={16} color="#3b82f6" /> View Progress
                        </button>
                        <button
                          onClick={() => { setProfileModal(appt); setActiveMenu(null); }}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#021B27', fontWeight: '600', fontSize: '0.9rem', textAlign: 'left' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                          <User size={16} color="#64748b" /> View Details
                        </button>
                        <button
                          onClick={() => { setSendPlanModal(appt); setActiveMenu(null); }}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#021B27', fontWeight: '600', fontSize: '0.9rem', textAlign: 'left' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                          <Send size={16} color="#88B699" /> Send Nutrition Plan
                        </button>
                        {appt.status === 'UPCOMING' && (
                          <>
                            <hr style={{ margin: '6px 0', border: 'none', borderTop: '1px solid #f1f5f9' }} />
                            <button
                              onClick={() => handleMarkCompleted(appt.id)}
                              style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#065f46', fontWeight: '700', fontSize: '0.9rem', textAlign: 'left' }}
                              onMouseEnter={e => e.currentTarget.style.background = '#dcfce7'}
                              onMouseLeave={e => e.currentTarget.style.background = 'none'}
                            >
                              <CheckCircle size={16} color="#22c55e" /> Mark Consultation as Completed
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
