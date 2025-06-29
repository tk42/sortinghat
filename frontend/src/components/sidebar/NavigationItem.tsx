import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavigationItemProps {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    href: string;
    name: string;
    handleClick: () => void;
    tooltipId?: string;
    badgeCount?: number;
    highlight?: boolean;
}

export const NavigationItem: React.FC<NavigationItemProps> = ({ 
    icon: Icon, 
    href, 
    name, 
    handleClick, 
    tooltipId,
    badgeCount = 0,
    highlight = false
}) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    const linkClasses = `flex items-center p-3 rounded-lg relative group ${
        isActive 
            ? 'bg-blue-100 text-blue-700' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    } ${highlight ? 'ring-2 ring-blue-300 ring-opacity-50' : ''} transition-all duration-200`;

    const iconClasses = `w-6 h-6 mr-3 transition-transform duration-200 ${
        highlight ? 'animate-pulse' : 'group-hover:scale-110'
    }`;

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleClick();
        }
    };

    const content = (
        <>
            <Icon className={iconClasses} />
            <span className="font-medium">{name}</span>
            
            {/* Badge */}
            {badgeCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-bounce">
                    {badgeCount > 9 ? '9+' : badgeCount}
                </span>
            )}
            
            {/* Hover tooltip */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {name}
            </div>
        </>
    );

    if (href === '#') {
        return (
            <button 
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                className={linkClasses}
                data-tooltip={tooltipId}
                aria-label={name}
                tabIndex={0}
            >
                {content}
            </button>
        );
    }

    return (
        <Link 
            href={href} 
            className={linkClasses} 
            onClick={handleClick}
            data-tooltip={tooltipId}
            aria-label={name}
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            {content}
        </Link>
    );
};