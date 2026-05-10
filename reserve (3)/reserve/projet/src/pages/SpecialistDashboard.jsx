import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api';
import { Calendar, Save, CheckCircle2, Clock } from 'lucide-react';

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function SpecialistDashboard() {
  const [schedule, setSchedule] = useState(
    DAYS.map(day => ({ day_of_week: day, start_time: "09:00", end_time: "17:00", is_active: false }))
  );
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await api.get('specialist/availability/');
        if (res.data && res.data.length > 0) {
          // Merge fetched data into default map
          const fetchedMap = {};
          res.data.forEach(item => {
            fetchedMap[item.day_of_week] = {
              start_time: item.start_time ? item.start_time.substring(0,5) : "09:00",
              end_time: item.end_time ? item.end_time.substring(0,5) : "17:00",
              is_active: item.is_active
            };
          });
          setSchedule(DAYS.map(day => ({
             day_of_week: day, 
             start_time: fetchedMap[day]?.start_time || "09:00",
             end_time: fetchedMap[day]?.end_time || "17:00", 
             is_active: fetchedMap[day]?.is_active || false
          })));
        }
      } catch (err) {
        console.error("Error fetching availability:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAvailability();
  }, []);

  const handleChange = (index, field, value) => {
    const newSchedule = [...schedule];
    newSchedule[index][field] = value;
    setSchedule(newSchedule);
  };

  const handleSave = async () => {
    setMessage('');
    try {
      const res = await api.post('specialist/availability/', schedule);
      if (res.status === 200) {
        setMessage('Schedule successfully saved!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage('Error saving schedule.');
    }
  };

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: '#a8c7b0', minHeight: '100vh', paddingTop: '100px', paddingBottom: '4rem', fontFamily: 'sans-serif' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem' }}>
          
          <div style={{ background: '#ffffff', borderRadius: '24px', padding: '3rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2rem' }}>
              <div style={{ background: '#f4f4f4', padding: '15px', borderRadius: '50%' }}>
                <Calendar size={32} color="#72b88f" />
              </div>
              <div>
                <h1 style={{ fontSize: '2rem', color: '#222', fontFamily: 'serif', margin: 0 }}>Manage Schedule</h1>
                <p style={{ color: '#666', margin: '5px 0 0 0' }}>Set your weekly availability for patient bookings.</p>
              </div>
            </div>

            {message && (
              <div style={{ padding: '1rem', background: '#dcfce7', color: '#166534', borderRadius: '12px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={20} /> {message}
              </div>
            )}

            {loading ? (
              <p>Loading schedule...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {schedule.map((day, index) => (
                  <div key={day.day_of_week} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    background: day.is_active ? '#fcfdfd' : '#f9f9f9',
                    border: `1px solid ${day.is_active ? '#72b88f' : '#ddd'}`,
                    padding: '1.5rem', 
                    borderRadius: '16px',
                    gap: '1.5rem',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '150px' }}>
                      <input 
                        type="checkbox" 
                        checked={day.is_active} 
                        onChange={(e) => handleChange(index, 'is_active', e.target.checked)}
                        style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#72b88f' }}
                        id={`check-${day.day_of_week}`}
                      />
                      <label htmlFor={`check-${day.day_of_week}`} style={{ fontSize: '1.1rem', fontWeight: 'bold', color: day.is_active ? '#222' : '#888', cursor: 'pointer' }}>
                        {day.day_of_week}
                      </label>
                    </div>

                    {day.is_active ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                        <Clock size={18} color="#666" />
                        <input 
                          type="time" 
                          value={day.start_time} 
                          onChange={(e) => handleChange(index, 'start_time', e.target.value)}
                          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }}
                        />
                        <span style={{ color: '#666', fontWeight: 'bold' }}>to</span>
                        <input 
                          type="time" 
                          value={day.end_time} 
                          onChange={(e) => handleChange(index, 'end_time', e.target.value)}
                          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }}
                        />
                      </div>
                    ) : (
                       <span style={{ color: '#999', fontStyle: 'italic', flex: 1 }}>Not available</span>
                    )}
                  </div>
                ))}

                <button 
                  onClick={handleSave}
                  style={{ 
                    width: '100%', padding: '1.2rem', marginTop: '2rem', borderRadius: '30px', 
                    background: '#222', color: 'white', fontSize: '1.1rem', fontWeight: 'bold', 
                    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' 
                  }}
                >
                  Save Schedule <Save size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
