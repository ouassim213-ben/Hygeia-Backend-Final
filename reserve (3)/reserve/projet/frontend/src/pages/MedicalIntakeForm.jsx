import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useLocation, useNavigate } from 'react-router-dom';
import { ClipboardList, Activity, Target, ShieldAlert, ChevronRight, ChevronLeft } from 'lucide-react';

const StepIndicator = ({ currentStep }) => {
  const steps = [
    { id: 1, label: 'Select Date' },
    { id: 2, label: 'Medical Info' },
    { id: 3, label: 'Payment' }
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

export default function MedicalIntakeForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { specialist, selectedSlot, planId } = location.state || {};

  const [formData, setFormData] = useState({
    health_issues: '',
    primary_goal: '',
    allergies_meds: '',
    lifestyle: ''
  });

  const [errors, setErrors] = useState({});

  if (!specialist || !selectedSlot) {
    return (
      <div style={{ padding: '140px 20px', textAlign: 'center' }}>
        <h2>Session expired. Please start over.</h2>
        <button className="btn-primary" onClick={() => navigate('/appointments')} style={{ marginTop: '20px' }}>Back to Specialists</button>
      </div>
    );
  }

  const validate = () => {
    const newErrors = {};
    if (!formData.health_issues.trim()) newErrors.health_issues = 'Please describe your health issues.';
    if (!formData.primary_goal) newErrors.primary_goal = 'Please select a primary goal.';
    if (!formData.allergies_meds.trim()) newErrors.allergies_meds = 'Please list any allergies or medications.';
    if (!formData.lifestyle) newErrors.lifestyle = 'Please select your lifestyle level.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      navigate('/booking-summary', { 
        state: { 
          specialist, 
          selectedSlot, 
          planId,
          questionnaire: formData
        } 
      });
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: '#ffffff',
    fontSize: '1rem',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
    marginTop: '8px'
  };

  const labelStyle = {
    fontWeight: '700',
    color: '#065f46',
    fontSize: '0.95rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: '#ffffff', minHeight: '100vh', paddingTop: '120px', paddingBottom: '60px' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
          
          <StepIndicator currentStep={2} />

          <div style={{ 
            background: '#ffffff', 
            border: '1px solid #eff3f4', 
            borderRadius: '24px', 
            padding: '40px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <ClipboardList size={40} color="#065f46" style={{ marginBottom: '16px' }} />
              <h1 style={{ fontSize: '1.8rem', color: '#0f1419', fontWeight: '800' }}>Medical Background</h1>
              <p style={{ color: '#64748b' }}>Please provide these details to help {specialist.full_name} prepare for your session.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '24px' }}>
              
              <div>
                <label style={labelStyle}><Activity size={18} /> Current Health Issues</label>
                <textarea 
                  placeholder="Do you have any chronic diseases or current health concerns?"
                  style={{ ...inputStyle, minHeight: '100px', resize: 'vertical', border: errors.health_issues ? '1px solid #ef4444' : '1px solid #e2e8f0' }}
                  value={formData.health_issues}
                  onChange={(e) => setFormData({...formData, health_issues: e.target.value})}
                />
                {errors.health_issues && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.health_issues}</span>}
              </div>

              <div>
                <label style={labelStyle}><Target size={18} /> Primary Goal</label>
                <select 
                  style={{ ...inputStyle, border: errors.primary_goal ? '1px solid #ef4444' : '1px solid #e2e8f0' }}
                  value={formData.primary_goal}
                  onChange={(e) => setFormData({...formData, primary_goal: e.target.value})}
                >
                  <option value="">Select a goal</option>
                  <option value="WEIGHT_LOSS">Weight Loss</option>
                  <option value="MUSCLE_GAIN">Muscle Gain</option>
                  <option value="MANAGE_ILLNESS">Manage Illness</option>
                  <option value="GENERAL_HEALTH">General Health</option>
                </select>
                {errors.primary_goal && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.primary_goal}</span>}
              </div>

              <div>
                <label style={labelStyle}><ShieldAlert size={18} /> Allergies & Medications</label>
                <textarea 
                  placeholder="List any allergies or current medications you are taking."
                  style={{ ...inputStyle, minHeight: '100px', resize: 'vertical', border: errors.allergies_meds ? '1px solid #ef4444' : '1px solid #e2e8f0' }}
                  value={formData.allergies_meds}
                  onChange={(e) => setFormData({...formData, allergies_meds: e.target.value})}
                />
                {errors.allergies_meds && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.allergies_meds}</span>}
              </div>

              <div>
                <label style={labelStyle}><Activity size={18} /> Lifestyle Activity Level</label>
                <select 
                  style={{ ...inputStyle, border: errors.lifestyle ? '1px solid #ef4444' : '1px solid #e2e8f0' }}
                  value={formData.lifestyle}
                  onChange={(e) => setFormData({...formData, lifestyle: e.target.value})}
                >
                  <option value="">Select activity level</option>
                  <option value="SEDENTARY">Sedentary (Little to no exercise)</option>
                  <option value="LIGHTLY_ACTIVE">Lightly Active (1-3 days/week)</option>
                  <option value="VERY_ACTIVE">Very Active (4-7 days/week)</option>
                </select>
                {errors.lifestyle && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.lifestyle}</span>}
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                <button 
                  type="button" 
                  onClick={() => navigate(-1)}
                  style={{ 
                    flex: '1', 
                    padding: '14px', 
                    borderRadius: '30px', 
                    border: '1px solid #e2e8f0', 
                    background: '#ffffff', 
                    color: '#64748b', 
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <ChevronLeft size={18} /> Back
                </button>
                <button 
                  type="submit" 
                  style={{ 
                    flex: '2', 
                    padding: '14px', 
                    borderRadius: '30px', 
                    border: 'none', 
                    background: '#065f46', 
                    color: '#ffffff', 
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(6, 95, 70, 0.2)'
                  }}
                >
                  Proceed to Payment <ChevronRight size={18} />
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </>
  );
}
