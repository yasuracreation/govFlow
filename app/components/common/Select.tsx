import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  disabled = false,
  error,
  className = ''
}) => {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm 
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
          ${error 
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300'
          }
          ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
        `}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Select;
    