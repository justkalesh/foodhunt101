
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ConfirmationModal from './ConfirmationModal';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { UserRole } from '../types';
import { Sun, Moon, Monitor, Utensils, Users, User as UserIcon, LogOut, Menu, Shield } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [showLoginModal, setShowLoginModal] = React.useState(false);

  const isActive = (path: string) => location.pathname === path ? 'text-primary-600 dark:text-primary-500 font-bold' : 'text-gray-600 dark:text-gray-300 hover:text-primary-500';

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun size={20} />;
      case 'dark': return <Moon size={20} />;
      case 'system': return <Monitor size={20} />;
      default: return <Monitor size={20} />;
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-dark-800 shadow-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="bg-white p-1 rounded-lg shadow-sm">
                <img src="/logo.png" alt="Food Hunt Logo" className="h-10 w-10 object-contain" />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">Food-Hunt</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link to="/vendors" className={isActive('/vendors')}>Vendors</Link>
            <Link to="/splits" className={isActive('/splits')}>Meal Splits</Link>
            <Link
              to="/inbox"
              className={isActive('/inbox')}
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  setShowLoginModal(true);
                }
              }}
            >Inbox</Link>

            {user?.role === UserRole.ADMIN && (
              <Link to="/admin" className={`${isActive('/admin')} flex items-center gap-1 text-primary-600 font-bold`}>
                <Shield size={16} /> Admin
              </Link>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
              title={`Current theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`}
            >
              {getThemeIcon()}
            </button>

            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium dark:text-white">{user.name}</span>
                  <span className="text-xs text-primary-600">{user.loyalty_points || 0} pts</span>
                </div>
                <Link to="/profile" className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                  <UserIcon size={20} />
                </Link>
                <button onClick={logout} className="text-red-500 hover:text-red-700">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">Sign In</Link>
                <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
              {getThemeIcon()}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-dark-800 border-t dark:border-gray-700">
          <div className="pt-2 pb-3 space-y-1 px-4">
            <Link to="/vendors" className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200">Vendors</Link>
            <Link to="/splits" className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200">Meal Splits</Link>
            <Link
              to="/inbox"
              className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200"
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  setShowLoginModal(true);
                  setIsMobileMenuOpen(false);
                }
              }}
            >Inbox</Link>
            {user?.role === UserRole.ADMIN && (
              <Link to="/admin" className="block px-3 py-2 text-base font-medium text-red-500">Admin Dashboard</Link>
            )}
            {!user && (
              <>
                <Link to="/login" className="block px-3 py-2 text-primary-600">Sign In</Link>
                <Link to="/register" className="block px-3 py-2 text-primary-600">Register</Link>
              </>
            )}
            {user && (
              <>
                <Link to="/profile" className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200">Profile</Link>
                <button onClick={logout} className="block w-full text-left px-3 py-2 text-red-500">Log Out</button>
              </>
            )}
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onConfirm={() => { setShowLoginModal(false); navigate('/login'); }}
        title="Login Required"
        message="Please sign in to access your inbox and chat with other foodies."
        confirmText="Sign In"
      />
    </nav>
  );
};

export default Navbar;
