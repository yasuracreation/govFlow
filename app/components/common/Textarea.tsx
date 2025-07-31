import React from 'react';

interface TextareaProps {
  label?: string;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  rows?: number;
  autoFocus?: boolean;
}

const Textarea: React.FC<TextareaProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  className = '',
  rows = 4,
  autoFocus = false
}) => {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoFocus={autoFocus}
        rows={rows}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm 
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
          ${error 
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300'
          }
          ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
          resize-vertical
        `}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Textarea;
    