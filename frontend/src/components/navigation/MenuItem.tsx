// Shared menu item button component
'use client';

import React from 'react';

interface MenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean; // highlight state (for HeadlessUI Menu)
  danger?: boolean; // styles for destructive actions like Logout
}

const MenuItem = React.forwardRef<HTMLButtonElement, MenuItemProps>(
  (
    {
      icon,
      label,
      onClick,
      active = false,
      danger = false,
      className = '',
      ...rest
    },
    ref
  ) => {
    const baseColor = danger
      ? 'text-red-600 hover:bg-red-50'
      : 'text-gray-700 hover:bg-gray-50';
    const iconColor = danger ? 'text-red-500' : 'text-gray-500';

    return (
      <button
        ref={ref}
        onClick={onClick}
        className={`${active ? 'bg-gray-50' : ''} w-full px-4 py-2 text-left text-sm ${baseColor} flex items-center space-x-3 transition-colors ${className}`}
        {...rest}
      >
        <div className={iconColor}>{icon}</div>
        <span>{label}</span>
      </button>
    );
  }
);

MenuItem.displayName = 'MenuItem';

export default MenuItem;
