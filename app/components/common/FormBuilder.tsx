 import React from 'react';
import { FieldDefinition } from '@/types';
import Input from './Input';
import Textarea from './Textarea';
import Select from './Select';
import Checkbox from './Checkbox';

interface FormBuilderProps {
  fields: FieldDefinition[];
  data: Record<string, any>;
  onDataChange: (data: Record<string, any>) => void;
  readOnly?: boolean;
}

const FormBuilder: React.FC<FormBuilderProps> = ({ fields, data, onDataChange, readOnly = false }) => {
  
  const handleInputChange = (name: string, value: any) => {
    onDataChange({ ...data, [name]: value });
  };

  const renderField = (field: FieldDefinition) => {
    const { id, name, type, label, placeholder, options, required } = field;
    const value = data[name] || '';

    switch (type) {
      case 'text':
      case 'number':
      case 'date':
      case 'email':
      case 'phone':
        return (
          <Input
            key={id}
            label={label}
            name={name}
            type={type === 'phone' ? 'tel' : type}
            value={value}
            onChange={(e) => handleInputChange(name, e.target.value)}
            placeholder={placeholder}
            required={required}
            disabled={readOnly}
          />
        );
      case 'textarea':
        return (
          <Textarea
            key={id}
            label={label}
            name={name}
            value={value}
            onChange={(e) => handleInputChange(name, e.target.value)}
            placeholder={placeholder}
            required={required}
            disabled={readOnly}
          />
        );
      case 'select':
        return (
          <Select
            key={id}
            label={label}
            name={name}
            value={value}
            onChange={(e) => handleInputChange(name, e.target.value)}
            options={options || []}
            required={required}
            disabled={readOnly}
          />
        );
      case 'checkbox':
        return (
          <Checkbox
            key={id}
            label={label}
            name={name}
            checked={!!value}
            onChange={(e) => handleInputChange(name, e.target.checked)}
            disabled={readOnly}
          />
        );
      case 'radio':
         return (
          <div key={id}>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="mt-2 space-y-2">
              {(options || []).map(option => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name={name}
                    value={option.value}
                    checked={value === option.value}
                    onChange={(e) => handleInputChange(name, e.target.value)}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    disabled={readOnly}
                  />
                  <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
         );
      default:
        return <p key={id} className="text-red-500">Unsupported field type: {type}</p>;
    }
  };

  return (
    <div className="space-y-4">
      {fields.filter(field => field.type !== 'file').map(field => (
        <div key={field.id}>{renderField(field)}</div>
      ))}
    </div>
  );
};

export default FormBuilder;
