import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { CustomFieldDefinition } from '../../types';
import { Plus, Edit3, Trash2, Save, X } from 'lucide-react';
import CustomAlert from '../common/CustomAlert';

interface CustomFieldManagerProps {
  customFields: CustomFieldDefinition[];
  onSave: (field: CustomFieldDefinition) => void;
  onDelete: (fieldId: string) => void;
  onUpdate: (field: CustomFieldDefinition) => void;
}

const CustomFieldManager: React.FC<CustomFieldManagerProps> = ({
  customFields,
  onSave,
  onDelete,
  onUpdate
}) => {
  const [editingField, setEditingField] = useState<CustomFieldDefinition | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [alert, setAlert] = useState<{ type: 'error'; message: string; show: boolean } | null>(null);

  const fieldTypeOptions = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'select', label: 'Select' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'file', label: 'File Upload' }
  ];

  const categoryOptions = [
    { value: 'personal', label: 'Personal Information' },
    { value: 'business', label: 'Business Information' },
    { value: 'property', label: 'Property Information' },
    { value: 'vehicle', label: 'Vehicle Information' },
    { value: 'financial', label: 'Financial Information' },
    { value: 'other', label: 'Other' }
  ];

  const handleAddNew = () => {
    const newField: CustomFieldDefinition = {
      id: `field-${Date.now()}`,
      name: '',
      label: '',
      type: 'text',
      category: 'other',
      description: '',
      validation: {
        required: false
      },
      options: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };
    setEditingField(newField);
    setIsAddingNew(true);
  };

  const handleEdit = (field: CustomFieldDefinition) => {
    setEditingField({ ...field });
    setIsAddingNew(false);
  };

  const handleSave = () => {
    if (!editingField) return;
    
    if (!editingField.name.trim() || !editingField.label.trim()) {
      setAlert({ type: 'error', message: 'Name and Label are required', show: true });
      return;
    }

    if (isAddingNew) {
      onSave(editingField);
    } else {
      onUpdate({ ...editingField, updatedAt: new Date().toISOString() });
    }
    
    setEditingField(null);
    setIsAddingNew(false);
  };

  const handleCancel = () => {
    setEditingField(null);
    setIsAddingNew(false);
  };

  const handleFieldChange = (field: keyof CustomFieldDefinition, value: any) => {
    if (!editingField) return;
    setEditingField({ ...editingField, [field]: value });
  };

  const addOption = () => {
    if (!editingField) return;
    const option = { value: '', label: '' };
    setEditingField({
      ...editingField,
      options: [...(editingField.options || []), option]
    });
  };

  const updateOption = (index: number, field: 'value' | 'label', value: string) => {
    if (!editingField) return;
    const updatedOptions = [...(editingField.options || [])];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    setEditingField({ ...editingField, options: updatedOptions });
  };

  const removeOption = (index: number) => {
    if (!editingField) return;
    const updatedOptions = (editingField.options || []).filter((_, i) => i !== index);
    setEditingField({ ...editingField, options: updatedOptions });
  };

  return (
    <div className="space-y-6">
      {alert && (
        <CustomAlert
          type={alert.type}
          message={alert.message}
          show={alert.show}
          onClose={() => setAlert(null)}
        />
      )}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Custom Field Library</h2>
        <Button
          variant="primary"
          onClick={handleAddNew}
          leftIcon={<Plus size={16} />}
          disabled={!!editingField}
        >
          Add New Field
        </Button>
      </div>

      {editingField && (
        <Card title={isAddingNew ? "Add New Custom Field" : "Edit Custom Field"} className="bg-blue-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Field Name"
              value={editingField.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder="e.g., landPlotSize"
              required
            />
            <Input
              label="Display Label"
              value={editingField.label}
              onChange={(e) => handleFieldChange('label', e.target.value)}
              placeholder="e.g., Land Plot Size"
              required
            />
            <Select
              label="Field Type"
              value={editingField.type}
              onChange={(e) => handleFieldChange('type', e.target.value)}
              options={fieldTypeOptions}
              required
            />
            <Select
              label="Category"
              value={editingField.category}
              onChange={(e) => handleFieldChange('category', e.target.value)}
              options={categoryOptions}
              required
            />
            <Input
              label="Description"
              value={editingField.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Brief description of this field"
            />
          </div>

          {/* Validation Rules */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Validation Rules</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={editingField.validation?.required || false}
                  onChange={(e) => handleFieldChange('validation', {
                    ...editingField.validation,
                    required: e.target.checked
                  })}
                />
                <span className="text-sm text-gray-700">Required field</span>
              </label>
              {editingField.type === 'text' && (
                <>
                  <Input
                    label="Min Length"
                    type="number"
                    value={editingField.validation?.minLength || ''}
                    onChange={(e) => handleFieldChange('validation', {
                      ...editingField.validation,
                      minLength: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                    placeholder="Minimum characters"
                  />
                  <Input
                    label="Max Length"
                    type="number"
                    value={editingField.validation?.maxLength || ''}
                    onChange={(e) => handleFieldChange('validation', {
                      ...editingField.validation,
                      maxLength: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                    placeholder="Maximum characters"
                  />
                </>
              )}
              {editingField.type === 'number' && (
                <>
                  <Input
                    label="Min Value"
                    type="number"
                    value={editingField.validation?.min || ''}
                    onChange={(e) => handleFieldChange('validation', {
                      ...editingField.validation,
                      min: e.target.value ? parseFloat(e.target.value) : undefined
                    })}
                    placeholder="Minimum value"
                  />
                  <Input
                    label="Max Value"
                    type="number"
                    value={editingField.validation?.max || ''}
                    onChange={(e) => handleFieldChange('validation', {
                      ...editingField.validation,
                      max: e.target.value ? parseFloat(e.target.value) : undefined
                    })}
                    placeholder="Maximum value"
                  />
                </>
              )}
            </div>
          </div>

          {/* Options for Select fields */}
          {editingField.type === 'select' && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium text-gray-700">Select Options</h4>
                <Button variant="secondary" size="sm" onClick={addOption} leftIcon={<Plus size={14} />}>
                  Add Option
                </Button>
              </div>
              <div className="space-y-2">
                {(editingField.options || []).map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      label=""
                      value={option.value}
                      onChange={(e) => updateOption(index, 'value', e.target.value)}
                      placeholder="Value"
                      className="flex-1"
                    />
                    <Input
                      label=""
                      value={option.label}
                      onChange={(e) => updateOption(index, 'label', e.target.value)}
                      placeholder="Display Label"
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex space-x-2">
            <Button onClick={handleSave} leftIcon={<Save size={16} />}>
              {isAddingNew ? 'Create Field' : 'Update Field'}
            </Button>
            <Button onClick={handleCancel} variant="secondary">
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Field List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customFields.map(field => (
          <Card key={field.id} title={field.label} className="hover:shadow-md transition-shadow">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Name:</span> {field.name}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Type:</span> {field.type}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Category:</span> {field.category}
              </p>
              {field.description && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Description:</span> {field.description}
                </p>
              )}
              <div className="flex items-center space-x-2">
                <span className={`inline-block px-2 py-1 rounded text-xs ${
                  field.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {field.isActive ? 'Active' : 'Inactive'}
                </span>
                {field.validation?.required && (
                  <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    Required
                  </span>
                )}
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleEdit(field)}
                leftIcon={<Edit3 size={14} />}
                disabled={!!editingField}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete(field.id)}
                leftIcon={<Trash2 size={14} />}
                disabled={!!editingField}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {customFields.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No custom fields defined yet.</p>
          <p className="text-sm">Create reusable field definitions that can be added to workflow forms.</p>
        </div>
      )}
    </div>
  );
};

export default CustomFieldManager; 