import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { UserPlus, CalendarCheck, CreditCard, Video, ArrowRight, Star, Settings2, Loader2, CheckCircle2, Check } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import { PLANS } from './Plans';

const WhatsAppIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#25D366">
    <path d="M12.031 0C5.398 0 0 5.398 0 12.031c0 2.124.553 4.195 1.604 6.01L.06 24l6.108-1.543a11.96 11.96 0 0 0 5.863 1.534h.005c6.632 0 12.031-5.398 12.031-12.031S18.663 0 12.031 0zm0 19.992c-1.792 0-3.55-.48-5.09-1.39l-3.655.923.978-3.563-.095-.149A9.998 9.998 0 0 1 2.031 12.03c0-5.518 4.49-10.009 10.005-10.009s10.004 4.491 10.004 10.009-4.49 10.009-10.009 10.009zm5.556-7.564c-.304-.152-1.802-.89-2.081-.992-.278-.101-.482-.152-.684.152-.203.304-.786.992-.964 1.196-.177.203-.355.228-.659.076-1.52-.76-2.585-1.444-3.57-2.61-.253-.304-.051-.557.177-.81.127-.126.279-.329.431-.482.152-.151.203-.252.304-.43.102-.177.051-.329-.025-.481-.076-.152-.684-1.647-.938-2.254-.253-.583-.507-.507-.684-.507-.178 0-.381-.026-.583-.026-.203 0-.532.076-.811.38-.279.304-1.064 1.039-1.064 2.533 0 1.495 1.09 2.94 1.242 3.142.152.203 2.154 3.295 5.22 4.56.735.304 1.318.482 1.774.608.735.228 1.419.203 1.951.127.583-.076 1.8-.735 2.053-1.444.253-.71.253-1.318.177-1.444-.076-.127-.279-.203-.583-.355z" />
  </svg>
);

