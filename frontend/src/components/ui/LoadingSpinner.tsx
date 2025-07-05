import React from 'react'

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'blue' | 'gray' | 'green' | 'red' | 'yellow' | 'purple'
  text?: string
  className?: string
  overlay?: boolean
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
}

const colorClasses = {
  blue: 'border-blue-600',
  gray: 'border-gray-600',
  green: 'border-green-600',
  red: 'border-red-600',
  yellow: 'border-yellow-600',
  purple: 'border-purple-600',
}

export function LoadingSpinner({
  size = 'md',
  color = 'blue',
  text,
  className = '',
  overlay = false,
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`
          animate-spin rounded-full border-b-2 border-t-2 border-r-2 border-l-transparent
          ${sizeClasses[size]} ${colorClasses[color]}
        `}
      />
      {text && (
        <span className={`ml-2 text-gray-600 ${size === 'sm' ? 'text-sm' : ''}`}>
          {text}
        </span>
      )}
    </div>
  )

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {spinner}
      </div>
    )
  }

  return spinner
}

export interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'gray' | 'green' | 'red' | 'yellow' | 'purple'
  className?: string
}

export function LoadingDots({
  size = 'md',
  color = 'blue',
  className = '',
}: LoadingDotsProps) {
  const dotSizes = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  }

  const dotColors = {
    blue: 'bg-blue-600',
    gray: 'bg-gray-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600',
    purple: 'bg-purple-600',
  }

  return (
    <div className={`flex space-x-1 ${className}`}>
      <div
        className={`${dotSizes[size]} ${dotColors[color]} rounded-full animate-bounce`}
        style={{ animationDelay: '0ms' }}
      />
      <div
        className={`${dotSizes[size]} ${dotColors[color]} rounded-full animate-bounce`}
        style={{ animationDelay: '150ms' }}
      />
      <div
        className={`${dotSizes[size]} ${dotColors[color]} rounded-full animate-bounce`}
        style={{ animationDelay: '300ms' }}
      />
    </div>
  )
}

export interface SkeletonProps {
  className?: string
  lines?: number
  height?: string
}

export function Skeleton({
  className = '',
  lines = 1,
  height = 'h-4',
}: SkeletonProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={`bg-gray-200 rounded ${height} ${i > 0 ? 'mt-2' : ''}`}
          style={{ width: i === lines - 1 && lines > 1 ? '75%' : '100%' }}
        />
      ))}
    </div>
  )
}

export interface LoadingCardProps {
  title?: string
  description?: string
  className?: string
}

export function LoadingCard({
  title = '読み込み中...',
  description,
  className = '',
}: LoadingCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-center mb-4">
        <LoadingSpinner size="lg" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </div>
    </div>
  )
}

export default LoadingSpinner