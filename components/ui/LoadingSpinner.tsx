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
                {/* Spinning ring - fixed for dark mode */}
                <div
                    className={`${container} ${border} border-primary-200 dark:border-primary-800 rounded-full animate-spin border-t-primary-600 dark:border-t-primary-500`}
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

// Full page loading wrapper
export const PageLoading: React.FC<{ message?: string }> = ({ message }) => (
    <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" message={message} />
    </div>
);

export default LoadingSpinner;
