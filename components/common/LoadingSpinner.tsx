import React from 'react';

interface LoadingSpinnerProps {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    color?: 'primary' | 'company' | 'admin' | 'vendor' | 'white' | 'current';
    label?: string;
    className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    color = 'company',
    label,
    className = '',
}) => {
    const sizeClasses = {
        xs: 'h-3 w-3 border-[1.5px]',
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-2',
        lg: 'h-12 w-12 border-b-2',
        xl: 'h-16 w-16 border-b-2',
    };

    const colorClasses = {
        primary: 'border-primary-600',
        company: 'border-company-500',
        admin: 'border-admin-600',
        vendor: 'border-emerald-500',
        white: 'border-white',
        current: 'border-current',
    };

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <div
                className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]} border-t-transparent border-l-transparent border-r-transparent`}
            ></div>
            {label && <p className="mt-4 text-gray-600 font-medium">{label}</p>}
        </div>
    );
};

export default LoadingSpinner;
