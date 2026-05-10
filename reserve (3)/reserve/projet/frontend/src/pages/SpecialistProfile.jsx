import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Star, Award, Video, ChevronLeft, ChevronRight, Info, Lock } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../api';

const StepIndicator = ({ currentStep }) => {
  const steps = [
    { id: 1, label: 'Select Date' },
    { id: 2, label: 'Payment' }
  ];

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
      {steps.map((step, idx) => (
        <React.Fragment key={step.id}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontWeight: 'bold',
              background: step.id === currentStep ? '#065f46' : (step.id < currentStep ? '#065f46' : '#e2e8f0'),
              color: step.id <= currentStep ? 'white' : '#64748b',
              border: '2px solid ' + (step.id <= currentStep ? '#065f46' : '#e2e8f0'),
              transition: 'all 0.3s'
            }}>
              {step.id < currentStep ? '✓' : step.id}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: step.id === currentStep ? 'bold' : 'normal', color: step.id === currentStep ? '#065f46' : '#64748b' }}>
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div style={{ width: '60px', height: '2px', background: step.id < currentStep ? '#065f46' : '#e2e8f0', marginTop: '-20px' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const planId = location.state?.planId || 'essential';

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [specialist, setSpecialist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpecialist = async () => {
      try {
        const res = await api.get(`specialists/${id}/`);
        setSpecialist(res.data);
      } catch (err) {
        console.error("Error fetching specialist:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSpecialist();
  }, [id]);

  const handleSlotSelect = (day, time) => {
    setSelectedSlot({ day, time });
  };

  const getNext7Days = () => {
    const days = [];
    const date = new Date();
    for (let i = 0; i < 7; i++) {
       const nextDate = new Date(date);
       nextDate.setDate(date.getDate() + i);
       const dayOfWeekName = nextDate.toLocaleDateString('en-US', { weekday: 'long' });
       const dayString = nextDate.toLocaleDateString('en-US', { weekday: 'short' }) + ' ' + String(nextDate.getDate()).padStart(2, '0') + '.' + String(nextDate.getMonth()+1).padStart(2, '0');
       days.push({ dayOfWeekName, dayString });
    }
    return days;
  };

  const availableDays = specialist && specialist.availabilities ? getNext7Days().map((d, index) => {
      const avail = specialist.availabilities.find(a => a.day_of_week === d.dayOfWeekName && a.is_active);
      if (!avail) return null;
      
      const startHour = parseInt(avail.start_time.split(':')[0], 10);
      const endHour = parseInt(avail.end_time.split(':')[0], 10);
      const slots = [];
      for (let h = startHour; h < endHour; h++) {
          slots.push(`${h}:00`);
          slots.push(`${h}:30`);
      }

      // Filter out past slots if the day is today
      const isToday = index === 0;
      let filteredSlots = slots;
      
      if (isToday) {
          const now = new Date();
          filteredSlots = slots.filter(slot => {
              const [hour, minute] = slot.split(':').map(Number);
              const slotTime = new Date();
              slotTime.setHours(hour, minute, 0, 0);
              return slotTime > now;
          });
      }

      if (filteredSlots.length === 0) return null;

      return { dayString: d.dayString, slots: filteredSlots };
  }).filter(Boolean) : [];

  // Checkout functionality moved to BookingSummary.jsx

  return (
    <>
      <Navbar />
      <main>
        <section className="section" style={{ paddingTop: '120px', backgroundColor: 'var(--theme-bg)', minHeight: '100vh' }}>
          <div className="container p-0" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
            <button 
              className="btn-outline" 
              style={{ border: 'none', marginBottom: '2rem', color: 'var(--theme-text-muted)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }} 
              onClick={() => navigate('/appointments')}
            >
              <ChevronLeft size={18} /> Back to practitioners
            </button>

            {loading ? (
               <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--theme-text)' }}>Loading profile...</div>
            ) : !specialist ? (
               <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--theme-text)' }}>Specialist not found.</div>
            ) : (
            <div className="flow-container">
              
              {/* STEP 1: Profile & Selection */}
              <div id="view-profile" className="animate-fade">
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 400px', gap: '2rem', alignItems: 'start' }} className="profile-split">
                    
                    {/* Left: Bio & Details */}
                    <div>
                      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '2rem' }}>
                        <div style={{ 
                          width: '150px', 
                          height: '150px', 
                          borderRadius: '50%', 
                          backgroundImage: `url(${specialist.image || '/default-avatar.png'})`, 
                          backgroundSize: 'cover', 
                          border: '4px solid #85B599', 
                          boxShadow: 'var(--shadow-lg)' 
                        }}></div>
                        <div>
                          <h1 style={{ color: 'var(--color-primary)', fontSize: '2rem', marginBottom: '5px' }}>{specialist.full_name}</h1>
                          <p style={{ color: '#85B599', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '10px' }}>{specialist.specialty_type}</p>
                          <div style={{ display: 'inline-block', background: 'rgba(133,181,153,0.15)', border: '1px solid rgba(133,181,153,0.3)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--theme-text)', marginBottom: '15px', textTransform: 'capitalize' }}>
                            ⭐ {specialist.tier || 'Basic'} Tier
                          </div>
                          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ background: 'var(--theme-card-bg)', color: 'var(--color-primary)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid var(--theme-card-border)' }}><Star size={14} fill="#f59e0b" color="#f59e0b" /> {specialist.rating} ({specialist.num_reviews} avis)</span>
                            <span style={{ color: 'var(--theme-text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Award size={16} /> Verified Specialist</span>
                          </div>
                        </div>
                      </div>

                      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: 'var(--radius-md)', background: 'var(--theme-card-bg)', border: '1px solid var(--theme-card-border)' }}>
                        <h3 style={{ color: 'var(--color-primary)', marginBottom: '1rem', fontSize: '1.3rem' }}>About</h3>
                        <p style={{ color: 'var(--theme-text)', lineHeight: '1.7', marginBottom: '1.5rem' }}>{specialist.bio || "No bio available."}</p>
                        
                        <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.8rem', fontSize: '1.1rem' }}>Expertise & Qualifications</h4>
                        <ul style={{ color: 'var(--theme-text-muted)', paddingLeft: '20px', lineHeight: '1.6', fontSize: '0.95rem' }}>
                          <li>Certified {specialist.specialty_type}</li>
                          <li>Advanced Healthcare Professional</li>
                          <li>Personalized Support Specialist</li>
                        </ul>
                      </div>

                      {/* Avis */}
                      <h3 style={{ color: 'var(--color-primary)', marginBottom: '1rem', fontSize: '1.3rem' }}>Recent Reviews</h3>
                      <div style={{ background: 'var(--theme-input-bg)', borderLeft: '3px solid #85B599', padding: '1.2rem', marginBottom: '1rem', borderRadius: '0 8px 8px 0' }}>
                        <div style={{ display: 'flex', gap: '4px', color: '#f59e0b', fontSize: '0.8rem', marginBottom: '8px' }}><Star size={12} fill="#f59e0b" /><Star size={12} fill="#f59e0b" /><Star size={12} fill="#f59e0b" /><Star size={12} fill="#f59e0b" /><Star size={12} fill="#f59e0b" /></div>
                        <p style={{ fontSize: '0.95rem', fontStyle: 'italic', color: 'var(--theme-text)', marginBottom: '5px' }}>"Very attentive and professional. The personalized approach really helped me achieve my goals."</p>
                        <span style={{ fontSize: '0.8rem', color: 'var(--theme-text-muted)' }}>- Verified Client</span>
                      </div>
                    </div>

                    {/* Right: Booking Widget */}
                    <div>
                      <div className="cal-widget glass-card" style={{ padding: '2rem', background: 'var(--theme-card-bg)', border: '1px solid var(--theme-card-border)', borderRadius: 'var(--radius-lg)', position: 'sticky', top: '100px' }}>
                        <h3 style={{ color: 'var(--color-primary)', marginBottom: '15px', fontSize: '1.3rem' }}>Book an Appointment</h3>
                        
                        <div style={{ background: 'rgba(45, 140, 255, 0.1)', border: '1px solid #2D8CFF', borderRadius: '8px', padding: '15px', marginBottom: '20px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                            <div style={{ background: '#2D8CFF', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Video size={20} /></div>
                            <div>
                              <h4 style={{ color: 'var(--color-primary)', fontSize: '1rem', marginBottom: '3px' }}>Video consultation via Zoom</h4>
                              <p style={{ color: 'var(--theme-text-muted)', fontSize: '0.85rem' }}>Duration: 30 min</p>
                            </div>
                          </div>
                        </div>

                        <div style={{ marginTop: '15px', border: '1px solid var(--theme-card-border)', borderRadius: 'var(--radius-md)', padding: '1rem', background: 'var(--theme-input-bg)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                            <button style={{ background: 'none', border: 'none', color: '#85B599', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><ChevronLeft size={16} /> Prev</button>
                            <span>April 2026</span>
                            <button style={{ background: 'none', border: 'none', color: '#85B599', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>Next <ChevronRight size={16} /></button>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
                            
                            {/* Slots Logic Mapping */}
                            {availableDays.length > 0 ? availableDays.map((dayObj) => (
                              <div key={dayObj.dayString} style={{ display: 'flex', gap: '8px', alignItems: 'center', minWidth: 'max-content' }}>
                                <div style={{ width: '90px', fontWeight: 'bold', color: 'var(--theme-text)', fontSize: '0.9rem', flexShrink: 0 }}>{dayObj.dayString}</div>
                                {dayObj.slots.map((time, slotIdx) => {
                                  const isSelected = selectedSlot?.day === dayObj.dayString && selectedSlot?.time === time;
                                  
                                  const isBooked = specialist.booked_slots && specialist.booked_slots.find(ap => ap.date === dayObj.dayString && ap.time === time);
                                  
                                  return (
                                    <div 
                                      key={slotIdx}
                                      onClick={() => { if(!isBooked) handleSlotSelect(dayObj.dayString, time) }}
                                      style={{ 
                                        padding: '8px 0', width: '70px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', textAlign: 'center', transition: 'all 0.2s',
                                        background: isBooked ? '#e2e8f0' : (isSelected ? '#2D8CFF' : '#85B599'),
                                        color: isBooked ? '#94a3b8' : 'white',
                                        border: isBooked ? '1px solid #cbd5e1' : (isSelected ? '1px solid #2D8CFF' : '1px solid rgba(255,255,255,0.1)'),
                                        transform: isSelected && !isBooked ? 'scale(1.05)' : 'none',
                                        boxShadow: isSelected && !isBooked ? '0 0 15px rgba(45, 140, 255, 0.4)' : (isBooked ? 'none' : 'var(--shadow-sm)'),
                                        cursor: isBooked ? 'not-allowed' : 'pointer',
                                        opacity: isBooked ? 0.6 : 1
                                      }}
                                    >
                                      {time}
                                    </div>
                                  )
                                })}
                              </div>
                            )) : (
                               <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--theme-text-muted)' }}>This specialist has no availabilities for the next 7 days.</div>
                            )}
                          </div>
                        </div>

                        {selectedSlot && (
                          <div className="animate-fade" style={{ marginTop: '15px', padding: '12px', background: 'rgba(45, 140, 255, 0.1)', borderLeft: '4px solid #2D8CFF', color: 'var(--theme-text)', fontSize: '0.95rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Info size={16} color="#2D8CFF" />
                            <span>You selected <strong style={{ color: '#2D8CFF' }}>{selectedSlot.day}</strong> at <strong style={{ color: '#2D8CFF' }}>{selectedSlot.time}</strong></span>
                          </div>
                        )}

                        <StepIndicator currentStep={1} />

                        <button 
                          disabled={!selectedSlot} 
                          onClick={() => navigate('/booking-summary', { state: { specialist, selectedSlot, planId } })}
                          className="btn-primary" 
                          style={{ 
                            width: '100%', padding: '1.2rem', marginTop: '1.5rem', borderRadius: '30px', fontWeight: 'bold', 
                            background: selectedSlot ? '#065f46' : 'var(--theme-card-border)', 
                            color: selectedSlot ? 'white' : 'var(--theme-text-muted)',
                            opacity: selectedSlot ? 1 : 0.5, cursor: selectedSlot ? 'pointer' : 'not-allowed', border: 'none',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                          }}
                        >
                          Proceed to Payment <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

            </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
