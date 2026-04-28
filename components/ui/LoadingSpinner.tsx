import React from 'react';
import { Utensils } from 'lucide-react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    message?: string;
}

const sizeClasses = {
    sm: { container: 'w-10 h-10', icon: 16, border: 'border-2' },
    md: { container: 'w-16 h-16', icon: 24, border: 'border-4' },
    lg: { container: 'w-20 h-20', icon: 32, border: 'border-4' },
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    message
}) => {
    const { container, icon, border } = sizeClasses[size];

    return (
        <div className="flex flex-col justify-center items-center gap-4">
            <div className="relative">
                {/* Spinning orange ring - matches preloader */}
                <div
                    className={`${container} rounded-full animate-spin`}
                    style={{
                        border: `${size === 'sm' ? '2px' : '4px'} solid rgba(234, 88, 12, 0.2)`,
                        borderTopColor: '#ea580c',
                    }}
                />
                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <Utensils className="text-primary-600 dark:text-primary-400" size={icon} />
                </div>
            </div>
            {message && (
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium animate-pulse">
                    {message}
                </p>
            )}
        </div>
    );
};

// Full page loading wrapper — accounts for navbar height (~5rem) so spinner is truly centered
export const PageLoading: React.FC<{ message?: string }> = ({ message }) => (
    <div className="flex justify-center items-center min-h-[calc(100vh-5rem)]">
        <LoadingSpinner size="lg" message={message} />
    </div>
);

export default LoadingSpinner;
