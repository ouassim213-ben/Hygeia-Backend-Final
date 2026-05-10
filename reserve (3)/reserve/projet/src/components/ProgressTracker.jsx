import React, { useState, useEffect } from 'react';
import { CheckCircle, Upload, X, Droplet, Apple, Activity, User, FileText, Calendar, Clock } from 'lucide-react';
import api from '../api';

export default function ProgressTracker({ readOnly = false, patientId = null }) {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [appointmentStatus, setAppointmentStatus] = useState('NO_PLAN');
  const [currentPlanName, setCurrentPlanName] = useState('');
  const [pendingApptId, setPendingApptId] = useState(null);
  const [completing, setCompleting] = useState(false);
  
  // Form State
  const [waterIntake, setWaterIntake] = useState(false);
  const [followedDiet, setFollowedDiet] = useState(false);
  const [exercise, setExercise] = useState(false);
  const [mealPhoto, setMealPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProgress();
  }, [patientId]);

  const generateMockData = (days = 5) => {
    const today = new Date();
    return Array.from({ length: days }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return {
        id: `mock-${i + 1}`,
        day_number: i + 1,
        date: d.toISOString().split('T')[0],
        water_intake: false,
        followed_diet: false,
        exercise: false,
        adherence_score: 0,
        meal_photo: null
      };
    });
  };

  const fetchProgress = async () => {
    try {
      // 1. Check Appointment Status
      const apptRes = await api.get('user/appointments/');
      const appts = apptRes.data;
      
      let targetAppt = null;
      if (appts && appts.length > 0) {
        if (patientId) {
          // Specialist view: find this patient's COMPLETED appointment first
          targetAppt = appts.find(a => a.patient == patientId && a.status === 'COMPLETED')
            || appts.find(a => a.patient == patientId)
            || appts[0];
        } else {
          // Patient view: prefer COMPLETED appointment above all others
          targetAppt = appts.find(a => a.status === 'COMPLETED')
            || appts.find(a => a.status === 'UPCOMING')
            || appts[0];
        }
      }

      if (!targetAppt) {
        setAppointmentStatus('NO_PLAN');
        setLoading(false);
        return;
      }

      setCurrentPlanName(targetAppt.plan_name);

      // Case-insensitive check to be safe (DB stores 'COMPLETED')
      if (targetAppt.status?.toUpperCase() !== 'COMPLETED') {
        setPendingApptId(targetAppt.id);
        setAppointmentStatus('PENDING');
        setLoading(false);
        return;
      }

      setAppointmentStatus('ACTIVE');

      // 2. Fetch or Generate Progress Data
      let url = 'daily-progress/';
      if (patientId) {
        url += `?patient_id=${patientId}`;
      }
      const res = await api.get(url);
      
      if (res.data && res.data.length > 0) {
        setProgressData(res.data);
      } else {
        // Dynamic duration based on plan
        let duration = 5;
        const pName = targetAppt.plan_name.toLowerCase();
        if (pName.includes('advanced') || pName.includes('month')) duration = 15;
        if (pName.includes('ultimate') || pName.includes('golden')) duration = 30;
        
        setProgressData(generateMockData(duration));
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching progress:", err);
      setLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  
  const completedDays = progressData.filter(d => d.adherence_score > 0).length;
  const totalDays = progressData.length;
  const progressPercentage = totalDays === 0 ? 0 : Math.round((completedDays / totalDays) * 100);

  const sortedPastDays = [...progressData].filter(d => d.date <= todayStr).sort((a, b) => new Date(b.date) - new Date(a.date));
  let currentStreak = 0;
  for (let day of sortedPastDays) {
      if (day.adherence_score > 0) {
          currentStreak++;
      } else if (day.date !== todayStr) {
          break;
      }
  }

  const getTip = (dayNumber) => {
      const tips = [
          "Tip: Start your day with warm lemon water to boost metabolism.",
          "Tip: Aim for at least 10,000 steps today.",
          "Tip: Include a source of lean protein with every meal.",
          "Tip: Swap sugary drinks for herbal tea or infused water.",
          "Tip: Get at least 7-8 hours of sleep for optimal recovery.",
          "Tip: Try adding an extra serving of greens to your dinner.",
          "Tip: Practice mindful eating—chew your food slowly."
      ];
      return tips[(dayNumber - 1) % tips.length];
  };

  const handleCardClick = (day) => {
    if (readOnly) {
      // In read-only mode, clicking might just show details if there are any
      if (day.adherence_score > 0 || day.meal_photo) {
          setSelectedDay(day);
      }
      return;
    }
    
    // Only today's card is editable
    if (day.date === todayStr) {
      setSelectedDay(day);
      setWaterIntake(day.water_intake);
      setFollowedDiet(day.followed_diet);
      setExercise(day.exercise);
      setPhotoPreview(day.meal_photo);
      setMealPhoto(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMealPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('water_intake', waterIntake);
      formData.append('followed_diet', followedDiet);
      formData.append('exercise', exercise);
      
      // Calculate a basic score: 1 point per task completed
      let score = 0;
      if (waterIntake) score += 1;
      if (followedDiet) score += 1;
      if (exercise) score += 1;
      formData.append('adherence_score', score);

      if (mealPhoto) {
        formData.append('meal_photo', mealPhoto);
      }

      await api.patch(`daily-progress/${selectedDay.id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      await fetchProgress();
      setSelectedDay(null);
    } catch (err) {
      console.error("Error updating progress:", err);
      alert("Failed to update progress.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteConsultation = async () => {
    if (!pendingApptId) return;
    setCompleting(true);
    try {
      await api.post(`appointments/${pendingApptId}/complete/`);
      // Immediately re-fetch — will now see COMPLETED and render the agenda
      await fetchProgress();
    } catch (err) {
      console.error('Failed to complete consultation:', err);
      alert('Failed to mark as completed. Please try again.');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#194459' }}>Loading progress...</div>;

  if (appointmentStatus === 'NO_PLAN') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
        <h3 style={{ color: '#194459', marginBottom: '0.5rem' }}>No Active Program</h3>
        <p style={{ color: '#64748b' }}>An agenda will be generated automatically when a program is confirmed.</p>
      </div>
    );
  }

  if (appointmentStatus === 'PENDING') {
    return (
      <div style={{ padding: '2.5rem', textAlign: 'center', background: '#fffbeb', borderRadius: '16px', border: '2px dashed #f59e0b' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <h3 style={{ color: '#b45309', marginBottom: '0.5rem', fontSize: '1.3rem', fontWeight: '700' }}>Consultation Pending</h3>
        <p style={{ color: '#92400e', maxWidth: '400px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
          Your <strong>{currentPlanName}</strong> program is ready. Attend your initial Zoom consultation with your expert, then click below to activate your daily agenda.
        </p>
        {!readOnly && (
          <button
            onClick={handleCompleteConsultation}
            disabled={completing}
            style={{
              padding: '0.85rem 2rem', borderRadius: '50px', border: 'none',
              backgroundColor: completing ? '#d97706' : '#f59e0b',
              color: 'white', fontWeight: '700', fontSize: '1rem',
              cursor: completing ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
              transition: 'all 0.2s'
            }}
          >
            {completing ? 'Activating...' : '✅ Consultation Done — Activate My Agenda'}
          </button>
        )}
      </div>
    );
  }


  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Program Summary Banner */}
      <div style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, #194459, #2563eb)', color: 'white', padding: '1.5rem', borderRadius: '16px', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
        <div>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.8rem', fontWeight: 'bold', color: '#FFFFFF' }}>{currentPlanName || 'Active Plan'}</h2>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.95rem', opacity: 0.95, color: '#f8fafc' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={18} color="#FFFFFF" /> Duration: {totalDays} Days</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={18} color="#FFFFFF" /> Status: In Progress</span>
          </div>
        </div>
      </div>

      {/* Progress Header */}
      <div style={{ marginBottom: '2rem', background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>

            <h3 style={{ margin: 0, color: '#194459', fontSize: '1.25rem', fontWeight: '600' }}>Program Progress</h3>
            {currentStreak > 0 && (
              <span style={{ background: '#fff7ed', color: '#ea580c', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                🔥 {currentStreak} Day Streak
              </span>
            )}
          </div>
          <span style={{ fontWeight: '600', color: '#10b981', fontSize: '1.1rem' }}>{completedDays} / {totalDays} Days</span>
        </div>
        <div style={{ width: '100%', height: '12px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ 
            width: `${progressPercentage}%`, 
            height: '100%', 
            background: '#10b981', 
            borderRadius: '999px',
            transition: 'width 0.5s ease-in-out'
          }}></div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
        gap: '1rem' 
      }}>
        {progressData.map((day) => {
          const isToday = day.date === todayStr;
          const isPast = day.date < todayStr;
          const isCompleted = day.adherence_score > 0;
          
          let cardStyle = {
            padding: '1rem',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: (!readOnly && isToday) || (readOnly && isCompleted) ? 'pointer' : 'default',
            transition: 'all 0.2s',
            background: 'white',
            border: '2px solid transparent',
            minHeight: '110px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          };

          if (isToday) {
            cardStyle.border = '2px solid #10b981';
            cardStyle.background = '#f0fdf4';
            cardStyle.transform = !readOnly ? 'scale(1.05)' : 'none';
          } else if (isCompleted) {
            cardStyle.background = '#f8fafc';
            cardStyle.border = '1px solid #e2e8f0';
          } else if (isPast) {
            cardStyle.background = '#f1f5f9';
            cardStyle.opacity = 0.7;
          }

          return (
            <div 
              key={day.id} 
              style={cardStyle}
              onClick={() => handleCardClick(day)}
              className={(!readOnly && isToday) ? 'hover-scale' : ''}
            >
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>
                Day {day.day_number}
              </span>
              {isCompleted ? (
                <CheckCircle size={28} color="#10b981" />
              ) : isToday ? (
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }}></div>
              ) : (
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px dashed #cbd5e1' }}></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Interaction Modal */}
      {selectedDay && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(25, 68, 89, 0.5)', zIndex: 1000, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'white', padding: '2rem', borderRadius: '20px', 
            width: '90%', maxWidth: '450px', position: 'relative',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <button 
              onClick={() => setSelectedDay(null)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={24} />
            </button>
            
            <h2 style={{ color: '#194459', marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: '700' }}>
              Day {selectedDay.day_number}
            </h2>
            <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{selectedDay.date}</p>

            <div style={{ background: '#f8fafc', borderLeft: '4px solid #f59e0b', padding: '12px 16px', borderRadius: '0 8px 8px 0', marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 4px', color: '#194459', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Today's Focus</h4>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic' }}>
                {getTip(selectedDay.day_number)}
              </p>
            </div>

            {readOnly ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#194459', fontWeight: '500' }}>
                    {selectedDay.day_number === 1 ? <><User size={18} color="#3b82f6" /> Initial Consultation</> : <><Droplet size={18} color="#3b82f6" /> Water</>}
                  </span>
                  {selectedDay.water_intake ? <CheckCircle size={20} color="#10b981" /> : <X size={20} color="#ef4444" />}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#194459', fontWeight: '500' }}>
                    {selectedDay.day_number === 1 ? <><FileText size={18} color="#ef4444" /> Meal Plan Overview</> : <><Apple size={18} color="#ef4444" /> Diet</>}
                  </span>
                  {selectedDay.followed_diet ? <CheckCircle size={20} color="#10b981" /> : <X size={20} color="#ef4444" />}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#194459', fontWeight: '500' }}>
                    {selectedDay.day_number === 1 ? <><Droplet size={18} color="#f59e0b" /> Water Tracking</> : <><Activity size={18} color="#f59e0b" /> Exercise</>}
                  </span>
                  {selectedDay.exercise ? <CheckCircle size={20} color="#10b981" /> : <X size={20} color="#ef4444" />}
                </div>
                {selectedDay.meal_photo && (
                  <div style={{ marginTop: '1rem' }}>
                    <p style={{ fontWeight: '600', color: '#194459', marginBottom: '0.5rem' }}>Meal Photo:</p>
                    <img src={selectedDay.meal_photo} alt="Meal" style={{ width: '100%', borderRadius: '12px', maxHeight: '200px', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: waterIntake ? '#f0fdf4' : '#f8fafc', border: waterIntake ? '2px solid #10b981' : '2px solid transparent', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#194459', fontWeight: '600' }}>
                      {selectedDay.day_number === 1 ? <><User size={20} color="#3b82f6" /> Initial Consultation</> : <><Droplet size={20} color="#3b82f6" /> Drank enough water</>}
                    </span>
                    <input type="checkbox" checked={waterIntake} onChange={(e) => setWaterIntake(e.target.checked)} style={{ width: '20px', height: '20px', accentColor: '#10b981' }} />
                  </label>
                  
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: followedDiet ? '#f0fdf4' : '#f8fafc', border: followedDiet ? '2px solid #10b981' : '2px solid transparent', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#194459', fontWeight: '600' }}>
                      {selectedDay.day_number === 1 ? <><FileText size={20} color="#ef4444" /> Meal Plan Overview</> : <><Apple size={20} color="#ef4444" /> Followed the diet</>}
                    </span>
                    <input type="checkbox" checked={followedDiet} onChange={(e) => setFollowedDiet(e.target.checked)} style={{ width: '20px', height: '20px', accentColor: '#10b981' }} />
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: exercise ? '#f0fdf4' : '#f8fafc', border: exercise ? '2px solid #10b981' : '2px solid transparent', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#194459', fontWeight: '600' }}>
                      {selectedDay.day_number === 1 ? <><Droplet size={20} color="#f59e0b" /> Water Tracking</> : <><Activity size={20} color="#f59e0b" /> Exercised</>}
                    </span>
                    <input type="checkbox" checked={exercise} onChange={(e) => setExercise(e.target.checked)} style={{ width: '20px', height: '20px', accentColor: '#10b981' }} />
                  </label>

                  <div style={{ marginTop: '0.5rem' }}>
                    <p style={{ fontWeight: '600', color: '#194459', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Upload size={18} /> {photoPreview && !mealPhoto ? 'Logged Meal Photo' : 'Upload Meal Photo (Optional)'}
                    </p>
                    <input type="file" accept="image/*" onChange={handleFileChange} id="mealPhotoInput" style={{ display: 'none' }} />
                    <label htmlFor="mealPhotoInput" style={{ 
                      display: 'block', width: '100%', padding: photoPreview ? '0.5rem' : '2rem 1rem', 
                      background: '#f8fafc', border: '2px dashed #cbd5e1', 
                      borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
                      color: '#64748b'
                    }}>
                      {photoPreview ? (
                        <div>
                          <img src={photoPreview} alt="Meal" style={{ width: '100%', maxHeight: '120px', objectFit: 'cover', borderRadius: '8px' }} />
                          <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Click to change photo</div>
                        </div>
                      ) : (
                        <span>Click to browse</span>
                      )}
                    </label>
                  </div>

                  {waterIntake && followedDiet && exercise && (
                    <div style={{ padding: '1rem', background: '#ecfdf5', color: '#065f46', borderRadius: '12px', textAlign: 'center', animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                      <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '0.25rem' }}>🎉</span>
                      <strong>Amazing Job!</strong> You've crushed all your goals for today!
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  style={{ 
                    width: '100%', padding: '1rem', background: '#10b981', color: 'white', 
                    border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '600',
                    cursor: submitting ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                  }}
                >
                  {submitting ? 'Saving...' : 'Save Today\'s Progress'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        .hover-scale:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}
