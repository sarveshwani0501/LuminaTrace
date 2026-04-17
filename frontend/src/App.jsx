import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import PrivateLayout from './components/layout/PrivateLayout';
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import OTPVerificationPage from './pages/auth/OTPVerificationPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import InvitePage from './pages/auth/InvitePage';
import Dashboard from './pages/app/Dashboard';
import Metrics from './pages/app/Metrics';
import Logs from './pages/app/Logs';
import Alerts from './pages/app/Alerts';
import Settings from './pages/app/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes with Navbar and Footer */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-otp" element={<OTPVerificationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/password-reset/verify" element={<ResetPasswordPage />} />
          <Route path="/invite/:token" element={<InvitePage />} />
        </Route>
        
        {/* Protected App Routes - Bypassing auth wrapper for current UI development */}
        <Route path="/app" element={<PrivateLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          
          <Route path="metrics" element={<Metrics />} />
          <Route path="logs" element={<Logs />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
