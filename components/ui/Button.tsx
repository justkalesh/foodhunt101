import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'solid' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    children: React.ReactNode;
}

const variantClasses = {
    solid: 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white shadow-lg hover:shadow-primary-500/25 btn-shimmer',
    ghost: 'bg-transparent hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary-600 dark:text-primary-400',
    outline: 'bg-transparent border-2 border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20',
};

const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
    md: 'px-5 py-2.5 text-base rounded-xl gap-2',
    lg: 'px-7 py-3.5 text-lg rounded-2xl gap-2.5',
};

const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
};

export const Button: React.FC<ButtonProps> = ({
    variant = 'solid',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    className = '',
    ...props
}) => {
    const isDisabled = disabled || isLoading;

    return (
        <button
            disabled={isDisabled}
            className={`
        inline-flex items-center justify-center font-semibold
        transition-all duration-300 transform active:scale-[0.98]
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        dark:focus:ring-offset-slate-900
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed shadow-none' : 'cursor-pointer'}
        ${className}
      `}
            {...props}
        >
            {isLoading ? (
                <Loader2 className={`${iconSizeClasses[size]} animate-spin`} />
            ) : leftIcon ? (
                <span className={iconSizeClasses[size]}>{leftIcon}</span>
            ) : null}

            <span>{children}</span>

            {!isLoading && rightIcon && (
                <span className={iconSizeClasses[size]}>{rightIcon}</span>
            )}
        </button>
    );
};

export default Button;
