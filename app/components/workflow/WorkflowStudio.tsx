import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { 
  WorkflowDefinition, 
  WorkflowStepDefinition, 
  FieldDefinition,
  Subject,
  Office,
  Section
} from '../../types';
import { Plus, Edit, Trash2, Save, Eye, Settings } from 'lucide-react';
import WorkflowValidator from './WorkflowValidator';
import CustomAlert from '../common/CustomAlert';
import { workflowStudioService } from '../../services/workflowStudioService';
import { getSubjects } from '../../services/subjectService';
import { getOffices } from '../../services/officeService';
import { getSections } from '../../services/sectionService';
import { getWorkflows } from '../../services/workflowService';

interface WorkflowStudioProps {
  workflow?: WorkflowDefinition;
  onSave?: (workflow: WorkflowDefinition) => void;
  onCancel?: () => void;
  serviceCategories?: { id: string; name: string }[];
  documentTemplates?: { id: string; name: string }[];
}

interface StepFormData {
  name: string;
  description: string;
  approvalType: 'None' | 'SectionHead' | 'DepartmentHead';
  estimatedDuration: number;
  isParallel: boolean;
  formFields: FieldDefinition[];
  requiredDocuments: string[];
}

const WorkflowStudio: React.FC<WorkflowStudioProps> = () => {
  const { t } = useTranslation();
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowDefinition | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStepModal, setShowStepModal] = useState(false);
  const [editingStep, setEditingStep] = useState<WorkflowStepDefinition | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    subjectId: '',
    version: '1.0'
  });

  // Validation state
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [showValidation, setShowValidation] = useState(false);

  const [alert, setAlert] = useState<{ type: 'error'; message: string; show: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'radio', label: 'Radio' },
    { value: 'select', label: 'Select' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'file', label: 'File Upload' }
  ];

  const approvalTypes = [
    { value: 'None', label: 'No Approval Required' },
    { value: 'SectionHead', label: 'Section Head Approval' },
    { value: 'DepartmentHead', label: 'Department Head Approval' }
  ];

  useEffect(() => {
    getWorkflows()
      .then(setWorkflows)
      .catch(() => setWorkflows([]));
    // Do the same for subjects, offices, sections if needed
  }, []);

  const handleCreateWorkflow = useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date().toISOString();
      const created = await workflowStudioService.createWorkflow({
        name: newWorkflow.name,
        description: newWorkflow.description,
        subjectId: newWorkflow.subjectId,
        steps: [],
        isActive: true,
        version: newWorkflow.version,
        createdAt: now,
        updatedAt: now,
        createdBy: 'admin', // TODO: Replace with real user id
      });
      setWorkflows(prev => [...prev, created]);
      setNewWorkflow({ name: '', description: '', subjectId: '', version: '1.0' });
      setShowCreateModal(false);
      setSelectedWorkflow(created);
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to create workflow', show: true });
    }
    setLoading(false);
  }, [newWorkflow]);

  const handleSaveWorkflow = async (workflow: WorkflowDefinition) => {
    if (!workflow.name.trim()) {
      setAlert({ type: 'error', message: 'Workflow name is required', show: true });
      return;
    }
    if (workflow.steps.length === 0) {
      setAlert({ type: 'error', message: 'At least one step is required', show: true });
      return;
    }
    setLoading(true);
    try {
      const updated = await workflowStudioService.updateWorkflow(workflow.id, workflow);
      setWorkflows(prev => prev.map(w => w.id === workflow.id ? updated : w));
      setSelectedWorkflow(updated);
      setIsEditing(false);
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to save workflow', show: true });
    }
    setLoading(false);
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      setLoading(true);
      try {
        await workflowStudioService.deleteWorkflow(workflowId);
        setWorkflows(prev => prev.filter(w => w.id !== workflowId));
        if (selectedWorkflow?.id === workflowId) {
          setSelectedWorkflow(null);
        }
      } catch (error) {
        setAlert({ type: 'error', message: 'Failed to delete workflow', show: true });
      }
      setLoading(false);
    }
  };

  const handleAddStep = () => {
    if (!selectedWorkflow) return;
    const newStep: WorkflowStepDefinition = {
      id: `step_${Date.now()}`,
      name: 'New Step',
      description: '',
      sectionId: '',
      officeId: '',
      formFields: [],
      requiredDocuments: [],
      approvalType: 'None',
      estimatedDuration: 24
    };
    const updatedWorkflow = {
      ...selectedWorkflow,
      steps: [...selectedWorkflow.steps, newStep]
    };
    setSelectedWorkflow(updatedWorkflow);
    setIsEditing(true);
  };

  const handleEditStep = (step: WorkflowStepDefinition, index: number) => {
    setEditingStep(step);
    setActiveStepIndex(index);
    setShowStepModal(true);
  };

  const handleSaveStep = (updatedStep: WorkflowStepDefinition) => {
    if (selectedWorkflow && activeStepIndex !== null) {
      const updatedSteps = [...selectedWorkflow.steps];
      updatedSteps[activeStepIndex] = updatedStep;
      const updatedWorkflow = {
        ...selectedWorkflow,
        steps: updatedSteps
      };
      setSelectedWorkflow(updatedWorkflow);
      setIsEditing(true);
    }
    setShowStepModal(false);
    setEditingStep(null);
    setActiveStepIndex(null);
  };

  const handleDeleteStep = (stepIndex: number) => {
    if (selectedWorkflow && window.confirm('Are you sure you want to delete this step?')) {
      const updatedSteps = selectedWorkflow.steps.filter((_, index) => index !== stepIndex);
      const updatedWorkflow = {
        ...selectedWorkflow,
        steps: updatedSteps
      };
      setSelectedWorkflow(updatedWorkflow);
      setIsEditing(true);
    }
  };

  // Handler for validation results
  const handleValidationComplete = (errors: any[]) => {
    setValidationErrors(errors);
  };

  return (
    <div className="flex h-full bg-gray-100">
      {/* Workflow List */}
      <div className="w-80 bg-white shadow-lg p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Workflows</h2>
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            New Workflow
          </Button>
        </div>

        <div className="space-y-3">
          {workflows.map(workflow => (
            <div
              key={workflow.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedWorkflow?.id === workflow.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedWorkflow(workflow)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{workflow.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Subject: {subjects.find(s => s.id === workflow.subjectId)?.name || 'N/A'}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="inline-block w-2 h-2 rounded-full mr-2 bg-green-500"></span>
                    <span className="text-xs text-gray-500">
                      {workflow.steps.length} steps • v{workflow.version}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteWorkflow(workflow.id);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workflow Editor */}
      <div className="flex-1 p-6 flex flex-col">
        {selectedWorkflow ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedWorkflow.name}</h2>
                <p className="text-gray-600 mt-1">
                  Subject: {subjects.find(s => s.id === selectedWorkflow.subjectId)?.name || 'N/A'}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
                {isEditing && (
                  <button
                    onClick={() => handleSaveWorkflow(selectedWorkflow)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Save
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {isEditing && (
                <div className="mb-6">
                  <Button onClick={handleAddStep} className="flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Step
                  </Button>
                </div>
              )}

              <div className="space-y-4">
                {selectedWorkflow.steps.map((step, index) => (
                  <div key={step.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Step {index + 1}: {step.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                        <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                          <span>Office: {offices.find(o => o.id === step.officeId)?.name || 'N/A'}</span>
                          <span>Section: {sections.find(s => s.id === step.sectionId)?.name || 'N/A'}</span>
                          <span>Approval: {step.approvalType}</span>
                        </div>
                      </div>
                      {isEditing && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditStep(step, index)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStep(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Form Fields ({step.formFields.length})</h4>
                        <div className="space-y-1">
                          {step.formFields.map(field => (
                            <div key={field.id} className="text-gray-600">
                              • {field.label} ({field.type})
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Required Documents ({step.requiredDocuments.length})</h4>
                        <div className="space-y-1">
                          {step.requiredDocuments.map(doc => (
                            <div key={doc} className="text-gray-600">• {doc}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No workflow selected</h3>
              <p className="text-gray-600">Select a workflow from the list or create a new one</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Create New Workflow</h3>
            <div className="space-y-4">
              <Input
                label="Workflow Name"
                value={newWorkflow.name}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                placeholder="e.g., Business Registration Process"
              />
              <Input
                label="Description"
                value={newWorkflow.description}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                placeholder="Brief description of the workflow"
              />
              <Select
                label="Subject"
                value={newWorkflow.subjectId}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, subjectId: e.target.value })}
                options={[{ value: '', label: 'Select a Subject' }, ...subjects.map(s => ({ value: s.id, label: s.name }))]}
              />
              <Input
                label="Version"
                value={newWorkflow.version}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, version: e.target.value })}
                placeholder="1.0"
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateWorkflow}>Create</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Step Configuration Modal */}
      {showStepModal && editingStep && (
        <StepConfigurationModal
          step={editingStep}
          offices={offices}
          sections={sections}
          fieldTypes={fieldTypes}
          approvalTypes={approvalTypes}
          onSave={handleSaveStep}
          onCancel={() => {
            setShowStepModal(false);
            setEditingStep(null);
            setActiveStepIndex(null);
          }}
        />
      )}

      {alert && (
        <CustomAlert
          type={alert.type}
          message={alert.message}
          show={alert.show}
          onClose={() => setAlert(null)}
        />
      )}
    </div>
  );
};

// Step Configuration Modal Component
interface StepConfigurationModalProps {
  step: WorkflowStepDefinition;
  offices: Office[];
  sections: Section[];
  fieldTypes: { value: string; label: string }[];
  approvalTypes: { value: string; label: string }[];
  onSave: (step: WorkflowStepDefinition) => void;
  onCancel: () => void;
}

const StepConfigurationModal: React.FC<StepConfigurationModalProps> = ({
  step,
  offices,
  sections,
  fieldTypes,
  approvalTypes,
  onSave,
  onCancel
}) => {
  const [stepData, setStepData] = useState<WorkflowStepDefinition>(step);
  const [newField, setNewField] = useState<Partial<FieldDefinition>>({});
  const [newDocument, setNewDocument] = useState('');

  const handleAddField = () => {
    if (newField.label && newField.name && newField.type) {
      const field: FieldDefinition = {
        id: `field_${Date.now()}`,
        label: newField.label,
        name: newField.name,
        type: newField.type as FieldDefinition['type'],
        placeholder: newField.placeholder,
        required: newField.required || false,
        options: newField.options || []
      };
      
      setStepData(prev => ({
        ...prev,
        formFields: [...prev.formFields, field]
      }));
      setNewField({});
    }
  };

  const handleAddDocument = () => {
    if (newDocument.trim()) {
      setStepData(prev => ({
        ...prev,
        requiredDocuments: [...prev.requiredDocuments, newDocument.trim()]
      }));
      setNewDocument('');
    }
  };

  const handleRemoveField = (fieldId: string) => {
    setStepData(prev => ({
      ...prev,
      formFields: prev.formFields.filter(f => f.id !== fieldId)
    }));
  };

  const handleRemoveDocument = (documentName: string) => {
    setStepData(prev => ({
      ...prev,
      requiredDocuments: prev.requiredDocuments.filter(d => d !== documentName)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Configure Step: {step.name}</h3>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Step Name"
              value={stepData.name}
              onChange={(e) => setStepData({ ...stepData, name: e.target.value })}
            />
            <Input
              label="Description"
              value={stepData.description || ''}
              onChange={(e) => setStepData({ ...stepData, description: e.target.value })}
            />
            <Select
              label="Office"
              value={stepData.officeId}
              onChange={(e) => setStepData({ ...stepData, officeId: e.target.value })}
              options={[{ value: '', label: 'Select Office' }, ...offices.map(o => ({ value: o.id, label: o.name }))]}
            />
            <Select
              label="Section"
              value={stepData.sectionId}
              onChange={(e) => setStepData({ ...stepData, sectionId: e.target.value })}
              options={[{ value: '', label: 'Select Section' }, ...sections.map(s => ({ value: s.id, label: s.name }))]}
            />
            <Select
              label="Approval Type"
              value={stepData.approvalType}
              onChange={(e) => setStepData({ ...stepData, approvalType: e.target.value as any })}
              options={approvalTypes}
            />
            <Input
              label="Estimated Duration (hours)"
              type="number"
              value={stepData.estimatedDuration !== undefined ? String(stepData.estimatedDuration) : ''}
              onChange={(e) => setStepData({ ...stepData, estimatedDuration: parseInt(e.target.value) || 0 })}
            />
          </div>

          {/* Form Fields */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Form Fields</h4>
            <div className="space-y-4">
              {stepData.formFields.map(field => (
                <div key={field.id} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                  <div>
                    <span className="font-medium">{field.label}</span>
                    <span className="text-sm text-gray-500 ml-2">({field.type})</span>
                  </div>
                  <button
                    onClick={() => handleRemoveField(field.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              <div className="border border-gray-200 rounded p-4">
                <h5 className="font-medium mb-3">Add New Field</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    placeholder="Field Label"
                    value={newField.label || ''}
                    onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                  />
                  <Input
                    placeholder="Field Name"
                    value={newField.name || ''}
                    onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                  />
                  <Select
                    value={newField.type || ''}
                    onChange={(e) => setNewField({ ...newField, type: e.target.value as FieldDefinition['type'] })}
                    options={[{ value: '', label: 'Type' }, ...fieldTypes]}
                  />
                </div>
                <Button onClick={handleAddField} className="mt-3">
                  Add Field
                </Button>
              </div>
            </div>
          </div>

          {/* Required Documents */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Required Documents</h4>
            <div className="space-y-2">
              {stepData.requiredDocuments.map(doc => (
                <div key={doc} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                  <span>{doc}</span>
                  <button
                    onClick={() => handleRemoveDocument(doc)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              <div className="flex gap-2">
                <Input
                  placeholder="Document name"
                  value={newDocument}
                  onChange={(e) => setNewDocument(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAddDocument}>Add</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={() => onSave(stepData)}>
            Save Step
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowStudio; 