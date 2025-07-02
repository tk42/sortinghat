import React from 'react'

export interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  className?: string
  children: React.ReactNode
  helpText?: string
}

export function FormField({
  label,
  error,
  required = false,
  className = '',
  children,
  helpText,
}: FormFieldProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {children}
      
      {helpText && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export function Input({ error, className = '', ...props }: InputProps) {
  return (
    <input
      className={`
        w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
        ${error ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
        ${className}
      `}
      {...props}
    />
  )
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export function Textarea({ error, className = '', ...props }: TextareaProps) {
  return (
    <textarea
      className={`
        w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 resize-vertical
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
        ${error ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
        ${className}
      `}
      {...props}
    />
  )
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
  options: Array<{ value: string | number; label: string; disabled?: boolean }>
  placeholder?: string
}

export function Select({ 
  error, 
  className = '', 
  options, 
  placeholder,
  children,
  ...props 
}: SelectProps) {
  return (
    <select
      className={`
        w-full px-3 py-2 border rounded-md shadow-sm bg-white
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
        ${error ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
        ${className}
      `}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option 
          key={option.value} 
          value={option.value} 
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
      {children}
    </select>
  )
}

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: boolean
}

export function Checkbox({ label, error, className = '', ...props }: CheckboxProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <input
        type="checkbox"
        className={`
          h-4 w-4 rounded border-gray-300 text-blue-600 shadow-sm
          focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50
          ${error ? 'border-red-300' : ''}
        `}
        {...props}
      />
      <label className="ml-2 block text-sm text-gray-700">
        {label}
      </label>
    </div>
  )
}

export interface RadioGroupProps {
  name: string
  options: Array<{ value: string; label: string; disabled?: boolean }>
  value?: string
  onChange?: (value: string) => void
  error?: boolean
  className?: string
}

export function RadioGroup({
  name,
  options,
  value,
  onChange,
  error,
  className = '',
}: RadioGroupProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {options.map((option) => (
        <div key={option.value} className="flex items-center">
          <input
            type="radio"
            id={`${name}-${option.value}`}
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={option.disabled}
            className={`
              h-4 w-4 border-gray-300 text-blue-600 shadow-sm
              focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50
              ${error ? 'border-red-300' : ''}
            `}
          />
          <label 
            htmlFor={`${name}-${option.value}`}
            className="ml-2 block text-sm text-gray-700"
          >
            {option.label}
          </label>
        </div>
      ))}
    </div>
  )
}

export default FormField