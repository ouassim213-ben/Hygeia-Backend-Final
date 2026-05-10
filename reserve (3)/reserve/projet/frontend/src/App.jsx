import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';
import Feed from './pages/Feed';
import SocialFeed from './pages/SocialFeed';
import AITracker from './pages/AITracker';
import Auth from './pages/Auth';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Appointments from './pages/Appointments';
import About from './pages/About';
import Home from './pages/Home';
import SpecialistProfile from './pages/SpecialistProfile';
import AdminDashboard from './pages/AdminDashboard';
import NutritionistDashboard from './pages/NutritionistDashboard';
import SpecialistDashboard from './pages/SpecialistDashboard';
import Plans from './pages/Plans';
import BookingSummary from './pages/BookingSummary';
import Success from './pages/Success';
import AdminInbox from './pages/AdminInbox';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';
import FreePlanDetail from './pages/FreePlanDetail';
import NutritionistSchedule from './pages/NutritionistSchedule';
import MyPatients from './pages/MyPatients';
import MedicalIntakeForm from './pages/MedicalIntakeForm';
import ScrollToTop from './components/ScrollToTop';
import Chatbot from './components/HygeiaChatbot';

export default function App() {
  return (
    
    <ThemeProvider>
      <UserProvider>
        <Router>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/publications" element={<SocialFeed />} />
          <Route path="/free-plans/:id" element={<FreePlanDetail />} />

          {/* Protected Routes */}
          <Route path="/schedule" element={<ProtectedRoute><NutritionistSchedule /></ProtectedRoute>} />
          <Route path="/my-patients" element={<ProtectedRoute><MyPatients /></ProtectedRoute>} />
          <Route 
            path="/feed" 
            element={
              <ProtectedRoute>
                <SocialFeed />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/ai-tracker" 
            element={
              <ProtectedRoute>
                <AITracker />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/appointments" 
            element={
              <ProtectedRoute>
                <Appointments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/specialist/:id" 
            element={
              <ProtectedRoute>
                <SpecialistProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/subscription" 
            element={
              <Navigate to="/plans" replace />
            } 
          />
          <Route 
            path="/plans" 
            element={
              <ProtectedRoute>
                <Plans />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/medical-intake" 
            element={
              <ProtectedRoute>
                <MedicalIntakeForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/booking-summary" 
            element={
              <ProtectedRoute>
                <BookingSummary />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/success" 
            element={
              <ProtectedRoute>
                <Success />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin-dashboard" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin-chat" 
            element={
              <AdminRoute>
                <AdminInbox />
              </AdminRoute>
            } 
          />
          <Route 
            path="/dashboard/messages" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          
          {/* Nutritionist Protected Routes */}
          <Route 
            path="/dashboard/nutritionist" 
            element={
              <Navigate to="/publications" replace />
            } 
          />
          <Route 
            path="/manage-schedule" 
            element={
              <ProtectedRoute>
                <SpecialistDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-patients" 
            element={
              <ProtectedRoute>
                <NutritionistDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/consultations" 
            element={
              <ProtectedRoute>
                <NutritionistDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/meal-plans" 
            element={
              <ProtectedRoute>
                <NutritionistDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Redirects & Fallbacks */}
          <Route path="/auth" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        </Router>
      </UserProvider>
    </ThemeProvider>
  );
}
