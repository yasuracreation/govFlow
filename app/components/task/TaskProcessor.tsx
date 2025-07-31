import React, { useState, useEffect } from 'react';
import { ServiceRequest, WorkflowDefinition, WorkflowStepDefinition, FieldDefinition, UploadedDocument } from '@/types';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Select from '../common/Select';
import Checkbox from '../common/Checkbox';
import FormBuilder from '../common/FormBuilder';
import FileUpload from '../common/FileUpload';
import { Save, Upload, Send, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';

interface TaskProcessorProps {
  serviceRequest: ServiceRequest;
  workflowDefinition: WorkflowDefinition;
  currentStep: WorkflowStepDefinition;
  onSave: (formData: Record<string, any>, documents: UploadedDocument[]) => void;
  onSubmit: (formData: Record<string, any>, documents: UploadedDocument[], comment?: string) => void;
  readOnly?: boolean;
}

const TaskProcessor: React.FC<TaskProcessorProps> = ({
  serviceRequest,
  workflowDefinition,
  currentStep,
  onSave,
  onSubmit,
  readOnly = false
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing data if available
  useEffect(() => {
    const stepHistory = serviceRequest.history.find(h => h.stepId === currentStep.id);
    if (stepHistory?.data) {
      setFormData(stepHistory.data);
    }
  }, [currentStep.id, serviceRequest.history]);

  const handleFormDataChange = (newData: Record<string, any>) => {
    setFormData(newData);
  };

  const handleFilesChange = (files: Record<string, File>) => {
    setUploadedFiles(files);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Convert files to UploadedDocument format
      const documents: UploadedDocument[] = Object.entries(uploadedFiles).map(([fieldName, file]) => ({
        id: `doc_${Date.now()}_${fieldName}`,
        name: file.name,
        url: URL.createObjectURL(file), // In real app, this would be uploaded to server
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'current-user-id' // TODO: Get from auth context
      }));

      await onSave(formData, documents);
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Convert files to UploadedDocument format
      const documents: UploadedDocument[] = Object.entries(uploadedFiles).map(([fieldName, file]) => ({
        id: `doc_${Date.now()}_${fieldName}`,
        name: file.name,
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'current-user-id'
      }));

      await onSubmit(formData, documents, comment);
    } catch (error) {
      console.error('Error submitting task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepProgress = () => {
    const currentStepIndex = workflowDefinition.steps.findIndex(s => s.id === currentStep.id);
    return {
      current: currentStepIndex + 1,
      total: workflowDefinition.steps.length,
      percentage: ((currentStepIndex + 1) / workflowDefinition.steps.length) * 100
    };
  };

  const progress = getStepProgress();

  // Separate form fields from file fields
  const formFields = currentStep.formFields.filter(field => field.type !== 'file');
  const fileFields = currentStep.formFields.filter(field => field.type === 'file');

  return (
    <div className="space-y-6">
      {/* Task Header */}
      <Card>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Process Task</h2>
            <p className="text-gray-600">Service Request: {serviceRequest.id}</p>
            <p className="text-sm text-gray-500 mt-1">
              Step {progress.current} of {progress.total}: {currentStep.name}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">Progress</div>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {Math.round(progress.percentage)}% Complete
            </div>
          </div>
        </div>
      </Card>

      {/* Step Information */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Step Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Step Name</label>
            <p className="text-gray-900">{currentStep.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <p className="text-gray-900">{currentStep.description || 'No description provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Estimated Duration</label>
            <p className="text-gray-900">{currentStep.estimatedDuration || 'Not specified'} hours</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Approval Required</label>
            <p className="text-gray-900">
              {currentStep.approvalType === 'None' ? 'No approval required' :
               currentStep.approvalType === 'SectionHead' ? 'Section Head approval' :
               'Department Head approval'}
            </p>
          </div>
        </div>
      </Card>

      {/* Form Fields */}
      {formFields.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Required Information</h3>
          <FormBuilder
            fields={formFields}
            data={formData}
            onDataChange={handleFormDataChange}
            readOnly={readOnly}
          />
        </Card>
      )}

      {/* Document Upload */}
      {fileFields.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Required Documents</h3>
          <FileUpload
            fields={fileFields}
            onFilesChange={handleFilesChange}
            readOnly={readOnly}
          />
        </Card>
      )}

      {/* Workflow History */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Step History</h3>
        <div className="space-y-3">
          {serviceRequest.history
            .filter(h => h.stepId === currentStep.id)
            .map((event, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                <div className="flex-shrink-0">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{event.action}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">By: {event.userName}</p>
                  {event.comment && (
                    <p className="text-sm text-gray-600 mt-1">Comment: {event.comment}</p>
                  )}
                </div>
              </div>
            ))}
        </div>
      </Card>

      {/* Action Buttons */}
      {!readOnly && (
        <Card>
          <div className="flex justify-between items-center">
            <div className="flex-1 max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Comment (Optional)
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add any additional comments..."
                rows={3}
              />
            </div>
            <div className="flex space-x-3 ml-6">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                variant="secondary"
                className="flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Submit for Review'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Validation Summary */}
      {!readOnly && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Validation Summary</h3>
          <div className="space-y-2">
            {formFields.map(field => {
              const value = formData[field.name];
              const isValid = field.required ? value && value.toString().trim() !== '' : true;
              
              return (
                <div key={field.id} className="flex items-center space-x-2">
                  {isValid ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm ${isValid ? 'text-gray-600' : 'text-red-600'}`}>
                    {field.label} {field.required ? '(Required)' : '(Optional)'}
                  </span>
                </div>
              );
            })}
            
            {fileFields.map(field => {
              const hasFile = uploadedFiles[field.name];
              
              return (
                <div key={field.id} className="flex items-center space-x-2">
                  {hasFile ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm ${hasFile ? 'text-gray-600' : 'text-red-600'}`}>
                    {field.label} (Required)
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default TaskProcessor; 