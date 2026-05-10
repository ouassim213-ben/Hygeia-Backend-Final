import React from 'react';
import Navbar from '../components/Navbar';
import { Check, Video, CalendarCheck, Download } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Success() {
  const navigate = useNavigate();
  const location = useLocation();
  const { specialistName, day, time } = location.state || {};

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '140px', backgroundColor: 'var(--theme-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <div className="container animate-fade" style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center', padding: '4rem 2rem', background: 'var(--theme-card-bg)', border: '1px solid var(--theme-card-border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)' }}>
          <div style={{ width: '100px', height: '100px', background: 'rgba(133,181,153,0.1)', borderRadius: '50%', border: '3px solid #85B599', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: '#85B599' }}>
            <Check size={48} />
          </div>
          
          <h1 style={{ color: 'var(--color-primary)', marginBottom: '1rem', fontSize: '2.2rem' }}>Appointment Confirmed!</h1>
          <p style={{ color: 'var(--theme-text)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
            Your payment has been successfully received. You are officially scheduled for your consultation
            {specialistName ? <span> with <strong style={{ color: '#85B599' }}>{specialistName}</strong></span> : ''}
            {day && time ? <span> on {day} at {time}</span> : ''}.
          </p>

          <div style={{ background: 'rgba(45, 140, 255, 0.1)', border: '2px solid #2D8CFF', borderRadius: 'var(--radius-md)', padding: '2rem', margin: '2rem 0' }}>
            <h3 style={{ color: '#2D8CFF', marginBottom: '15px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>Official Zoom Link <Video size={18} /></h3>
            <a href="#" style={{ background: 'var(--theme-input-bg)', display: 'inline-block', padding: '15px 30px', borderRadius: '30px', color: 'var(--color-primary)', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.2rem', textDecoration: 'none', border: '1px solid #2D8CFF', boxShadow: 'var(--shadow-md)' }}>https://zoom.us/j/hygeia-829148</a>
          </div>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/appointments')} className="btn-primary" style={{ padding: '1rem 2rem', borderRadius: '30px', background: '#85B599', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              <CalendarCheck size={18} /> Back to Appointments
            </button>
            <button className="btn-outline" style={{ padding: '1rem 2rem', borderRadius: '30px', borderColor: '#85B599', background: 'transparent', color: 'var(--theme-text)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              <Download size={18} /> Download Invoice
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
