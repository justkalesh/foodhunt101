import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../services/firebase';

const CompleteProfile: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { completeGoogleSignup } = useAuth();
    const firebaseUser = location.state?.firebaseUser;

    const [formData, setFormData] = useState({
        // college_id: '', // No longer needed
        name: '',
        semester: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            // 1. Prefer passed state
            if (firebaseUser) {
                setFormData(prev => ({
                    ...prev,
                    name: firebaseUser.displayName || '',
                }));
                return;
            }

            // 2. Fallback to active session
            const currentUser = auth.currentUser;
            if (currentUser) {
                setFormData(prev => ({
                    ...prev,
                    name: currentUser.displayName || '',
                }));
            } else {
                // 3. No user found, redirect to login
                navigate('/login');
            }
        };

        // Small delay to ensure auth state is initialized if coming from a hard refresh
        // Alternatively, we could rely on onAuthStateChanged but useAuth already does that partially.
        // However, useAuth user object might be null if the firestore doc doesn't exist yet (which is true for new users).
        // So we must rely on the raw firebase auth state.

        // Since auth is initialized asynchronously, we might need to wait for it.
        // But for simplicity in this synchronous check:
        checkAuth();

    }, [firebaseUser, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // if (formData.college_id.length !== 8) {
        //     setError('College ID must be exactly 8 characters.');
        //     return;
        // }

        const userToComplete = firebaseUser || auth.currentUser;
        if (!userToComplete) {
            setError('No authenticated user found.');
            return;
        }

        setLoading(true);
        const res = await completeGoogleSignup(formData, userToComplete);
        setLoading(false);

        if (res.success) {
            navigate('/');
        } else {
            setError(res.message);
        }
    };



    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full bg-white dark:bg-dark-800 p-8 rounded-2xl shadow-lg border dark:border-gray-700">
                <h2 className="text-3xl font-bold mb-2 text-center text-gray-900 dark:text-white">Complete Profile</h2>
                <p className="text-center text-gray-500 mb-6">Please provide a few more details.</p>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">College ID (8 chars)</label>
                        <input
                            name="college_id" type="text" maxLength={8} required
                            className="w-full p-3 border rounded-lg dark:bg-dark-900 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            placeholder="e.g. 20230001"
                            value={formData.college_id} onChange={handleChange}
                        />
                    </div> */}

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
                        {loading ? 'Save & Continue' : 'Complete Signup'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CompleteProfile;
