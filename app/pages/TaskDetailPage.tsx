import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Textarea from '../components/common/Textarea';
import FileUpload from '../components/common/FileUpload';
import DocumentGenerator from '../components/common/DocumentGenerator';
import CustomAlert from '../components/common/CustomAlert';
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, FileText, Upload } from 'lucide-react';
import { ServiceRequest, WorkflowDefinition, Subject, WorkflowStepDefinition, User, FieldDefinition, UploadedDocument } from '@/types';
import { useAuth } from '@/hooks/useAuth.tsx';
import { GeneratedDocument } from '@/services/documentGenerationService';
import { getSubjects } from '../services/subjectService';
import { getWorkflows } from '../services/workflowService';

// Placeholder components - these would be actual components in a real app
const FormBuilder: React.FC<{ fields: FieldDefinition[], data: any, onDataChange: (data: any) => void }> = 
  ({ fields, data, onDataChange }) => (
  <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
    <h4 className="font-semibold text-gray-700">Step Form</h4>
    {fields.map(field => (
      <div key={field.id}>
        <label className="block text-sm font-medium text-gray-600">{field.label}</label>
        <input
          type={field.type}
          placeholder={field.placeholder}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
    ))}
    <p className="text-xs text-gray-500">FormBuilder component placeholder.</p>
  </div>
);

interface TaskDetailPageProps {
  viewMode?: 'departmentHead';
}

