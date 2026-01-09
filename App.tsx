
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import MegaFooter from './components/MegaFooter';
import Chatbot from './components/Chatbot';
import PageTransition from './components/PageTransition';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CompleteProfile from './pages/CompleteProfile';
import VendorList from './pages/VendorList';
import VendorDetail from './pages/VendorDetail';
import MealSplits from './pages/MealSplits';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminVendors from './pages/AdminVendors';
import AdminUsers from './pages/AdminUsers';
import { usePushNotifications } from './hooks/usePushNotifications';
import CookieBanner from './components/CookieBanner';
import { Analytics } from "@vercel/analytics/react";

// WIP Pages
import AboutUs from './pages/AboutUs';
import OurTeam from './pages/OurTeam';
import Careers from './pages/Careers';
import HelpCenter from './pages/HelpCenter';

// Mock empty pages for routing completion
import Inbox from './pages/Inbox';

const AppContent: React.FC = () => {
  const location = useLocation();
  const { needsCompletion, isLoading } = useAuth();
  usePushNotifications(); // Initialize notifications
  const showChatbot = location.pathname !== '/inbox' && location.pathname !== '/complete-profile';
  const showFooter = location.pathname === '/';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (needsCompletion && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-gray-100 transition-colors duration-300 relative overflow-hidden">
      {/* Optimized Static Background - GPU-friendly mesh gradient without blur filters */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 10%, rgba(249, 115, 22, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 85% 20%, rgba(14, 165, 233, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 50% 50% at 10% 60%, rgba(163, 230, 53, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 70% 40% at 80% 80%, rgba(249, 115, 22, 0.08) 0%, transparent 50%)
          `,
          willChange: 'auto',
        }}
      />

      <div className="relative z-10">
        <Navbar />
        <AnimatePresence mode="wait">
          <div key={location.pathname}>
            <Routes location={location}>
              <Route path="/" element={<PageTransition><Home /></PageTransition>} />
              <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
              <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
              <Route path="/complete-profile" element={<PageTransition><CompleteProfile /></PageTransition>} />
              <Route path="/vendors" element={<PageTransition><VendorList /></PageTransition>} />
              <Route path="/vendors/:id" element={<PageTransition><VendorDetail /></PageTransition>} />
              <Route path="/splits" element={<PageTransition><MealSplits /></PageTransition>} />
              <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
              <Route path="/profile/:userId" element={<PageTransition><Profile /></PageTransition>} />

              {/* Admin Routes */}
              <Route path="/admin" element={<PageTransition><AdminDashboard /></PageTransition>} />
              <Route path="/admin/vendors" element={<PageTransition><AdminVendors /></PageTransition>} />
              <Route path="/admin/users" element={<PageTransition><AdminUsers /></PageTransition>} />
              <Route path="/terms" element={<PageTransition><TermsAndConditions /></PageTransition>} />
              <Route path="/privacy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />

              <Route path="/inbox" element={<PageTransition><Inbox /></PageTransition>} />

              {/* WIP Pages */}
              <Route path="/about" element={<PageTransition><AboutUs /></PageTransition>} />
              <Route path="/team" element={<PageTransition><OurTeam /></PageTransition>} />
              <Route path="/careers" element={<PageTransition><Careers /></PageTransition>} />
              <Route path="/help" element={<PageTransition><HelpCenter /></PageTransition>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </AnimatePresence>
        {showChatbot && <Chatbot />}
        {showFooter && <MegaFooter />}
        <CookieBanner />
      </div>
    </div>
  );
};



const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
          <Analytics />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
