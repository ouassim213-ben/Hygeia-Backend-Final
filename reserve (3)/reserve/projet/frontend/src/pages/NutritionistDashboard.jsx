import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { User, Calendar, MessageSquare, TrendingUp, Star, Award } from 'lucide-react';

export default function NutritionistDashboard() {
  const firstName = localStorage.getItem('firstName') || 'Specialist';
  const lastName = localStorage.getItem('lastName') || '';
  const role = localStorage.getItem('userRole') || 'Nutritionist';

  const navy = '#102a43';
  const gold = '#f0c27b';

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: '#f0f4f8', minHeight: '100vh', paddingTop: '100px', paddingBottom: '3rem' }}>
        <div className="container animate-fade">
          {/* Header Section (Legacy Dashboard - Replaced by Publications Landing)
          <div style={{ 
            backgroundColor: navy, 
            borderRadius: '24px', 
            padding: '3rem', 
            color: 'white', 
            marginBottom: '2rem',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(16, 42, 67, 0.2)'
          }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1rem' }}>
                <span style={{ backgroundColor: gold, padding: '5px 15px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: '#102a43' }}>
                  Professional Portal
                </span>
              </div>
              <h1 style={{ fontSize: '2.8rem', fontFamily: 'serif', margin: 0 }}>
                Welcome, Dr. {firstName} {lastName}
              </h1>
              <p style={{ fontSize: '1.2rem', opacity: 0.8, marginTop: '10px', maxWidth: '600px' }}>
                Manage your practice, connect with patients, and track your professional impact on Hygeia.
              </p>
            </div>
            
            <div style={{ 
              position: 'absolute', 
              top: '-50px', 
              right: '-50px', 
              width: '300px', 
              height: '300px', 
              backgroundColor: gold, 
              opacity: 0.1, 
              borderRadius: '50%' 
            }}></div>
          </div>
          */}

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <StatCard icon={<User color={gold} />} label="Total Patients" value="24" trend="+3 this week" />
            <StatCard icon={<Calendar color={gold} />} label="Appointments" value="8" trend="Next: 2:00 PM" />
            <StatCard icon={<MessageSquare color={gold} />} label="Unread Messages" value="12" trend="High priority" />
            <StatCard icon={<Award color={gold} />} label="Rating" value="4.9" trend="Top 5% Expert" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            {/* Main Content Area */}
            <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', color: navy, margin: 0, fontFamily: 'serif' }}>Recent Patient Activity</h2>
                <button style={{ background: 'none', border: 'none', color: '#f0c27b', fontWeight: 'bold', cursor: 'pointer' }}>View All</button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <ActivityItem name="Sarah Johnson" action="Updated logging" time="10 mins ago" color="#e0f2fe" />
                <ActivityItem name="Michael Chen" action="New appointment request" time="45 mins ago" color="#fef3c7" />
                <ActivityItem name="Emma Wilson" action="Completed weekly assessment" time="2 hours ago" color="#dcfce7" />
                <ActivityItem name="James Miller" action="Message regarding meal plan" time="Yesterday" color="#f1f5f9" />
              </div>
            </div>

            {/* Sidebar Area */}
            <div style={{ backgroundColor: navy, borderRadius: '24px', padding: '2rem', color: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '1.3rem', color: gold, marginBottom: '1.5rem', fontFamily: 'serif' }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <ActionButton label="Create New Meal Plan" />
                <ActionButton label="Schedule Consultation" />
                <ActionButton label="Broadcast to Patients" />
                <ActionButton label="Resource Library" outline />
              </div>

              <div style={{ marginTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                   <TrendingUp size={20} color={gold} />
                   <span style={{ fontWeight: 'bold' }}>Monthly Impact</span>
                </div>
                <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '75%', height: '100%', backgroundColor: gold }}></div>
                </div>
                <p style={{ fontSize: '0.85rem', marginTop: '10px', opacity: 0.7 }}>75% of your patients reached their goals this month.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function StatCard({ icon, label, value, trend }) {
  const navy = '#102a43';
  return (
    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div>
        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{label}</div>
        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: navy, margin: '5px 0' }}>{value}</div>
        <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '600' }}>{trend}</div>
      </div>
    </div>
  );
}

function ActivityItem({ name, action, time, color }) {
  const navy = '#102a43';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '1rem', borderRadius: '15px', border: '1px solid #f1f5f9' }}>
      <div style={{ width: '45px', height: '45px', borderRadius: '12px', backgroundColor: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: navy }}>
        {name.charAt(0)}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 'bold', color: navy }}>{name}</div>
        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>{action}</div>
      </div>
      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{time}</div>
    </div>
  );
}

function ActionButton({ label, outline }) {
  const gold = '#f0c27b';
  return (
    <button style={{ 
      width: '100%', 
      padding: '1rem', 
      borderRadius: '12px', 
      backgroundColor: outline ? 'transparent' : gold, 
      color: outline ? 'white' : '#102a43',
      border: outline ? `1px solid rgba(255,255,255,0.3)` : 'none',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'opacity 0.2s ease'
    }}>
      {label}
    </button>
  );
}