const TaskDetailPage: React.FC<TaskDetailPageProps> = ({ viewMode }) => {
  const { serviceRequestId } = useParams<{ serviceRequestId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [serviceRequest, setServiceRequest] = useState<ServiceRequest | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowDefinition | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [currentStep, setCurrentStep] = useState<WorkflowStepDefinition | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string; show: boolean } | null>(null);
  
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [subjectsLoading, setSubjectsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!serviceRequestId) return;
      
      setLoading(true);
      try {
        // Fetch subjects from API
        setSubjectsLoading(true);
        const fetchedSubjects = await getSubjects();
        setSubjectsLoading(false);

        // Fetch workflows from backend
        const allWorkflows = await getWorkflows();

        // Fetch other data from localStorage (for now)
        const allServiceRequests: ServiceRequest[] = JSON.parse(localStorage.getItem('govflow-service-requests') || '[]');

        const request = allServiceRequests.find(sr => String(sr.id) === String(serviceRequestId));
        if (request) {
          const associatedWorkflow = allWorkflows.find(w => w.id === request.workflowDefinitionId);
          const associatedSubject = fetchedSubjects.find(s => s.id === request.serviceRequestData.subjectId);
          
          setServiceRequest(request);
          setWorkflow(associatedWorkflow || null);
          setSubject(associatedSubject || null);

          if (associatedWorkflow) {
            const step = associatedWorkflow.steps.find(s => s.id === request.currentStepId);
            setCurrentStep(step || null);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setAlert({ type: 'error', message: 'Failed to load data. Please try again.', show: true });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [serviceRequestId]);

  const handleFilesChange = (files: Record<string, File>) => {
    console.log('Task detail - Files changed:', files);
    setUploadedFiles(files);
  };

  const handleFormDataChange = (newData: Record<string, any>) => {
    setFormData(newData);
  };

  const handleAction = async (action: 'complete' | 'reject' | 'request_correction') => {
    if (!serviceRequest || !workflow || !currentStep || !user) {
      setAlert({ type: 'error', message: 'Service Request not found!', show: true });
      return;
    }

    setLoading(true);
    try {
      const allServiceRequests: ServiceRequest[] = JSON.parse(localStorage.getItem('govflow-service-requests') || '[]');
      const requestIndex = allServiceRequests.findIndex(sr => String(sr.id) === String(serviceRequestId));

      if (requestIndex === -1) {
        setAlert({ type: 'error', message: 'Service Request not found!', show: true });
        setLoading(false);
        return;
      }
      
      const currentStepIndex = workflow.steps.findIndex(s => s.id === currentStep.id);
      const nextStep = workflow.steps[currentStepIndex + 1];

      let newStatus: ServiceRequest['status'] = serviceRequest.status;
      let nextStepId = currentStep.id;

      if (action === 'complete') {
        if (nextStep) {
          newStatus = 'InProgress';
          nextStepId = nextStep.id;
        } else {
          newStatus = 'Completed';
        }
      } else if (action === 'reject') {
        newStatus = 'Rejected';
      }

      // Convert uploaded files to UploadedDocument format
      const documents: UploadedDocument[] = Object.entries(uploadedFiles).map(([fieldName, file]) => ({
        id: `doc_${Date.now()}_${fieldName}`,
        name: file.name,
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString(),
        uploadedBy: user.id
      }));
      
      const updatedRequest: ServiceRequest = {
        ...serviceRequest,
        status: newStatus,
        currentStepId: nextStepId,
        updatedAt: new Date().toISOString(),
        history: [
          ...serviceRequest.history,
          {
            stepId: currentStep.id,
            stepName: currentStep.name,
            userId: user.id,
            userName: user.name,
            timestamp: new Date().toISOString(),
            action: action,
            comment: comment,
            data: formData, // Persist form data filled at this step
            documents: documents // Include uploaded documents
          }
        ],
        // Merge the form data from this step into the main data object
        serviceRequestData: {
          ...serviceRequest.serviceRequestData,
          ...formData
        }
      };

      allServiceRequests[requestIndex] = updatedRequest;
      localStorage.setItem('govflow-service-requests', JSON.stringify(allServiceRequests));

      setServiceRequest(updatedRequest);
      setCurrentStep(nextStep || null);
      setComment('');
      setFormData({});
      setUploadedFiles({});

      setAlert({ type: 'success', message: `Request action '${action}' completed successfully!`, show: true });
      if (newStatus === 'Completed' || newStatus === 'Rejected') {
        navigate('/tasks');
      }

    } catch (error) {
      console.error('Error performing action:', error);
      setAlert({ type: 'error', message: 'Failed to update request.', show: true });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  if (!serviceRequest || !workflow || !subject) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-xl font-bold">Service Request Not Found</h2>
        <p className="text-gray-500 mt-2">The requested service ID could not be found or is incomplete.</p>
        <Button onClick={() => navigate('/tasks')} className="mt-4">Back to Task Queue</Button>
      </Card>
    );
  }

  // Create file upload fields based on current step requirements
  const getFileUploadFields = (): FieldDefinition[] => {
    if (!currentStep) return [];
    
    return currentStep.requiredDocuments.map((doc, index) => ({
      id: `step_${currentStep.id}_doc_${index}`,
      label: doc,
      name: doc.toLowerCase().replace(/\s+/g, '_'),
      type: 'file',
      required: true,
      placeholder: `Upload ${doc}`
    }));
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Service Request: {serviceRequest.id.substring(0, 8)}...
            </h1>
            <p className="text-gray-600">{subject.name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium`}>
            {serviceRequest.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Current Step: {currentStep?.name || 'N/A'}</h3>
            <p className="text-sm text-gray-600">{currentStep?.description}</p>
          </Card>
          
          {currentStep && currentStep.formFields.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Complete Form</h3>
               <FormBuilder fields={currentStep.formFields} data={formData} onDataChange={setFormData} />
            </Card>
          )}

          {currentStep && currentStep.requiredDocuments.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Documents</h3>
              <FileUpload 
                fields={getFileUploadFields()}
                onFilesChange={handleFilesChange}
                readOnly={false}
              />
            </Card>
          )}

          {/* Document Generation Section */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Generate Documents</h3>
            <DocumentGenerator
              serviceRequest={serviceRequest}
              workflowDefinition={workflow}
              currentUser={user}
              approvalData={{
                approvedBy: user.name,
                approvalDate: new Date().toLocaleDateString(),
                comments: comment,
                conditions: 'Standard approval conditions apply'
              }}
              onDocumentGenerated={(document) => {
                setAlert({ type: 'success', message: `Document "${document.templateName}" generated successfully!`, show: true });
              }}
            />
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-4">
              {serviceRequest.history.map((event, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 pt-1">
                    <CheckCircle className="w-5 h-5 text-green-500"/>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{event.stepName} - <span className="font-normal">{event.action}</span></p>
                    <p className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleString()} • {event.userName}
                    </p>
                    {event.comment && <p className="text-sm mt-1 p-2 bg-gray-100 rounded">{event.comment}</p>}
                    {event.documents && event.documents.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Uploaded documents:</p>
                        <div className="space-y-1">
                          {event.documents.map((doc, docIndex) => (
                            <div key={docIndex} className="flex items-center space-x-2 text-xs">
                              <FileText className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-600">{doc.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
             <h3 className="text-lg font-medium text-gray-900 mb-4">Citizen Information</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Name:</strong> {serviceRequest.serviceRequestData.citizenName}</p>
              <p><strong>NIC:</strong> {serviceRequest.serviceRequestData.nicNumber}</p>
              <p><strong>Contact:</strong> {serviceRequest.serviceRequestData.citizenContact}</p>
              <p><strong>Address:</strong> {serviceRequest.serviceRequestData.citizenAddress}</p>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <Textarea
                label="Add a comment (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Provide details for your action..."
              />
              <Button
                onClick={() => handleAction('complete')}
                disabled={loading || serviceRequest.status === 'Completed' || serviceRequest.status === 'Rejected'}
                className="w-full"
              >
                {currentStep && workflow.steps.indexOf(currentStep) === workflow.steps.length - 1 
                  ? 'Complete Request' 
                  : 'Complete & Forward'}
              </Button>
              <Button
                variant="danger"
                onClick={() => handleAction('reject')}
                disabled={loading || serviceRequest.status === 'Completed' || serviceRequest.status === 'Rejected'}
                className="w-full"
              >
                Reject Request
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage; 