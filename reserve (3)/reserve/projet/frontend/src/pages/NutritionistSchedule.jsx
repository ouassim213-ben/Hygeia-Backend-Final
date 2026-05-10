import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { CheckCircle, Clock, Save, CalendarCheck, Info } from 'lucide-react';
import api from '../api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_SLOTS = DAYS.map(day => ({
  day_of_week: day,
  is_active: false,
  start_time: '09:00',
  end_time: '17:00',
}));

export default function NutritionistSchedule() {
  const [slots, setSlots] = useState(DEFAULT_SLOTS);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const res = await api.get('specialist/availability/');
      if (res.data && res.data.length > 0) {
        // Merge saved data with our 7-day template
        const merged = DAYS.map(day => {
          const saved = res.data.find(s => s.day_of_week === day);
          return saved
            ? { day_of_week: day, is_active: saved.is_active, start_time: saved.start_time?.slice(0, 5) || '09:00', end_time: saved.end_time?.slice(0, 5) || '17:00' }
            : { day_of_week: day, is_active: false, start_time: '09:00', end_time: '17:00' };
        });
        setSlots(merged);
      }
    } catch (err) {
      console.error('Could not fetch availability:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDay = (index) => {
    const updated = [...slots];
    updated[index] = { ...updated[index], is_active: !updated[index].is_active };
    setSlots(updated);
  };

  const updateSlot = (index, field, value) => {
    const updated = [...slots];
    updated[index] = { ...updated[index], [field]: value };
    setSlots(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMsg({ type: '', text: '' });
    try {
      // Format time fields: active days need HH:MM, inactive can be null
      const payload = slots.map(s => ({
        day_of_week: s.day_of_week,
        is_active: s.is_active,
        start_time: s.is_active ? s.start_time : null,
        end_time: s.is_active ? s.end_time : null,
      }));
      await api.post('specialist/availability/', payload);
      setSaveMsg({ type: 'success', text: 'Availability saved successfully! Patients can now book your open slots.' });
    } catch (err) {
      setSaveMsg({ type: 'error', text: 'Failed to save. Please try again.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMsg({ type: '', text: '' }), 5000);
    }
  };

  const activeCount = slots.filter(s => s.is_active).length;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />

      <div style={{ paddingTop: '100px', maxWidth: '860px', margin: '0 auto', padding: '120px 2rem 4rem' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#021B27', color: 'white', padding: '6px 16px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1.5px', marginBottom: '1.5rem' }}>
            <CalendarCheck size={14} /> SCHEDULE MANAGER
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#021B27', fontFamily: 'var(--font-heading)', marginBottom: '0.75rem' }}>
            Set Your Availability
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
            Toggle the days you are available and define your working hours. Patients will only see and book these open slots.
          </p>
        </div>

        {/* Summary Bar */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem 2rem', border: '1px solid #e2e8f0', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: activeCount > 0 ? '#f0fdf4' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarCheck size={22} color={activeCount > 0 ? '#88B699' : '#94a3b8'} />
            </div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '1.5rem', color: '#021B27' }}>{activeCount}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Active Days</div>
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#64748b' }}>
            <Info size={16} /> Toggle a day to mark it as available for patient bookings.
          </div>
        </div>

        {/* Save Message */}
        {saveMsg.text && (
          <div style={{
            padding: '1rem 1.5rem', borderRadius: '14px', marginBottom: '2rem', fontWeight: '600',
            background: saveMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
            color: saveMsg.type === 'success' ? '#15803d' : '#b91c1c',
            border: `1px solid ${saveMsg.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            <CheckCircle size={18} color={saveMsg.type === 'success' ? '#15803d' : '#b91c1c'} />
            {saveMsg.text}
          </div>
        )}

        {/* Day Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading your schedule...</div>
          ) : (
            slots.map((slot, index) => (
              <div
                key={slot.day_of_week}
                style={{
                  background: 'white',
                  border: `2px solid ${slot.is_active ? '#88B699' : '#e2e8f0'}`,
                  borderRadius: '20px',
                  padding: '1.5rem 2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  transition: 'all 0.25s ease',
                  boxShadow: slot.is_active ? '0 4px 20px rgba(136, 182, 153, 0.12)' : 'none',
                  flexWrap: 'wrap'
                }}
              >
                {/* Toggle Button */}
                <button
                  onClick={() => toggleDay(index)}
                  style={{
                    width: '52px', height: '28px',
                    borderRadius: '99px',
                    background: slot.is_active ? '#88B699' : '#e2e8f0',
                    border: 'none', cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.25s ease',
                    flexShrink: 0
                  }}
                  aria-label={`Toggle ${slot.day_of_week}`}
                >
                  <div style={{
                    position: 'absolute',
                    top: '4px',
                    left: slot.is_active ? '28px' : '4px',
                    width: '20px', height: '20px',
                    borderRadius: '50%',
                    background: 'white',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                    transition: 'left 0.25s ease'
                  }} />
                </button>

                {/* Day Label */}
                <div style={{ minWidth: '110px' }}>
                  <div style={{ fontWeight: '800', color: slot.is_active ? '#021B27' : '#94a3b8', fontSize: '1rem' }}>{slot.day_of_week}</div>
                  <div style={{ fontSize: '0.75rem', color: slot.is_active ? '#88B699' : '#cbd5e1', fontWeight: '600', marginTop: '2px' }}>
                    {slot.is_active ? 'Available' : 'Off / Unavailable'}
                  </div>
                </div>

                {/* Time Inputs */}
                {slot.is_active ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Clock size={16} color="#88B699" />
                      <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>From</label>
                      <input
                        type="time"
                        value={slot.start_time}
                        onChange={e => updateSlot(index, 'start_time', e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', color: '#021B27', fontWeight: '700', fontSize: '0.95rem', outline: 'none', background: '#f8fafc' }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>To</label>
                      <input
                        type="time"
                        value={slot.end_time}
                        onChange={e => updateSlot(index, 'end_time', e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', color: '#021B27', fontWeight: '700', fontSize: '0.95rem', outline: 'none', background: '#f8fafc' }}
                      />
                    </div>
                    <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#88B699', fontWeight: '700', background: '#f0fdf4', padding: '4px 12px', borderRadius: '8px' }}>
                      {/* Duration calc */}
                      {(() => {
                        const [sh, sm] = slot.start_time.split(':').map(Number);
                        const [eh, em] = slot.end_time.split(':').map(Number);
                        const diff = (eh * 60 + em) - (sh * 60 + sm);
                        return diff > 0 ? `${Math.floor(diff / 60)}h ${diff % 60}m` : '—';
                      })()}
                    </div>
                  </div>
                ) : (
                  <div style={{ flex: 1, fontSize: '0.9rem', color: '#cbd5e1', fontStyle: 'italic' }}>
                    Toggle to set working hours
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: '#021B27', color: 'white',
              padding: '1.2rem 3rem', borderRadius: '16px',
              fontWeight: '800', fontSize: '1rem', border: 'none',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.7 : 1,
              boxShadow: '0 8px 20px rgba(2, 27, 39, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            {isSaving ? <Clock size={20} className="animate-spin" /> : <Save size={20} />}
            {isSaving ? 'Saving...' : 'Save Availability'}
          </button>
        </div>
      </div>
    </div>
  );
}
