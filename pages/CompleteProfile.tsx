
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import AadhaarVerification from '../components/AadhaarVerification';

const CompleteProfile: React.FC = () => {
    const navigate = useNavigate();
    const { completeGoogleSignup } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        semester: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showVerification, setShowVerification] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setFormData(prev => ({
                    ...prev,
                    name: user.user_metadata?.full_name || '',
                }));

                // Check if profile already exists (e.g., user already pressed Continue
                // but component re-mounted due to AuthContext state changes)
                const { data: profile } = await supabase
                    .from('users')
                    .select('id')
                    .eq('id', user.id)
                    .maybeSingle();

                if (profile) {
                    // Profile already exists — skip to verification
                    setShowVerification(true);
                }
            } else {
                navigate('/login');
            }
        };
        checkAuth();
    }, [navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setError('No authenticated user found.');
            return;
        }

        setLoading(true);
        const res = await completeGoogleSignup(formData, user);
        setLoading(false);

        if (res.success) {
            // Show verification step instead of navigating immediately
            setShowVerification(true);
        } else {
            setError(res.message);
        }
    };

    // Verification step
    if (showVerification) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
                <div className="max-w-md w-full">
                    {/* Step indicator */}
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <div className="flex items-center gap-1.5">
                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">✓</div>
                            <span className="text-sm text-green-600 font-medium hidden sm:inline">Profile</span>
                        </div>
                        <div className="w-8 h-0.5 bg-green-500" />
                        <div className="flex items-center gap-1.5">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">2</div>
                            <span className="text-sm text-blue-600 font-medium hidden sm:inline">Verify</span>
                        </div>
                    </div>

                    <AadhaarVerification
                        inline
                        onVerified={() => {
                            setTimeout(() => navigate('/'), 1500);
                        }}
                        onClose={() => navigate('/')}
                        onSkip={() => navigate('/')}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full bg-white dark:bg-dark-800 p-8 rounded-2xl shadow-lg border dark:border-gray-700">
                {/* Step indicator */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    <div className="flex items-center gap-1.5">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">1</div>
                        <span className="text-sm text-blue-600 font-medium hidden sm:inline">Profile</span>
                    </div>
                    <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600" />
                    <div className="flex items-center gap-1.5">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 text-sm font-bold">2</div>
                        <span className="text-sm text-gray-400 font-medium hidden sm:inline">Verify</span>
                    </div>
                </div>

                <h2 className="text-3xl font-bold mb-2 text-center text-gray-900 dark:text-white">Complete Profile</h2>
                <p className="text-center text-gray-500 mb-6">Please provide a few more details.</p>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                        <input
                            name="name" type="text" required
                            className="w-full p-3 border rounded-lg dark:bg-dark-900 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            placeholder="Jane Doe"
                            value={formData.name} onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semester</label>
                        <select
                            name="semester" required
                            className="w-full p-3 border rounded-lg dark:bg-dark-900 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            value={formData.semester} onChange={handleChange}
                        >
                            <option value="">Select Semester</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>

                    <button
                        type="submit" disabled={loading}
                        className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold hover:bg-primary-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Continue →'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CompleteProfile;

