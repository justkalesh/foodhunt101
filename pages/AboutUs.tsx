import React from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    Github,
    Linkedin,
    Instagram,
    Mail,
    ExternalLink,
    Utensils,
    Users,
    MapPin,
    Sparkles
} from 'lucide-react';
import MegaFooter from '../components/MegaFooter';

const AboutUs: React.FC = () => {
    const socialLinks = [
        {
            name: 'LinkedIn',
            url: 'https://www.linkedin.com/in/justkalesh/',
            icon: Linkedin,
            color: 'bg-[#0A66C2] hover:bg-[#094fb3]',
            handle: 'linkedin.com/in/justkalesh'
        },
        {
            name: 'GitHub',
            url: 'https://github.com/justkalesh/',
            icon: Github,
            color: 'bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600',
            handle: 'github.com/justkalesh'
        },
        {
            name: 'Instagram',
            url: 'https://www.instagram.com/kalash.hu/',
            icon: Instagram,
            color: 'bg-gradient-to-br from-[#833AB4] via-[#E4405F] to-[#FCAF45] hover:opacity-90',
            handle: '@kalash.hu'
        },
        {
            name: 'Email',
            url: 'mailto:parth.ie.kalash@gmail.com',
            icon: Mail,
            color: 'bg-[#EA4335] hover:bg-[#d33426]',
            handle: 'parth.ie.kalash@gmail.com'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
            {/* Header with Back Button */}
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-slate-800">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link
                        to="/"
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <ArrowLeft size={24} className="text-gray-700 dark:text-gray-300" />
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">About Us</h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8 pb-0">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-semibold mb-6">
                        <Sparkles size={16} />
                        <span>Campus Food Discovery</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
                        About <span className="text-primary-600">Food-Hunt</span>
                    </h2>

                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Find the best campus food, split meals with friends, and never eat alone again.
                    </p>
                </div>

                {/* Features Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                            <MapPin className="text-primary-600" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Find Vendors</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Discover the best food vendors on campus with reviews, ratings, and menus.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                            <Users className="text-primary-600" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Split Meals</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Connect with fellow students to share meals and save money together.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                            <Utensils className="text-primary-600" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Explore Menus</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Browse complete menus with prices, sizes, and AI-powered search.
                        </p>
                    </div>
                </div>

                {/* Developer Section */}
                <div className="mb-16">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Meet the Developer
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            The person behind Food-Hunt
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-lg overflow-hidden">
                        <div className="p-8 md:p-10">
                            {/* Profile Header */}
                            <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary-500/30 shadow-xl">
                                        <img
                                            src="/developer.jpg"
                                            alt="Kalash"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center shadow-lg">
                                        <Sparkles size={20} className="text-white" />
                                    </div>
                                </div>

                                <div className="text-center md:text-left">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Kalash Mani Tripathi
                                    </h3>
                                    <p className="text-primary-600 dark:text-primary-400 font-medium">
                                        Full Stack Developer
                                    </p>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                        Computer Science Undergraduate
                                    </p>
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="space-y-4 text-gray-700 dark:text-gray-300 mb-8">
                                <p>
                                    Hi, I'm Kalash, a Computer Science undergrad passionate about building efficient software solutions that solve real-world problems.
                                </p>
                                <p>
                                    I developed Food-Hunt to address the common struggle of finding good food on campus and connecting with others who want to share meals. This project showcases modern web development with React, TypeScript, and Firebase.
                                </p>
                                <p>
                                    I'm constantly learning and exploring new technologies. Feel free to connect with me through any of the links below!
                                </p>
                            </div>

                            {/* Social Links */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {socialLinks.map((link) => (
                                    <a
                                        key={link.name}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-3 p-4 rounded-xl text-white transition-all duration-200 ${link.color} group`}
                                    >
                                        <link.icon size={22} />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm">{link.name}</p>
                                            <p className="text-xs opacity-80 truncate">{link.handle}</p>
                                        </div>
                                        <ExternalLink size={16} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="text-center mb-16">
                    <div className="p-8 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white">
                        <h3 className="text-2xl font-bold mb-4">Ready to explore?</h3>
                        <p className="opacity-90 mb-6 max-w-md mx-auto">
                            Start discovering amazing food vendors on campus and connect with fellow food lovers.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/vendors"
                                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-white text-primary-600 font-bold hover:bg-gray-100 transition-colors"
                            >
                                <MapPin size={20} />
                                Explore Vendors
                            </Link>
                            <Link
                                to="/splits"
                                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-primary-800 text-white font-bold hover:bg-primary-900 transition-colors"
                            >
                                <Users size={20} />
                                Join a Split
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mega Footer */}
            <MegaFooter />
        </div>
    );
};

export default AboutUs;
