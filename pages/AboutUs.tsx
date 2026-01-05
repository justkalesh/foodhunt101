import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Construction } from 'lucide-react';

const AboutUs: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
            <div className="max-w-4xl mx-auto px-4 py-16">
                <div className="text-center py-20">
                    <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <Construction size={48} className="text-primary-500" />
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-semibold mb-6">
                        <Sparkles size={16} />
                        <span>Work in Progress</span>
                    </div>

                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                        About <span className="text-primary-600">Us</span>
                    </h1>

                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-xl mx-auto mb-8">
                        We're working on something exciting! This page is currently under construction.
                    </p>

                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        Food-Hunt is your campus food discovery platform. Find the best vendors, split meals with friends, and never eat alone again.
                    </p>

                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 mt-10 px-8 py-3 rounded-full bg-primary-600 text-white font-bold hover:bg-primary-700 transition-colors"
                    >
                        Go Back Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
