
import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  containerClassName?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, name, error, className = '', containerClassName = '', ...props }) => {
  return (
    <div className={`mb-4 ${containerClassName}`}>
      <div className="flex items-center">
        <input
          id={name}
          name={name}
          type="checkbox"
          className={`h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary ${className}`}
          {...props}
        />
        <label htmlFor={name} className="ml-2 block text-sm text-gray-900">
          {label}
        </label>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default Checkbox;
    