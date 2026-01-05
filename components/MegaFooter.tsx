import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Instagram } from 'lucide-react';

const MegaFooter: React.FC = () => {
    return (
        <footer className="bg-slate-950 text-gray-300">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">
                            Food-Hunt
                        </h2>
                        <p className="text-gray-400 text-sm">Find Food. Find Friends.</p>
                        <div className="flex items-center gap-4 pt-2">
                            <a
                                href="https://github.com/justkalesh"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-full bg-slate-800 hover:bg-primary-600 transition-colors duration-200"
                                aria-label="GitHub"
                            >
                                <Github size={20} className="text-gray-300 hover:text-white" />
                            </a>
                            <a
                                href="https://www.linkedin.com/in/justkalesh/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-full bg-slate-800 hover:bg-primary-600 transition-colors duration-200"
                                aria-label="LinkedIn"
                            >
                                <Linkedin size={20} className="text-gray-300 hover:text-white" />
                            </a>
                            <a
                                href="https://www.instagram.com/kalash.hu/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-full bg-slate-800 hover:bg-primary-600 transition-colors duration-200"
                                aria-label="Instagram"
                            >
                                <Instagram size={20} className="text-gray-300 hover:text-white" />
                            </a>
                        </div>
                    </div>

                    {/* Product Column */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Product</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    to="#features"
                                    className="text-gray-400 hover:text-primary-500 transition-colors duration-200 text-sm"
                                >
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/vendors"
                                    className="text-gray-400 hover:text-primary-500 transition-colors duration-200 text-sm"
                                >
                                    Vendor Lists
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/splits"
                                    className="text-gray-400 hover:text-primary-500 transition-colors duration-200 text-sm"
                                >
                                    Meal Splits
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/vendors?hiddenGems=true"
                                    className="text-gray-400 hover:text-primary-500 transition-colors duration-200 text-sm"
                                >
                                    Hidden Gems
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Company Column */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Company</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    to="/about"
                                    className="text-gray-400 hover:text-primary-500 transition-colors duration-200 text-sm"
                                >
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/team"
                                    className="text-gray-400 hover:text-primary-500 transition-colors duration-200 text-sm"
                                >
                                    Our Team
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/careers"
                                    className="text-gray-400 hover:text-primary-500 transition-colors duration-200 text-sm"
                                >
                                    Careers
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal & Support Column */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Legal & Support</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    to="/help"
                                    className="text-gray-400 hover:text-primary-500 transition-colors duration-200 text-sm"
                                >
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/privacy"
                                    className="text-gray-400 hover:text-primary-500 transition-colors duration-200 text-sm"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/terms"
                                    className="text-gray-400 hover:text-primary-500 transition-colors duration-200 text-sm"
                                >
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Copyright Bar */}
            <div className="border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <p className="text-center text-gray-500 text-sm">
                        © 2026 Food-Hunt. Built for LPU.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default MegaFooter;
