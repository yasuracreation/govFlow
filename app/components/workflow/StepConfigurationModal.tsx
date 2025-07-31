import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WorkflowStepDefinition, FieldDefinition } from '../../types';

interface StepFormData {
  name: string;
  description: string;
  sectionId: string;
  approvalType: 'None' | 'SectionHead' | 'DepartmentHead';
  estimatedDuration: number;
  isParallel: boolean;
  formFields: FieldDefinition[];
  requiredDocuments: string[];
}

interface StepConfigurationModalProps {
  step: WorkflowStepDefinition;
  fieldTypes: { value: string; label: string }[];
  documentTemplates?: { id: string; name: string }[];
  onSave: (stepData: StepFormData) => void;
  onCancel: () => void;
}

// Static section list for MVP
const SECTIONS = [
  { id: 'registration', name: 'Registration' },
  { id: 'verification', name: 'Verification' },
  { id: 'approval', name: 'Approval' },
  { id: 'issuance', name: 'Issuance' }
];

const StepConfigurationModal: React.FC<StepConfigurationModalProps> = ({
  step,
  fieldTypes,
  documentTemplates,
  onSave,
  onCancel
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'basic' | 'forms' | 'documents' | 'conditions' | 'actions'>('basic');
  const [formData, setFormData] = useState<StepFormData>({
    name: step.name,
    description: step.description || '',
    sectionId: step.sectionId || SECTIONS[0].id,
    approvalType: step.approvalType,
    estimatedDuration: step.estimatedDuration || 24,
    isParallel: step.isParallel || false,
    formFields: [...step.formFields],
    requiredDocuments: [...step.requiredDocuments]
  });

  const handleAddField = () => {
    const newField: FieldDefinition = {
      id: `field-${Date.now()}`,
      label: 'New Field',
      name: 'newField',
      type: 'text',
      required: false
    };
    setFormData(prev => ({
      ...prev,
      formFields: [...prev.formFields, newField]
    }));
  };

  const handleUpdateField = (fieldId: string, updates: Partial<FieldDefinition>) => {
    setFormData(prev => ({
      ...prev,
      formFields: prev.formFields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  };

  const handleDeleteField = (fieldId: string) => {
    setFormData(prev => ({
      ...prev,
      formFields: prev.formFields.filter(field => field.id !== fieldId)
    }));
  };

  const handleAddDocument = () => {
    const docName = prompt('Enter document name:');
    if (docName) {
      setFormData(prev => ({
        ...prev,
        requiredDocuments: [...prev.requiredDocuments, docName]
      }));
    }
  };

  const handleDeleteDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requiredDocuments: prev.requiredDocuments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const tabs = [
    { id: 'basic', label: 'Basic Settings', icon: 'Settings' },
    { id: 'forms', label: 'Form Fields', icon: 'FormInput' },
    { id: 'documents', label: 'Documents', icon: 'FileText' },
    { id: 'conditions', label: 'Conditions', icon: 'Filter' },
    { id: 'actions', label: 'Actions', icon: 'Zap' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Configure Step: {step.name}</h3>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Tabs */}
          <div className="w-64 bg-gray-50 border-r border-gray-200">
            <nav className="p-4 space-y-2">
              {tabs.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <form onSubmit={handleSubmit}>
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Step Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Section *
                      </label>
                      <select
                        value={formData.sectionId}
                        onChange={e => setFormData(prev => ({ ...prev, sectionId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        {SECTIONS.map(section => (
                          <option key={section.id} value={section.id}>{section.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Approval Type
                      </label>
                      <select
                        value={formData.approvalType}
                        onChange={(e) => setFormData(prev => ({ ...prev, approvalType: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="None">No Approval Required</option>
                        <option value="SectionHead">Section Head Approval</option>
                        <option value="DepartmentHead">Department Head Approval</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estimated Duration (hours)
                      </label>
                      <input
                        type="number"
                        value={formData.estimatedDuration}
                        onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 24 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        max="720"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe what this step accomplishes..."
                    />
                  </div>
                  
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isParallel}
                        onChange={(e) => setFormData(prev => ({ ...prev, isParallel: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Can run in parallel with other steps</span>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'forms' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-medium text-gray-900">Form Fields</h4>
                    <button
                      type="button"
                      onClick={handleAddField}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Field
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.formFields.map((field, index) => (
                      <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Field Label *
                            </label>
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) => handleUpdateField(field.id, { label: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Field Type
                            </label>
                            <select
                              value={field.type}
                              onChange={(e) => handleUpdateField(field.id, { type: e.target.value as any })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {fieldTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Field Name *
                            </label>
                            <input
                              type="text"
                              value={field.name}
                              onChange={(e) => handleUpdateField(field.id, { name: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex items-end">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={field.required || false}
                                onChange={(e) => handleUpdateField(field.id, { required: e.target.checked })}
                                className="mr-2"
                              />
                              <span className="text-sm text-gray-700">Required</span>
                            </label>
                          </div>
                        </div>
                        
                        {/* Field-specific options */}
                        {(field.type === 'select' || field.type === 'radio') && (
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Options
                            </label>
                            <div className="space-y-2">
                              {(field.options || []).map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={option.label}
                                    onChange={(e) => {
                                      const newOptions = [...(field.options || [])];
                                      newOptions[optionIndex] = { ...option, label: e.target.value };
                                      handleUpdateField(field.id, { options: newOptions });
                                    }}
                                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="Option label"
                                  />
                                  <input
                                    type="text"
                                    value={option.value}
                                    onChange={(e) => {
                                      const newOptions = [...(field.options || [])];
                                      newOptions[optionIndex] = { ...option, value: e.target.value };
                                      handleUpdateField(field.id, { options: newOptions });
                                    }}
                                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="Option value"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newOptions = (field.options || []).filter((_, i) => i !== optionIndex);
                                      handleUpdateField(field.id, { options: newOptions });
                                    }}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  const newOptions = [...(field.options || []), { value: '', label: '' }];
                                  handleUpdateField(field.id, { options: newOptions });
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                + Add Option
                              </button>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-end mt-4">
                          <button
                            type="button"
                            onClick={() => handleDeleteField(field.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete Field
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-medium text-gray-900">Required Documents</h4>
                    <button
                      type="button"
                      onClick={handleAddDocument}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Document
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formData.requiredDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-900">{doc}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteDocument(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'conditions' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-medium text-gray-900">Step Conditions</h4>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Conditions Feature Coming Soon
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>Advanced conditional logic for step execution will be available in a future update.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'actions' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-medium text-gray-900">Step Actions</h4>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Actions Feature Coming Soon
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>Automated actions and integrations will be available in a future update.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepConfigurationModal; 