export default function Appointments() {
  const navigate = useNavigate();
  const location = useLocation();

  const [planId, setPlanId] = useState(() => {
    const fromStorage = localStorage.getItem('pendingPlan');
    if (fromStorage) {
      localStorage.removeItem('pendingPlan'); // Clear it once we start the booking
      return fromStorage;
    }
    return location.state?.planId || null;
  });
  const selectedPlan = planId ? PLANS[planId] : null;

  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const fetchSpecialists = async () => {
      setLoading(true);
      try {
        const res = await api.get('specialists/');
        setSpecialists(res.data);
      } catch (err) {
        console.error("Error fetching specialists:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSpecialists();
  }, [planId]);

  const filteredSpecialists = specialists.filter(s => {
    if (activeFilter === 'All') return true;
    return s.specialty_type?.toLowerCase().includes(activeFilter.toLowerCase());
  });

  const getFilterStyle = (filter) => ({
    background: activeFilter === filter ? '#85B599' : 'transparent',
    border: '1px solid ' + (activeFilter === filter ? '#85B599' : 'var(--theme-card-border)'),
    padding: '8px 20px',
    borderRadius: '20px',
    color: activeFilter === filter ? 'white' : 'var(--theme-text)',
    cursor: 'pointer',
    fontWeight: activeFilter === filter ? 'bold' : 'normal',
    transition: 'all 0.2s ease'
  });

  const getBadgeForTier = (tier) => {
    switch ((tier || '').toLowerCase()) {
      case 'premium':
        return { label: 'Expert Specialist', bg: '#fdfaf2', border: '#e0c779', color: '#a68516' }; // Gold
      case 'standard':
        return { label: 'Certified Specialist', bg: '#f4f6f8', border: '#b7c7d4', color: '#5b7182' }; // Silver
      case 'basic':
      default:
        return { label: 'Junior Specialist', bg: '#fcf8f6', border: '#d4a392', color: '#a66a53' }; // Bronze
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          fill={i <= Math.round(rating) ? "#f59e0b" : "transparent"}
          color={i <= Math.round(rating) ? "#f59e0b" : "#ccc"}
          size={14}
        />
      );
    }
    return stars;
  };

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', paddingTop: '100px', paddingBottom: '4rem' }}>
        <section className="section" style={{ minHeight: '100vh' }}>
          <div className="container animate-fade" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>

            <div className="section-header" style={{
              textAlign: 'center', marginBottom: '4rem', background: '#ffffff',
              padding: '3rem', borderRadius: '24px', border: '1px solid #f1f5f9',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}>
              <h1 className="section-title" style={{
                display: 'flex', justifyContent: 'center', marginBottom: '10px',
                fontSize: '2.5rem', color: '#1a202c', fontWeight: '800'
              }}>
                Complete Your Booking
              </h1>
              <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '3rem' }}>
                All consultations are held via <strong style={{ color: '#1a202c' }}>Zoom Call</strong> for your medical convenience.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', textAlign: 'center' }}>
                <StepCard num="1" active={!selectedPlan} icon={<UserPlus size={48} color={!selectedPlan ? "#72b88f" : "#b4c4ce"} />} title="Select your plan" />
                <StepCard num="2" active={selectedPlan !== null} icon={<CalendarCheck size={48} color={selectedPlan !== null ? "#72b88f" : "#b4c4ce"} />} title="Choose your specialist & time" />
                <StepCard num="3" active={false} icon={
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
                    <CreditCard size={38} color="#b4c4ce" />
                    <Video size={38} color="#b4c4ce" />
                  </div>
                } title="Secure Payment & Zoom Link" />
              </div>
            </div>

            {/* Step 1: PLAN INTEGRATION */}
            <h2 style={{
              fontSize: '1.75rem', color: '#1a202c', fontWeight: '800',
              marginBottom: '2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px'
            }}>
              Step 1: Plan Selection
            </h2>

            {selectedPlan ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  background: '#ffffff',
                  border: `1px solid #e2e8f0`,
                  borderRadius: '16px',
                  padding: '1.5rem 2rem',
                  marginBottom: '4rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  flexWrap: 'wrap'
                }}
              >
                <CheckCircle2 size={32} color="#85B599" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <span style={{ color: '#1a202c', fontWeight: '800', fontSize: '1.2rem', display: 'block', marginBottom: '4px' }}>
                    {selectedPlan.name} Selected ({selectedPlan.price})
                  </span>
                  <span style={{ color: '#64748b', fontSize: '1rem' }}>
                    Access unlocked. Proceed below to choose your specialist.
                  </span>
                </div>
                <button
                  onClick={() => setPlanId(null)}
                  style={{
                    background: '#f8fafc',
                    border: `1px solid #e2e8f0`,
                    color: '#1a202c',
                    padding: '10px 24px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                  }}
                >
                  Change Plan
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                {Object.values(PLANS).map((plan) => (
                  <article
                    key={plan.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '24px',
                      padding: '2.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      border: '1px solid #f1f5f9',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
                    }}
                  >
                    <h2 style={{ fontSize: '1.5rem', textAlign: 'center', fontWeight: '800', marginBottom: '2rem', color: '#1a202c' }}>
                      {plan.name}
                    </h2>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        backgroundColor: '#f0fdf4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {plan.iconSVG}
                      </div>
                      <span style={{ fontSize: '2.5rem', color: '#1a202c', fontWeight: '800' }}>{plan.price}</span>
                    </div>

                    <p style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', lineHeight: '1.5', marginBottom: '2rem', minHeight: '40px' }}>
                      {plan.tagline}
                    </p>

                    <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', marginBottom: '2rem' }} />

                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', flexGrow: 1 }}>
                      {plan.features.map((f, i) => (
                        <li key={i} style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
                          <Check size={20} color="#85B599" strokeWidth={3} />
                          <span style={{ color: '#1a202c', fontSize: '0.95rem', lineHeight: '1.4' }}>
                            {f.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => setPlanId(plan.id)}
                      style={{
                        width: '100%',
                        padding: '1.2rem',
                        fontSize: '1rem',
                        fontWeight: '800',
                        borderRadius: '16px',
                        backgroundColor: '#1a202c',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      Select Plan
                    </button>
                  </article>
                ))}
              </div>
            )}

            {/* Step 2: FILTERED SPECIALISTS */}
            <h2 style={{
              fontSize: '1.75rem', color: '#1a202c', fontWeight: '800',
              marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px'
            }}>
              Step 2: Choose Your Specialist
            </h2>

            {!selectedPlan ? (
              <div style={{ background: '#ffffff', padding: '3rem', textAlign: 'center', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', color: '#666', fontFamily: 'sans-serif' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', color: '#222' }}>A Plan is Required</h3>
                <p>Please select a plan from Step 1 above to view matching specialists.</p>
              </div>
            ) : (
              <>
                <div className="filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '2.5rem', alignItems: 'center', fontFamily: 'sans-serif' }}>
                  {['All', 'Nutritionist', 'Dietitian', 'Fitness Coach'].map(filter => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      style={getFilterStyle(filter)}
                    >
                      {filter}
                    </button>
                  ))}
                  <button style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#222', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                    <Settings2 size={16} /> More filters
                  </button>
                </div>

                {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
                    <Loader2 className="animate-spin" size={48} color="#222" />
                  </div>
                ) : (
                  <div className="doc-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem', fontFamily: 'sans-serif' }}>
                    {filteredSpecialists.length > 0 ? (
                      filteredSpecialists.map(specialist => (
                        <article
                          key={specialist.id}
                          className="doc-card animate-slide-up"
                          style={{ background: '#ffffff', borderRadius: '24px', padding: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'transform 0.3s ease', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          <div style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            backgroundImage: `url(${specialist.image || '/default-avatar.png'})`,
                            backgroundSize: 'cover',
                            border: '4px solid #72b88f',
                            marginBottom: '1.2rem',
                          }}></div>

                          <h3 style={{ fontSize: '1.4rem', color: '#222', fontWeight: 'bold', marginBottom: '5px' }}>{specialist.full_name}</h3>
                          <p style={{ color: '#666', fontSize: '0.95rem', fontWeight: '500', marginBottom: '10px' }}>{specialist.specialty_type || 'General Practitioner'}</p>

                          <div style={{
                            background: getBadgeForTier(specialist.tier).bg,
                            border: `1px solid ${getBadgeForTier(specialist.tier).border}`,
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            color: getBadgeForTier(specialist.tier).color,
                            marginBottom: '15px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            {getBadgeForTier(specialist.tier).label}
                          </div>

                          <div style={{ display: 'flex', gap: '5px', fontSize: '0.85rem', marginBottom: '2rem', alignItems: 'center' }}>
                            {renderStars(specialist.rating || 5)}
                            <span style={{ color: '#888', marginLeft: '5px' }}>({specialist.num_reviews || 0} avis)</span>
                          </div>

                          <button
                            onClick={() => navigate(`/specialist/${specialist.id}`, { state: { planId, plan_name: selectedPlan.name } })}
                            className="btn-primary"
                            style={{ width: '100%', borderRadius: '30px', fontWeight: 'bold', padding: '1rem', border: '1px solid #222', background: 'transparent', color: '#222', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s', marginTop: 'auto' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f4f4f4';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            Choose Time <ArrowRight size={18} />
                          </button>
                        </article>
                      ))
                    ) : (
                      <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', background: '#ffffff', borderRadius: '16px', color: '#666' }}>
                        <h3 style={{ color: '#222', marginBottom: '10px' }}>No specialists found</h3>
                        <p>No specialists are currently available for the {selectedPlan.name} tier. Please try another plan.</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

          </div>
        </section>
      </main>
    </>
  );
}

function StepCard({ num, icon, title, active }) {
  return (
    <div className="glass-card" style={{ padding: '2.5rem 1.5rem', borderRadius: '24px', position: 'relative', border: active ? '2px solid #72b88f' : '1px solid #eee', background: '#ffffff', boxShadow: active ? '0 10px 30px rgba(114, 184, 143, 0.15)' : 'none', opacity: active ? 1 : 0.6 }}>
      <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', width: '35px', height: '35px', background: active ? '#72b88f' : '#f4f4f4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: active ? '#fff' : '#666', fontSize: '1rem', fontWeight: 'bold' }}>{num}</div>
      <div style={{ marginBottom: '15px' }}>{icon}</div>
      <h4 style={{ color: '#222', fontSize: '1.1rem', fontWeight: '500', fontFamily: 'sans-serif' }}>{title}</h4>
    </div>
  );
}
