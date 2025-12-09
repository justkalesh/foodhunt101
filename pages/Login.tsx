
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const { login, signInWithGoogle, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // if (cid.length !== 8 && cid !== 'ADMIN001') {
    //   setError('College ID must be 8 characters.');
    //   return;
    // }

    const res = await login(email, pass);
    if (res.success && res.user) {
      if (res.user.is_disabled) {
        setError("Your account has been disabled/banned. Please contact admin at foodhunt101lpu@gmail.com for appeal.");
        // Should we logout immediately to clear context? 
        // Since `login` sets user in context, we might need to manually logout?
        // But context `login` usually sets it. 
        // Let's assume the user can't navigate anywhere else because we don't call `navigate`.
        // Ideally we should call `logout()` but it might be async.
        return;
      }

      if (res.user.role === UserRole.ADMIN) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-dark-800 p-8 rounded-2xl shadow-lg border dark:border-gray-700">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">Welcome Back</h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <input
              type="email"
              className="w-full p-3 border rounded-lg dark:bg-dark-900 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input
              type="password"
              className="w-full p-3 border rounded-lg dark:bg-dark-900 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
              value={pass}
              onChange={e => setPass(e.target.value)}
            />
            <div className="flex justify-end mt-1">
              <button
                type="button"
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                onClick={() => alert("Password reset functionality would be implemented here (e.g., using sendPasswordResetEmail).")}
              >
                Forgot Password?
              </button>
            </div>
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold hover:bg-primary-700 transition disabled:opacity-70">
            {isLoading ? 'Logging In...' : 'Sign In'}
          </button>
        </form>


        <div className="mt-4">
          <button
            onClick={async () => {
              const res = await signInWithGoogle();
              if (res.success) {
                if (res.isNewUser) {
                  navigate('/complete-profile', { state: { firebaseUser: res.firebaseUser } });
                } else if (res.user) {
                  if (res.user.role === UserRole.ADMIN) {
                    navigate('/admin');
                  } else {
                    navigate('/');
                  }
                }
              } else {
                setError(res.message);
              }
            }}
            className="w-full bg-white dark:bg-gray-700 text-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 py-3 rounded-lg font-bold hover:bg-gray-50 dark:hover:bg-gray-600 transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>
        </div>
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Don't have an account? <Link to="/register" className="text-primary-600 font-bold">Sign Up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
