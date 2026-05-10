import React from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';

const WhatsAppIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#25D366">
    <path d="M12.031 0C5.398 0 0 5.398 0 12.031c0 2.124.553 4.195 1.604 6.01L.06 24l6.108-1.543a11.96 11.96 0 0 0 5.863 1.534h.005c6.632 0 12.031-5.398 12.031-12.031S18.663 0 12.031 0zm0 19.992c-1.792 0-3.55-.48-5.09-1.39l-3.655.923.978-3.563-.095-.149A9.998 9.998 0 0 1 2.031 12.03c0-5.518 4.49-10.009 10.005-10.009s10.004 4.491 10.004 10.009-4.49 10.009-10.009 10.009zm5.556-7.564c-.304-.152-1.802-.89-2.081-.992-.278-.101-.482-.152-.684.152-.203.304-.786.992-.964 1.196-.177.203-.355.228-.659.076-1.52-.76-2.585-1.444-3.57-2.61-.253-.304-.051-.557.177-.81.127-.126.279-.329.431-.482.152-.151.203-.252.304-.43.102-.177.051-.329-.025-.481-.076-.152-.684-1.647-.938-2.254-.253-.583-.507-.507-.684-.507-.178 0-.381-.026-.583-.026-.203 0-.532.076-.811.38-.279.304-1.064 1.039-1.064 2.533 0 1.495 1.09 2.94 1.242 3.142.152.203 2.154 3.295 5.22 4.56.735.304 1.318.482 1.774.608.735.228 1.419.203 1.951.127.583-.076 1.8-.735 2.053-1.444.253-.71.253-1.318.177-1.444-.076-.127-.279-.203-.583-.355z" />
  </svg>
);

export const PLANS = {
  quick_start: {
    id: 'quick_start',
    name: 'Essential Kickstart',
    price: '$19',
    durationDays: 5,
    consultations: 2,
    tagline: 'Perfect for a quick reset & starting your health journey.',
    iconCircleColor: '#b4c4ce',
    iconSVG: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
        <path d="M10 2c1 .5 2 2 2 5" />
      </svg>
    ),
    features: [
      { text: '5 days duration', type: 'check' },
      { text: '2 zoom call consultations', type: 'check' },
      { text: 'Weekly follow-up 5 times\n(Sunday - Thursday)', type: 'wa' }
    ]
  },
  one_month: {
    id: 'one_month',
    name: 'Advanced Progress',
    price: '$30',
    durationDays: 15,
    consultations: 6,
    tagline: 'Most popular choice for building consistency & visible results.',
    iconCircleColor: '#b7d4bb',
    iconSVG: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.27 21.7s9.87-3.5 12.73-6.36a4.5 4.5 0 0 0-6.36-6.37C5.77 11.84 2.27 21.7 2.27 21.7z" />
        <path d="M8.64 14l-2.05-2.04M15.34 15.34l-2.05-2.05" />
        <path d="M22 9s-1.33-2-3.5-2C16.86 7 15 9 15 9s1.33 2 3.5 2S22 9 22 9z" />
        <path d="M15 2s-2 1.33-2 3.5S15 9 15 9s2-1.33 2-3.5S15 2 15 2z" />
      </svg>
    ),
    features: [
      { text: '15 days duration', type: 'check' },
      { text: '6 zoom call consultations', type: 'check' },
      { text: 'Weekly follow-up 5 times\n(Sunday - Thursday)', type: 'wa' }
    ]
  },
  golden: {
    id: 'golden',
    name: 'Ultimate Transformation',
    price: '$49',
    durationDays: 30,
    consultations: 10,
    tagline: 'Structure, accountability, & lifestyle transformation.',
    iconCircleColor: '#e0c779',
    iconSVG: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
    features: [
      { text: '30 days duration', type: 'check' },
      { text: '10 zoom call consultations', type: 'check' },
      { text: 'Weekly follow-up 6 times\n(every day except Friday)', type: 'wa' }
    ]
  }
};

export default function Plans() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', paddingTop: '100px', paddingBottom: '4rem' }}>
        <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ color: '#1a202c', fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px' }}>
              Choose Your Health Plan
            </h1>
            <p style={{ fontSize: '1.2rem', color: '#64748b', marginBottom: '1rem' }}>
              Select the right scientific plan for your specialized journey.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {Object.values(PLANS).map((plan) => (
              <article
                key={plan.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '24px',
                  padding: '3rem 2.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid #f1f5f9',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                  transition: 'transform 0.3s ease'
                }}
              >
                <h2 style={{ fontSize: '1.5rem', textAlign: 'center', fontWeight: '800', marginBottom: '2.5rem', color: '#1a202c' }}>
                  {plan.name}
                </h2>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#f0fdf4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {plan.iconSVG}
                  </div>
                  <span style={{ fontSize: '3rem', color: '#1a202c', fontWeight: '800' }}>{plan.price}</span>
                </div>

                <p style={{ color: '#64748b', fontSize: '0.95rem', textAlign: 'center', lineHeight: '1.6', marginBottom: '2.5rem', minHeight: '50px' }}>
                  {plan.tagline}
                </p>

                <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', marginBottom: '2.5rem' }} />

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 3rem 0', flexGrow: 1 }}>
                  {plan.features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                      <Check size={22} color="#85B599" strokeWidth={3} style={{ flexShrink: 0 }} />
                      <span style={{ color: '#1a202c', fontSize: '1rem', lineHeight: '1.4' }}>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => navigate('/appointments', { state: { planId: plan.id, plan_name: plan.name } })}
                  style={{
                    width: '100%',
                    padding: '1.2rem',
                    fontSize: '1.1rem',
                    fontWeight: '800',
                    borderRadius: '16px',
                    backgroundColor: '#1a202c',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                >
                  Choose {plan.name} →
                </button>
              </article>
            ))}
          </div>

        </div>
      </main>
    </>
  );
}
