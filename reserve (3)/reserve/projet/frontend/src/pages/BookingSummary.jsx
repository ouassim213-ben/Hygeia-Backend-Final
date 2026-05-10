import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Video, Lock, User, CreditCard, Check, CalendarCheck, Download } from 'lucide-react';
import api from '../api';
import { PLANS } from './Plans';

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

export default function BookingSummary() {
  const location = useLocation();
  const navigate = useNavigate();
  const { specialist, selectedSlot, planId } = location.state || {};
  const selectedPlan = planId ? PLANS[planId] : PLANS['golden'];
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Payment Form State
  const [paymentData, setPaymentData] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  });

  const [formErrors, setFormErrors] = useState({});

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'cardNumber':
        if (!/^\d{16}$/.test(value.replace(/\s/g, ''))) {
          error = 'Please enter a valid 16-digit card number';
        }
        break;
      case 'cardName':
        if (!/\S+\s+\S+/.test(value.trim())) {
          error = 'Please enter your full name (First and Last Name)';
        }
        break;
      case 'cvc':
        if (!/^\d{3,4}$/.test(value)) {
          error = 'Invalid CVC';
        }
        break;
      case 'expiry':
        const expiryRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
        const match = value.match(expiryRegex);
        if (!match) {
          error = 'Format must be MM/YY';
        } else {
          const month = parseInt(match[1]);
          const year = 2000 + parseInt(match[2]);
          const now = new Date();
          const currentYear = now.getFullYear();
          const currentMonth = now.getMonth() + 1;
          
          if (year < currentYear || (year === currentYear && month < currentMonth)) {
            error = 'Card has expired';
          }
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = value.replace(/\D/g, '').substring(0, 16);
    } else if (name === 'cvc') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4);
    } else if (name === 'expiry') {
      formattedValue = value.replace(/[^\d/]/g, '').substring(0, 5);
      if (formattedValue.length === 2 && !formattedValue.includes('/') && e.nativeEvent?.inputType !== 'deleteContentBackward') {
        formattedValue += '/';
      }
    }

    setPaymentData(prev => ({ ...prev, [name]: formattedValue }));
    const error = validateField(name, formattedValue);
    setFormErrors(prev => ({ ...prev, [name]: error }));
  };

  const isFormValid = () => {
    const { cardName, cardNumber, expiry, cvc } = paymentData;
    return (
      cardName.trim().split(/\s+/).length >= 2 && 
      cardNumber.length === 16 && 
      expiry.length === 5 && 
      (cvc.length === 3 || cvc.length === 4) &&
      !formErrors.cardName && !formErrors.cardNumber && !formErrors.expiry && !formErrors.cvc
    );
  };

  if (!specialist || !selectedSlot) {
    return (
      <>
        <Navbar />
        <main style={{ paddingTop: '140px', minHeight: '100vh', backgroundColor: 'var(--theme-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: 'var(--theme-text)' }}>
            <h2>Missing booking information.</h2>
            <button onClick={() => navigate('/appointments')} style={{ marginTop: '1rem', padding: '0.8rem 2rem', background: '#85B599', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}>
              Back to Appointments
            </button>
          </div>
        </main>
      </>
    );
  }

  const handleProcessCheckout = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMsg('');
    
    try {
      const response = await api.post('appointments/', {
        specialist_id: specialist.id,
        plan_name: selectedPlan ? selectedPlan.name : "Golden Plan",
        date: selectedSlot.day,
        time: selectedSlot.time
      });
      console.log('--- APPOINTMENT RESPONSE ---', response.data);
      
      setTimeout(() => {
        setIsProcessing(false);
        navigate('/success', { state: { specialistName: specialist.full_name, day: selectedSlot.day, time: selectedSlot.time } });
      }, 1500);
      
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      let msg = "Error booking appointment.";
      if (err.response?.data) {
        if (err.response.data.error) {
          msg = err.response.data.error;
        } else if (typeof err.response.data === 'object') {
          msg = Object.values(err.response.data).flat().join(" ");
        }
      }
      setErrorMsg(msg);
    }
  };

  return (
    <>
      <Navbar />
      <main>
        <section className="section" style={{ paddingTop: '120px', backgroundColor: 'var(--theme-bg)', minHeight: '100vh' }}>
          <div className="container p-0" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
            
              <div id="view-checkout" className="animate-fade">
                <StepIndicator currentStep={2} />
                <div style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--theme-card-bg)', border: '1px solid var(--theme-card-border)', padding: '3rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)' }}>
                  
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <ShieldCheck size={48} color="#85B599" style={{ marginBottom: '1rem', display: 'inline-block' }} />
                    <h2 style={{ fontSize: '2rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Confirm Booking</h2>
                    <p style={{ color: 'var(--theme-text-muted)' }}>Finalize your consultation with {specialist.full_name}</p>
                  </div>

                  {errorMsg && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', padding: '1rem', marginBottom: '1.5rem', borderRadius: '4px', color: '#ef4444' }}>
                      <strong>Booking failed:</strong> {errorMsg}
                    </div>
                  )}

                  <div style={{ background: 'rgba(133,181,153,0.1)', borderLeft: '4px solid #85B599', padding: '1.5rem', marginBottom: '2rem', borderRadius: '4px' }}>
                    <h4 style={{ color: 'var(--color-primary)', marginBottom: '15px', borderBottom: '1px solid rgba(133,181,153,0.3)', paddingBottom: '10px' }}>Order Summary</h4>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--theme-text)' }}>
                      <span>Specialist:</span>
                      <strong style={{ color: 'var(--color-primary)' }}>{specialist.full_name} ({specialist.tier || 'Basic'} Tier)</strong>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--theme-text)' }}>
                      <span>Date & Time:</span>
                      <strong style={{ color: 'var(--color-primary)' }}>{selectedSlot.day} at {selectedSlot.time}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: 'var(--theme-text)' }}>
                      <span>Plan Utilized:</span>
                      <strong style={{ color: 'var(--color-primary)' }}>{selectedPlan ? selectedPlan.name : 'Golden Plan'}</strong>
                    </div>
                    
                    <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed rgba(133,181,153,0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--theme-text)' }}>Amount due now:</span>
                      <strong style={{ color: '#85B599', fontSize: '1.5rem' }}>${selectedPlan ? selectedPlan.price : 1200}</strong>
                    </div>
                  </div>

                  <form onSubmit={handleProcessCheckout}>
                    <div style={{ position: 'relative', marginBottom: '15px' }}>
                      <User size={18} style={{ position: 'absolute', top: '15px', left: '15px', color: 'var(--theme-text-muted)' }} />
                      <input 
                        type="text" 
                        name="cardName"
                        placeholder="Name on card" 
                        value={paymentData.cardName}
                        onChange={handleInputChange}
                        required 
                        style={{ 
                          width: '100%', padding: '1rem', paddingLeft: '45px', 
                          border: `1px solid ${formErrors.cardName ? '#ef4444' : 'var(--theme-card-border)'}`, 
                          borderRadius: 'var(--radius-sm)', background: 'var(--theme-input-bg)', color: 'var(--theme-text)', 
                          fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s'
                        }} 
                      />
                      {formErrors.cardName && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '5px', marginLeft: '5px' }}>{formErrors.cardName}</p>}
                    </div>
                    <div style={{ position: 'relative', marginBottom: '15px' }}>
                      <CreditCard size={18} style={{ position: 'absolute', top: '15px', left: '15px', color: 'var(--theme-text-muted)' }} />
                      <input 
                        type="text" 
                        name="cardNumber"
                        placeholder="Card number (16 digits)" 
                        value={paymentData.cardNumber}
                        onChange={handleInputChange}
                        required 
                        style={{ 
                          width: '100%', padding: '1rem', paddingLeft: '45px', 
                          border: `1px solid ${formErrors.cardNumber ? '#ef4444' : 'var(--theme-card-border)'}`, 
                          borderRadius: 'var(--radius-sm)', background: 'var(--theme-input-bg)', color: 'var(--theme-text)', 
                          fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s'
                        }} 
                      />
                      {formErrors.cardNumber && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '5px', marginLeft: '5px' }}>{formErrors.cardNumber}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                      <div style={{ width: '50%' }}>
                        <input 
                          type="text" 
                          name="expiry"
                          placeholder="MM/YY" 
                          value={paymentData.expiry}
                          onChange={handleInputChange}
                          required 
                          style={{ 
                            width: '100%', padding: '1rem', 
                            border: `1px solid ${formErrors.expiry ? '#ef4444' : 'var(--theme-card-border)'}`, 
                            borderRadius: 'var(--radius-sm)', background: 'var(--theme-input-bg)', color: 'var(--theme-text)', 
                            fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s'
                          }} 
                        />
                        {formErrors.expiry && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '5px', marginLeft: '5px' }}>{formErrors.expiry}</p>}
                      </div>
                      <div style={{ width: '50%' }}>
                        <input 
                          type="text" 
                          name="cvc"
                          placeholder="CVC" 
                          value={paymentData.cvc}
                          onChange={handleInputChange}
                          required 
                          style={{ 
                            width: '100%', padding: '1rem', 
                            border: `1px solid ${formErrors.cvc ? '#ef4444' : 'var(--theme-card-border)'}`, 
                            borderRadius: 'var(--radius-sm)', background: 'var(--theme-input-bg)', color: 'var(--theme-text)', 
                            fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s'
                          }} 
                        />
                        {formErrors.cvc && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '5px', marginLeft: '5px' }}>{formErrors.cvc}</p>}
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isProcessing || !isFormValid()}
                      style={{ 
                        width: '100%', padding: '1.2rem', marginTop: '1rem', borderRadius: '30px', 
                        fontWeight: 'bold', 
                        background: (isProcessing || !isFormValid()) ? '#94a3b8' : '#065f46', 
                        color: 'white', fontSize: '1.1rem', border: 'none', 
                        cursor: (isProcessing || !isFormValid()) ? 'not-allowed' : 'pointer', 
                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                        opacity: (isProcessing || !isFormValid()) ? 0.7 : 1,
                        transition: 'all 0.3s'
                      }}
                    >
                      {isProcessing ? <><span className="fa-spin"><Lock size={18} /></span> Processing...</> : <><Check size={20} /> Confirm & Book Consultation</>}
                    </button>
                    <p style={{ textAlign: 'center', color: 'var(--theme-text-muted)', fontSize: '0.8rem', marginTop: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}><Lock size={12} /> Payment encrypted by Stripe. Your data is protected.</p>
                    <style>{`.fa-spin { animation: spin 2s linear infinite; display: inline-block; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                  </form>
                </div>
              </div>

          </div>
        </section>
      </main>
    </>
  );
}
