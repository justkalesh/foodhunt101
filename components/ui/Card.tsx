import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'ticket' | 'glass';
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

const variantClasses = {
    default: 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-gray-700',
    ticket: 'ticket-card border border-gray-100 dark:border-gray-700',
    glass: 'glass',
};

const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
};

export const Card: React.FC<CardProps> = ({
    variant = 'default',
    hover = true,
    padding = 'md',
    children,
    className = '',
    ...props
}) => {
    return (
        <div
            className={`
        rounded-2xl overflow-hidden relative
        transition-all duration-300
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${hover ? 'hover-lift' : ''}
        ${className}
      `}
            {...props}
        >
            {/* Ticket punch holes for ticket variant */}
            {variant === 'ticket' && (
                <>
                    <div className="ticket-punch-left" />
                    <div className="ticket-punch-right" />
                </>
            )}

            {children}
        </div>
    );
};

// Sub-components for structured card content
export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    children,
    className = '',
    ...props
}) => (
    <div className={`mb-4 ${className}`} {...props}>
        {children}
    </div>
);

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    children,
    className = '',
    ...props
}) => (
    <div className={`${className}`} {...props}>
        {children}
    </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    children,
    className = '',
    ...props
}) => (
    <div className={`mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 ${className}`} {...props}>
        {children}
    </div>
);

export default Card;
