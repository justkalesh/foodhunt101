
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CompleteProfile from './pages/CompleteProfile';
import VendorList from './pages/VendorList';
import VendorDetail from './pages/VendorDetail';
import MealSplits from './pages/MealSplits';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminVendors from './pages/AdminVendors';
import AdminUsers from './pages/AdminUsers';

// Mock empty pages for routing completion
import Inbox from './pages/Inbox';

import { useLocation } from 'react-router-dom';

const AppContent: React.FC = () => {
  const location = useLocation();
  const showChatbot = location.pathname !== '/inbox';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-orange-50/30 dark:bg-none dark:bg-dark-900 transition-colors duration-200">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/vendors" element={<VendorList />} />
        <Route path="/vendors/:id" element={<VendorDetail />} />
        <Route path="/splits" element={<MealSplits />} />
        <Route path="/profile" element={<Profile />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/vendors" element={<AdminVendors />} />
        <Route path="/admin/users" element={<AdminUsers />} />

        <Route path="/inbox" element={<Inbox />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showChatbot && <Chatbot />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
