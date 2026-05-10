import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ArrowRight, ArrowLeft, Camera, Activity, FileText, CheckCircle } from 'lucide-react';
import api from '../api';

export default function Register() {
  const [currentStep, setCurrentStep] = useState(1);
  const [role, setRole] = useState('PATIENT');
  
  // Step 1: Basic Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2 (Patient): Physical Metrics
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  // Step 3 (Patient): Health Profile
  const [healthIssues, setHealthIssues] = useState('');
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [lifestyle, setLifestyle] = useState('');
  const [allergies, setAllergies] = useState('');

  // Step 2 (Expert): Professional Profile
  const [specialty, setSpecialty] = useState('');
  const [tier, setTier] = useState('basic');
  const [bio, setBio] = useState('');
  const [certificate, setCertificate] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();

  const totalSteps = role === 'PATIENT' ? 3 : 2;

  const handleNextStep = () => {
    setErrorMsg('');
    if (currentStep === 1) {
      if (!firstName || !lastName || !email || !password || !confirmPassword) {
        setErrorMsg('Please fill in all basic information fields.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
    } else if (currentStep === 2 && role === 'PATIENT') {
      if (!age || !gender || !height || !weight) {
        setErrorMsg('Please fill in all physical metric fields.');
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    setErrorMsg('');
    setCurrentStep(currentStep - 1);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    if (role === 'NUTRITIONIST' && !certificate) {
      setErrorMsg("Work certificate is mandatory for Experts.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('first_name', firstName);
      formData.append('last_name', lastName);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('role', role);

      if (role === 'PATIENT') {
        formData.append('age', age);
        // Gender could be mapped or just omitted if not in schema, but we pass it as part of lifestyle or bio if needed. 
        // For now, schema supports age, height, weight, health_issues, primary_goal, lifestyle, allergies_meds.
        formData.append('height', height);
        formData.append('weight', weight);
        formData.append('health_issues', healthIssues);
        formData.append('primary_goal', primaryGoal);
        formData.append('lifestyle', lifestyle);
        formData.append('allergies_meds', allergies);
      } else {
        formData.append('specialty_type', specialty);
        formData.append('tier', tier);
        formData.append('bio', bio);
        if (certificate) {
          formData.append('work_certificate', certificate);
        }
        if (profilePicture) {
          formData.append('image', profilePicture);
        }
      }

      const res = await api.post('auth/register/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if(res.data) {
        if (role === 'NUTRITIONIST') {
          setSuccessMsg("Registration successful! Your account is pending admin approval.");
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setSuccessMsg("Registration successful! Please sign in.");
          setTimeout(() => navigate('/login'), 2000);
        }
      }
    } catch(e) {
      if (e.response && e.response.data) {
        const backendErrors = Object.values(e.response.data).flat().join(" ");
        setErrorMsg(backendErrors || "Registration Error: Check your details.");
      } else {
        setErrorMsg("Registration Error: Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderProgressStepper = () => {
    return (
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem', marginBottom: '10px' }}>
          Step {currentStep} of {totalSteps}
        </p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div 
              key={idx}
              style={{
                height: '6px',
                width: '40px',
                borderRadius: '10px',
                backgroundColor: idx + 1 <= currentStep ? '#10b981' : '#e2e8f0',
                transition: 'background-color 0.3s ease'
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  const inputStyle = {
    width: '100%', 
    padding: '0.9rem 1rem', 
    borderRadius: '10px', 
    border: '1px solid #cbd5e1', 
    backgroundColor: '#f8fafc', 
    color: '#1e293b', 
    outline: 'none',
    fontSize: '0.95rem',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  };

  return (
    <>
      <style>{`
        body, html { margin: 0; padding: 0; height: 100vh; overflow: hidden; font-family: 'Inter', sans-serif; }
        .page-wrapper { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
        .split-layout-wrapper { display: flex; align-items: stretch; flex: 1; min-height: 0; background-color: white; }
        .split-image { display: none; flex: 1; position: relative; overflow: hidden; height: 100%; }
        .split-image::after { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 60%); z-index: 5; }
        .image-overlay { position: absolute; bottom: 15%; left: 10%; z-index: 10; display: flex; flex-direction: column; align-items: flex-start; text-align: left; max-width: 600px; }
        .headline { color: white; font-family: 'Outfit', sans-serif; font-size: 3.5rem; font-weight: 800; margin: 0 0 15px 0; line-height: 1.1; letter-spacing: -0.5px; text-shadow: 0 4px 30px rgba(0,0,0,0.9); }
        .description { color: white; font-size: 1.2rem; font-weight: 500; opacity: 0.9; margin: 0; line-height: 1.4; text-shadow: 0 2px 15px rgba(0,0,0,0.9); }
        .split-content { flex: 1; display: flex; flex-direction: column; justify-content: flex-start; height: 100%; background-color: white; overflow-y: auto; }
        @media (min-width: 992px) { .split-image { display: block; } .split-content { max-width: 50vw; } }
        .form-container { max-width: 480px; width: 100%; margin: 0 auto; padding: 3rem 2rem; }
        input:focus, select:focus, textarea:focus { border-color: #10b981 !important; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); }
      `}</style>
      
      <div className="page-wrapper">
        <nav style={{ backgroundColor: '#194459', padding: '1rem 5% 1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '1.5rem' }}>
              <Link to="/login" style={{ color: 'rgba(255, 255, 255, 0.9)', textDecoration: 'none', fontSize: '0.9rem', padding: '0.5rem 1.2rem', borderRadius: '50px', border: '1px solid rgba(255, 255, 255, 0.5)', fontWeight: '600' }}>Login</Link>
              <Link to="/signup" style={{ backgroundColor: '#F1CC61', color: '#194459', padding: '0.5rem 1.2rem', borderRadius: '50px', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem' }}>Sign Up</Link>
            </div>
          </div>
        </nav>

        <div className="split-layout-wrapper">
          <div className="split-image">
            <img src="/auth.jpg" alt="Health and Nutrition" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div className="image-overlay">
              <h1 className="headline">Nourish Smarter, Live Better.</h1>
              <p className="description">Join Hygeia to transform your health with AI insights and expert guidance.</p>
            </div>
          </div>
          
          <div className="split-content">
            <div className="form-container">
              <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                <Link to="/" style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  color: '#6B7280', 
                  fontSize: '0.875rem', 
                  textDecoration: 'none', 
                  marginBottom: '1rem',
                  fontWeight: '500',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.color = '#194459'}
                onMouseOut={(e) => e.target.style.color = '#6B7280'}
                >
                  &lt; Home
                </Link>
              </div>
              <h2 style={{ fontSize: '2rem', color: '#194459', marginBottom: '0.5rem', textAlign: 'center', fontFamily: "'Playfair Display', serif", fontWeight: 'bold' }}>
                Join Hygeia
              </h2>
              <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '2rem' }}>
                {role === 'PATIENT' ? 'Start your personalized health journey today.' : 'Join our network of elite professionals.'}
              </p>

              {renderProgressStepper()}

              {(errorMsg || successMsg) && (
                <div style={{ padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', backgroundColor: errorMsg ? '#fef2f2' : '#f0fdf4', color: errorMsg ? '#ef4444' : '#10b981', border: `1px solid ${errorMsg ? '#fca5a5' : '#86efac'}`, fontSize: '0.9rem', textAlign: 'center' }}>
                  {errorMsg || successMsg}
                </div>
              )}

              <form onSubmit={handleRegister}>
                {/* STEP 1: Basic Information */}
                {currentStep === 1 && (
                  <div className="animate-fade-in">
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b', fontSize: '0.9rem' }}>I am a:</label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="button" onClick={() => setRole('PATIENT')} style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', border: `2px solid ${role === 'PATIENT' ? '#10b981' : '#e2e8f0'}`, backgroundColor: role === 'PATIENT' ? '#ecfdf5' : 'transparent', color: role === 'PATIENT' ? '#065f46' : '#64748b', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}>Patient</button>
                        <button type="button" onClick={() => setRole('NUTRITIONIST')} style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', border: `2px solid ${role === 'NUTRITIONIST' ? '#10b981' : '#e2e8f0'}`, backgroundColor: role === 'NUTRITIONIST' ? '#ecfdf5' : 'transparent', color: role === 'NUTRITIONIST' ? '#065f46' : '#64748b', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}>Expert</button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                      <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={inputStyle} required />
                      <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} style={inputStyle} required />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} required />
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                      <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle} required />
                    </div>

                    <button type="button" onClick={handleNextStep} style={{ width: '100%', padding: '1rem', border: 'none', borderRadius: '50px', backgroundColor: '#194459', color: 'white', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s' }}>
                      Next <ArrowRight size={18} />
                    </button>
                  </div>
                )}

                {/* STEP 2: Physical Metrics (PATIENT) */}
                {currentStep === 2 && role === 'PATIENT' && (
                  <div className="animate-fade-in">
                    <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: '1.5rem', fontWeight: '600' }}>Physical Metrics</h3>
                    
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.3rem' }}>Age</label>
                        <input type="number" placeholder="e.g. 28" value={age} onChange={(e) => setAge(e.target.value)} style={inputStyle} required />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.3rem' }}>Gender</label>
                        <select value={gender} onChange={(e) => setGender(e.target.value)} style={inputStyle} required>
                          <option value="" disabled>Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.3rem' }}>Height (cm)</label>
                        <input type="number" placeholder="e.g. 175" value={height} onChange={(e) => setHeight(e.target.value)} style={inputStyle} required />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.3rem' }}>Weight (kg)</label>
                        <input type="number" placeholder="e.g. 70" value={weight} onChange={(e) => setWeight(e.target.value)} style={inputStyle} required />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="button" onClick={handlePrevStep} style={{ flex: 1, padding: '1rem', border: '1px solid #cbd5e1', borderRadius: '50px', backgroundColor: 'white', color: '#475569', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <ArrowLeft size={18} /> Back
                      </button>
                      <button type="button" onClick={handleNextStep} style={{ flex: 1, padding: '1rem', border: 'none', borderRadius: '50px', backgroundColor: '#194459', color: 'white', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        Next <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Health Profile (PATIENT) */}
                {currentStep === 3 && role === 'PATIENT' && (
                  <div className="animate-fade-in">
                    <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: '1.5rem', fontWeight: '600' }}>Health Profile</h3>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.3rem' }}>Current Health Issues</label>
                      <textarea placeholder="Any chronic diseases or concerns?" value={healthIssues} onChange={(e) => setHealthIssues(e.target.value)} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.3rem' }}>Primary Goal</label>
                        <select value={primaryGoal} onChange={(e) => setPrimaryGoal(e.target.value)} style={inputStyle} required>
                          <option value="" disabled>Select Goal</option>
                          <option value="WEIGHT_LOSS">Weight Loss</option>
                          <option value="MUSCLE_GAIN">Muscle Gain</option>
                          <option value="MANAGE_ILLNESS">Manage Illness</option>
                          <option value="GENERAL_HEALTH">General Health</option>
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.3rem' }}>Activity Level</label>
                        <select value={lifestyle} onChange={(e) => setLifestyle(e.target.value)} style={inputStyle} required>
                          <option value="" disabled>Select Level</option>
                          <option value="SEDENTARY">Sedentary</option>
                          <option value="LIGHTLY_ACTIVE">Lightly Active</option>
                          <option value="VERY_ACTIVE">Very Active</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.3rem' }}>Allergies & Medications</label>
                      <textarea placeholder="List any allergies or current medications..." value={allergies} onChange={(e) => setAllergies(e.target.value)} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="button" onClick={handlePrevStep} style={{ flex: 1, padding: '1rem', border: '1px solid #cbd5e1', borderRadius: '50px', backgroundColor: 'white', color: '#475569', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <ArrowLeft size={18} /> Back
                      </button>
                      <button type="submit" disabled={isSubmitting} style={{ flex: 2, padding: '1rem', border: 'none', borderRadius: '50px', backgroundColor: '#10b981', color: 'white', fontSize: '1rem', fontWeight: '600', cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        {isSubmitting ? 'Submitting...' : 'Complete Sign Up'} <CheckCircle size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Professional Profile (EXPERT) */}
                {currentStep === 2 && role === 'NUTRITIONIST' && (
                  <div className="animate-fade-in">
                    <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: '1.5rem', fontWeight: '600' }}>Professional Profile</h3>

                    <div style={{ marginBottom: '1rem' }}>
                      <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} style={inputStyle} required>
                        <option value="" disabled>Select Specialization</option>
                        <option value="Nutritionist">Nutritionist</option>
                        <option value="Dietitian">Dietitian</option>
                        <option value="Fitness Coach">Fitness Coach</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <select value={tier} onChange={(e) => setTier(e.target.value)} style={inputStyle} required>
                        <option value="basic">Junior (Quick Start Plan)</option>
                        <option value="standard">Certified (1 Month Plan)</option>
                        <option value="premium">Expert (Golden Plan)</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <textarea placeholder="Short professional bio..." value={bio} onChange={(e) => setBio(e.target.value)} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} required />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.3rem' }}>Profile Picture</label>
                      <div style={{ position: 'relative', border: '2px dashed #cbd5e1', borderRadius: '10px', padding: '1rem', textAlign: 'center', backgroundColor: '#f8fafc' }}>
                        <input type="file" onChange={(e) => setProfilePicture(e.target.files[0])} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} accept="image/*" />
                        <span style={{ fontSize: '0.9rem', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Camera size={18} /> {profilePicture ? profilePicture.name : "Upload Photo"}</span>
                      </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.3rem' }}>Work Certificate (Mandatory)</label>
                      <div style={{ position: 'relative', border: '2px dashed #cbd5e1', borderRadius: '10px', padding: '1rem', textAlign: 'center', backgroundColor: '#f8fafc' }}>
                        <input type="file" onChange={(e) => setCertificate(e.target.files[0])} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} accept=".pdf,.jpg,.jpeg,.png" required />
                        <span style={{ fontSize: '0.9rem', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><FileText size={18} /> {certificate ? certificate.name : "Upload Certificate"}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="button" onClick={handlePrevStep} style={{ flex: 1, padding: '1rem', border: '1px solid #cbd5e1', borderRadius: '50px', backgroundColor: 'white', color: '#475569', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <ArrowLeft size={18} /> Back
                      </button>
                      <button type="submit" disabled={isSubmitting} style={{ flex: 2, padding: '1rem', border: 'none', borderRadius: '50px', backgroundColor: '#10b981', color: 'white', fontSize: '1rem', fontWeight: '600', cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        {isSubmitting ? 'Submitting...' : 'Complete Sign Up'} <CheckCircle size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </form>

              {currentStep === 1 && (
                <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: '#64748b' }}>
                  Already have an account? <Link to="/login" style={{ color: '#194459', fontWeight: '700', textDecoration: 'none' }}>Sign In</Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
