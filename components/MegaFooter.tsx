import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Github, Linkedin, Instagram, MapPin } from 'lucide-react';
import { api } from '../services/mockDatabase';

const HARDCODED_LOCATIONS = [
    { name: 'LPU Campus', label: 'Lovely Professional University' },
    { name: 'Jalandhar', label: 'Jalandhar, Punjab' },
    { name: 'Phagwara', label: 'Phagwara, Punjab' },
];

const MegaFooter: React.FC = () => {
    const navigate = useNavigate();
    const [foodCourts, setFoodCourts] = useState<string[]>([]);

    useEffect(() => {
        const fetchLocations = async () => {
            const res = await api.vendors.getAll();
            if (res.success && res.data) {
                const uniqueLocations = Array.from(
                    new Set(res.data.map(v => v.location).filter(Boolean))
                );
                setFoodCourts(uniqueLocations);
            }
        };
        fetchLocations();
    }, []);

    const handleHelpCenter = async () => {
        // Search for admin account by UID and navigate to inbox
        const res = await api.users.search('170467');
        if (res.success && res.data) {
            navigate(`/inbox?userId=${res.data.id}&userName=${encodeURIComponent(res.data.name || 'Food-Hunt Team')}`);
        } else {
            // Fallback to hardcoded email if UID lookup fails
            navigate('/inbox?userId=foodhunt101lpu@gmail.com&userName=Food-Hunt%20Team');
        }
    };

    return (
        <footer className="bg-gray-100 dark:bg-slate-950 text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-slate-800">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Food-Hunt
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Find Food. Find Friends.</p>
                        <div className="flex items-center gap-4 pt-2">
                            <a
                                href="https://github.com/justkalesh"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-full bg-gray-200 dark:bg-slate-800 hover:bg-primary-600 hover:text-white transition-colors duration-200"
                                aria-label="GitHub"
                            >
                                <Github size={20} className="text-gray-600 dark:text-gray-300" />
                            </a>
                            <a
                                href="https://www.linkedin.com/in/justkalesh/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-full bg-gray-200 dark:bg-slate-800 hover:bg-primary-600 hover:text-white transition-colors duration-200"
                                aria-label="LinkedIn"
                            >
                                <Linkedin size={20} className="text-gray-600 dark:text-gray-300" />
                            </a>
                            <a
                                href="https://www.instagram.com/kalash.who/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-full bg-gray-200 dark:bg-slate-800 hover:bg-primary-600 hover:text-white transition-colors duration-200"
                                aria-label="Instagram"
                            >
                                <Instagram size={20} className="text-gray-600 dark:text-gray-300" />
                            </a>
                        </div>
                    </div>

                    {/* Product Column */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Product</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    to="#features"
                                    className="text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors duration-200 text-sm"
                                >
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/vendors"
                                    className="text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors duration-200 text-sm"
                                >
                                    Vendor Lists
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/splits"
                                    className="text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors duration-200 text-sm"
                                >
                                    Meal Splits
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/vendors?hiddenGems=true"
                                    className="text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors duration-200 text-sm"
                                >
                                    Hidden Gems
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support & Info Column */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Support & Info</h3>
                        <ul className="space-y-3">
                            <li>
                                <button
                                    onClick={handleHelpCenter}
                                    className="text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors duration-200 text-sm text-left"
                                >
                                    Help Center
                                </button>
                            </li>
                            <li>
                                <Link
                                    to="/faq"
                                    className="text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors duration-200 text-sm"
                                >
                                    FAQs
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/about"
                                    className="text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors duration-200 text-sm"
                                >
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/privacy"
                                    className="text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors duration-200 text-sm"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/terms"
                                    className="text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors duration-200 text-sm"
                                >
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Campus Locations at LPU */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <MapPin size={18} className="text-primary-500" />
                            Campus Locations at LPU
                        </h3>
                        <ul className="space-y-2.5">
                            {/* Hardcoded SEO locations */}
                            {HARDCODED_LOCATIONS.map((loc) => (
                                <li key={loc.name}>
                                    <Link
                                        to={`/vendors?location=${encodeURIComponent(loc.name)}`}
                                        className="text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors duration-200 text-sm flex items-center gap-1.5"
                                    >
                                        <span className="w-1 h-1 rounded-full bg-primary-400 flex-shrink-0" />
                                        {loc.label}
                                    </Link>
                                </li>
                            ))}
                            {/* Dynamic food court locations from database */}
                            {foodCourts.map((loc) => (
                                <li key={loc}>
                                    <Link
                                        to={`/vendors?location=${encodeURIComponent(loc)}`}
                                        className="text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors duration-200 text-sm flex items-center gap-1.5"
                                    >
                                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0" />
                                        {loc}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Copyright Bar */}
            <div className="border-t border-gray-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <p className="text-center text-gray-400 dark:text-gray-500 text-sm">
                        © 2026 Food-Hunt. Built for LPU.
                    </p>
                    <p className="text-center text-gray-300 dark:text-gray-600 text-xs mt-1">
                        Discover the best food near LPU, Phagwara & Jalandhar — campus food vendors, meal splits & more.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default MegaFooter;
