import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api, syncAllVendorRatings } from '../services/mockDatabase';
import { UserRole } from '../types';
import { seedDatabase } from '../services/seeder';
import { Shield, Users, Store, Star, ArrowRight, Database, RefreshCw } from 'lucide-react';
import { PageLoading } from '../components/ui/LoadingSpinner';

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalUsers: 0, totalVendors: 0, totalReviews: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== UserRole.ADMIN) {
            navigate('/login');
            return;
        }
        const fetchStats = async () => {
            const res = await api.admin.getStats();
            if (res.success && res.data) setStats(res.data);
            setLoading(false);
        };
        fetchStats();
    }, [user, navigate]);

    const handleSeed = async () => {
        if (!window.confirm('Add sample data to database?')) return;
        setLoading(true);
        const res = await seedDatabase();
        alert(res.message);

        // Refresh stats
        const statsRes = await api.admin.getStats();
        if (statsRes.success && statsRes.data) setStats(statsRes.data);
        setLoading(false);
    };

    const handleSyncRatings = async () => {
        if (!window.confirm('Sync all vendor ratings from existing reviews?')) return;
        setLoading(true);
        const res = await syncAllVendorRatings();
        alert(res.message);
        setLoading(false);
    };

    if (loading) return <PageLoading message="Loading admin dashboard..." />;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-900 px-4 py-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary-600 p-3 rounded-xl text-white">
                            <Shield size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold dark:text-white">Admin Dashboard</h1>
                            <p className="text-gray-500 dark:text-gray-400">Welcome back, {user?.name}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSyncRatings}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
                        >
                            <RefreshCw size={20} />
                            Sync Ratings
                        </button>
                        <button
                            onClick={handleSeed}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-sm"
                        >
                            <Database size={20} />
                            Seed Database
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</div>
                            <div className="text-3xl font-bold dark:text-white">{stats.totalUsers}</div>
                        </div>
                        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-3 rounded-lg">
                            <Users size={24} />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Vendors</div>
                            <div className="text-3xl font-bold dark:text-white">{stats.totalVendors}</div>
                        </div>
                        <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 p-3 rounded-lg">
                            <Store size={24} />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Reviews</div>
                            <div className="text-3xl font-bold dark:text-white">{stats.totalReviews}</div>
                        </div>
                        <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 p-3 rounded-lg">
                            <Star size={24} />
                        </div>
                    </div>
                </div>

                {/* Navigation Cards */}
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <Link to="/admin/vendors" className="group bg-white dark:bg-dark-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 p-4 rounded-full">
                                <Store size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold dark:text-white group-hover:text-primary-600 transition">Manage Vendors</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Add, edit, or remove food vendors.</p>
                            </div>
                        </div>
                        <ArrowRight className="text-gray-300 group-hover:text-primary-600 transition" />
                    </Link>

                    <Link to="/admin/users" className="group bg-white dark:bg-dark-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 p-4 rounded-full">
                                <Users size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold dark:text-white group-hover:text-indigo-600 transition">Manage Users</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">View users, disable accounts, check loyalty.</p>
                            </div>
                        </div>
                        <ArrowRight className="text-gray-300 group-hover:text-indigo-600 transition" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
