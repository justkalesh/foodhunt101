import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

const CookieBanner: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('foodhunt_cookie_consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('foodhunt_cookie_consent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-gray-700 shadow-lg p-4 z-50 animate-slide-up">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 text-center md:text-left">
                    We use cookies and store data to connect you with friends. By using Food-Hunt, you agree to our{' '}
                    <Link to="/privacy" className="text-primary-600 hover:underline font-medium">Privacy Policy</Link>
                    {' '}and{' '}
                    <Link to="/terms" className="text-primary-600 hover:underline font-medium">Terms</Link>.
                </p>
                <button
                    onClick={handleAccept}
                    className="whitespace-nowrap bg-primary-600 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-primary-700 transition shadow-sm"
                >
                    I Agree
                </button>
            </div>
        </div>
    );
};

export default CookieBanner;
