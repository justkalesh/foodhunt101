
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/mockDatabase';
import { Vendor, Review } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Clock, DollarSign, Star, ChevronLeft, Send, Flame, BarChart, Trash2, Eye, X, Phone } from 'lucide-react';

const VendorDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();

    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    // New Review State
    const [newRating, setNewRating] = useState(5);
    const [newReviewText, setNewReviewText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [showMenuModal, setShowMenuModal] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Initial image index reset when modal opens
    useEffect(() => {
        if (showMenuModal) setCurrentImageIndex(0);
    }, [showMenuModal]);

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            const vRes = await api.vendors.getById(id);
            if (vRes.success && vRes.data) setVendor(vRes.data);

            const rRes = await api.vendors.getReviews(id);
            if (rRes.success && rRes.data) setReviews(rRes.data);

            setLoading(false);
        };
        fetchData();
    }, [id]);

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !id) return;
        setSubmitting(true);
        const res = await api.vendors.addReview(id, user.id, newRating, newReviewText);
        if (res.success && res.data) {
            setReviews([res.data, ...reviews]); // Prepend new review
            setNewReviewText('');
            // Update average locally for immediate feedback
            if (vendor) {
                const newCount = (vendor.rating_count || 0) + 1;
                const newAvg = ((vendor.rating_avg || 0) * (vendor.rating_count || 0) + newRating) / newCount;
                setVendor({ ...vendor, rating_avg: parseFloat(newAvg.toFixed(1)), rating_count: newCount });
            }
        }
        setSubmitting(false);
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (!window.confirm("Delete this review?")) return;
        const res = await api.vendors.deleteReview(reviewId);
        if (res.success) {
            setReviews(reviews.filter(r => r.id !== reviewId));
            // Recalculate average locally
            if (vendor) {
                const reviewToDelete = reviews.find(r => r.id === reviewId);
                if (reviewToDelete) {
                    const newCount = (vendor.rating_count || 1) - 1;
                    const oldTotal = (vendor.rating_avg || 0) * (vendor.rating_count || 0);
                    const newAvg = newCount > 0 ? (oldTotal - reviewToDelete.rating) / newCount : 0;
                    setVendor({ ...vendor, rating_avg: parseFloat(newAvg.toFixed(1)), rating_count: newCount });
                }
            }
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center dark:text-white">Loading Vendor Details...</div>;
    if (!vendor) return <div className="p-10 text-center dark:text-white">Vendor not found.</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
            {/* Header Image Area */}
            <div className="relative h-64 md:h-80 w-full">
                <img src={vendor.menu_image_urls?.[0] || vendor.logo_url} alt={vendor.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="max-w-7xl mx-auto">
                        <Link to="/vendors" className="text-white/80 hover:text-white flex items-center gap-1 text-sm mb-2"><ChevronLeft size={16} /> Back to List</Link>
                        <div className="flex items-center gap-4 mb-2">
                            {vendor.logo_url && (
                                <img src={vendor.logo_url} alt="Logo" className="w-16 h-16 rounded-full border-2 border-white shadow-lg object-cover" />
                            )}
                            <h1 className="text-3xl md:text-5xl font-bold text-white">{vendor.name}</h1>
                        </div>
                        <div className="flex flex-wrap gap-4 text-white/90 text-sm font-medium">
                            <span className="flex items-center gap-1"><MapPin size={16} /> {vendor.location}</span>
                            {vendor.contact_number && (
                                <span className="flex items-center gap-1"><Phone size={16} /> {vendor.contact_number}</span>
                            )}
                            <span className="flex items-center gap-1"><Flame size={16} /> Rush: <span className="uppercase">{vendor.rush_level}</span></span>
                            <span className="flex items-center gap-1"><BarChart size={16} /> Popularity: {vendor.popularity_score}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-8">

                {/* Left: Details & Menu Info */}
                <div className="md:col-span-2 space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-white to-orange-50/50 dark:bg-none dark:bg-dark-800 p-4 rounded-xl border dark:border-gray-700 text-center shadow-sm">
                            <div className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-1">Cuisine</div>
                            <div className="font-bold dark:text-white">{vendor.cuisine}</div>
                            <div className="text-xs text-primary-500">{vendor.origin_tag}</div>
                        </div>
                        <div className="bg-gradient-to-br from-white to-orange-50/50 dark:bg-none dark:bg-dark-800 p-4 rounded-xl border dark:border-gray-700 text-center shadow-sm">
                            <div className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-1">Min Price</div>
                            <div className="font-bold text-green-600 text-xl">₹{vendor.lowest_item_price}</div>
                        </div>
                        <div className="bg-gradient-to-br from-white to-orange-50/50 dark:bg-none dark:bg-dark-800 p-4 rounded-xl border dark:border-gray-700 text-center shadow-sm">
                            <div className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-1">Avg Meal</div>
                            <div className="font-bold text-gray-900 dark:text-white text-xl">₹{vendor.avg_price_per_meal}</div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-gradient-to-br from-white to-orange-50/50 dark:bg-none dark:bg-dark-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm">
                        <h2 className="text-xl font-bold mb-3 dark:text-white">About</h2>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{vendor.description}</p>
                    </div>

                    {/* Menu Section (Simplified as per prompt requirements) */}
                    <div className="bg-gradient-to-br from-white to-orange-50/50 dark:bg-none dark:bg-dark-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm">
                        <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2"><DollarSign size={20} /> Menu Highlights</h2>
                        <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 relative group cursor-pointer" onClick={() => setShowMenuModal(true)}>
                            <img src={vendor.menu_image_urls?.[0]} alt="Menu Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <span className="bg-white/90 text-gray-900 px-4 py-2 rounded-full font-bold shadow-lg transform scale-90 group-hover:scale-100 transition-all">
                                    {vendor.menu_image_urls?.length && vendor.menu_image_urls.length > 1 ? `View Full Menu (${vendor.menu_image_urls.length} pages)` : 'View Full Menu'}
                                </span>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowMenuModal(true); }}
                                className="absolute bottom-4 right-4 bg-black/70 hover:bg-black/90 text-white px-3 py-1.5 rounded-full text-xs flex items-center gap-2 transition-colors shadow-lg backdrop-blur-sm"
                            >
                                <Eye size={14} />
                                Menu Preview
                            </button>
                        </div>
                        <div className="mt-4 flex justify-between text-sm text-gray-500 dark:text-gray-400">
                            <span>Lowest Item: <b>₹{vendor.lowest_item_price}</b></span>
                            <span>Average Meal: <b>₹{vendor.avg_price_per_meal}</b></span>
                        </div>
                    </div>
                </div>

                {/* Right: Reviews */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-white to-orange-50/50 dark:bg-none dark:bg-dark-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm sticky top-24">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold dark:text-white">Reviews</h3>
                            <div className="flex items-center gap-1 text-yellow-500 font-bold text-lg">
                                <Star className="fill-current" /> {vendor.rating_avg} <span className="text-gray-400 text-sm font-normal">({vendor.rating_count})</span>
                            </div>
                        </div>

                        {/* Add Review Form */}
                        {user ? (
                            <form onSubmit={handleSubmitReview} className="mb-8 pb-6 border-b dark:border-gray-700">
                                <h4 className="text-sm font-bold mb-2 dark:text-white">Write a Review</h4>
                                <div className="flex gap-2 mb-3">
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <button key={num} type="button" onClick={() => setNewRating(num)} className={`${num <= newRating ? 'text-yellow-400' : 'text-gray-300'} transition-colors`}>
                                            <Star className="fill-current" size={24} />
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    required
                                    value={newReviewText}
                                    onChange={e => setNewReviewText(e.target.value)}
                                    placeholder="How was the food?"
                                    className="w-full p-3 rounded-lg border dark:border-gray-600 dark:bg-dark-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 mb-2"
                                    rows={3}
                                />
                                <button type="submit" disabled={submitting} className="w-full bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 flex justify-center items-center gap-2">
                                    {submitting ? 'Posting...' : <><Send size={16} /> Post Review</>}
                                </button>
                            </form>
                        ) : (
                            <div className="bg-gray-50 dark:bg-dark-900 p-4 rounded-lg text-center text-sm text-gray-500 mb-6">
                                <Link to="/login" className="text-primary-600 font-bold hover:underline">Log in</Link> to write a review.
                            </div>
                        )}

                        {/* Reviews List */}
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                            {reviews.length === 0 ? (
                                <p className="text-center text-gray-400 italic">No reviews yet.</p>
                            ) : (
                                reviews.map(r => (
                                    <div key={r.id} className="pb-4 border-b dark:border-gray-700 last:border-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-gray-900 dark:text-white text-sm">{r.user_name}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
                                                {user?.role === 'admin' && (
                                                    <button onClick={() => handleDeleteReview(r.id)} className="text-red-500 hover:text-red-700">
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex text-yellow-400 text-xs mb-2">
                                            {[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < r.rating ? 'fill-current' : 'text-gray-200 dark:text-gray-700'} />)}
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm">{r.review_text}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* Full Screen Menu Modal */}
            {showMenuModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={() => setShowMenuModal(false)}>
                    <button onClick={() => setShowMenuModal(false)} className="absolute top-4 right-4 text-white/70 hover:text-white z-50">
                        <X size={32} />
                    </button>

                    <div className="relative max-w-full max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={vendor.menu_image_urls?.[currentImageIndex]}
                            alt={`Menu Page ${currentImageIndex + 1}`}
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                        />

                        {vendor.menu_image_urls && vendor.menu_image_urls.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentImageIndex(prev => prev > 0 ? prev - 1 : (vendor.menu_image_urls?.length || 1) - 1);
                                    }}
                                    className="absolute left-[-50px] top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm"
                                >
                                    <ChevronLeft size={32} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentImageIndex(prev => prev < (vendor.menu_image_urls?.length || 1) - 1 ? prev + 1 : 0);
                                    }}
                                    className="absolute right-[-50px] top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm"
                                >
                                    <ChevronLeft size={32} className="rotate-180" />
                                </button>

                                <div className="mt-4 flex gap-2 justify-center">
                                    {vendor.menu_image_urls.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentImageIndex(idx)}
                                            className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/60'}`}
                                        />
                                    ))}
                                </div>
                                <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                                    {currentImageIndex + 1} / {vendor.menu_image_urls.length}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorDetail;
