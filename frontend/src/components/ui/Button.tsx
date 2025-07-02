import React from 'react'
import { LoadingSpinner } from './LoadingSpinner'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  loadingText?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

const variantClasses = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 shadow-sm',
  outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500',
  ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      className={`
        inline-flex items-center justify-center font-medium rounded-md
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <LoadingSpinner
          size={size === 'sm' ? 'sm' : 'md'}
          color="gray"
          className="mr-2"
        />
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      
      {loading ? (loadingText || children) : children}
      
      {!loading && icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  )
}

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon: React.ReactNode
  tooltip?: string
}

export function IconButton({
  variant = 'ghost',
  size = 'md',
  loading = false,
  icon,
  tooltip,
  className = '',
  ...props
}: IconButtonProps) {
  const sizeClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3',
  }

  return (
    <button
      className={`
        inline-flex items-center justify-center rounded-md
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      title={tooltip}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <LoadingSpinner size={size === 'lg' ? 'md' : 'sm'} color="gray" />
      ) : (
        icon
      )}
    </button>
  )
}

export interface ButtonGroupProps {
  children: React.ReactNode
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

export function ButtonGroup({
  children,
  className = '',
  orientation = 'horizontal',
}: ButtonGroupProps) {
  return (
    <div
      className={`
        inline-flex ${orientation === 'horizontal' ? 'flex-row' : 'flex-col'}
        rounded-md shadow-sm
        ${className}
      `}
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          const isFirst = index === 0
          const isLast = index === React.Children.count(children) - 1
          
          return React.cloneElement(child as React.ReactElement<any>, {
            className: `
              ${child.props.className || ''}
              ${orientation === 'horizontal' 
                ? `${!isFirst ? '-ml-px' : ''} ${!isFirst && !isLast ? 'rounded-none' : ''} ${isFirst ? 'rounded-r-none' : ''} ${isLast ? 'rounded-l-none' : ''}`
                : `${!isFirst ? '-mt-px' : ''} ${!isFirst && !isLast ? 'rounded-none' : ''} ${isFirst ? 'rounded-b-none' : ''} ${isLast ? 'rounded-t-none' : ''}`
              }
            `.trim(),
          })
        }
        return child
      })}
    </div>
  )
}

export default Button