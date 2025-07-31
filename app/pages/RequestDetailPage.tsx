import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { ArrowLeft, Download, Eye, CheckCircle, XCircle, MessageSquare, FileText, User, Calendar, MapPin, Phone } from 'lucide-react';
import { ServiceRequest, WorkflowDefinition, Subject, Office, User as UserType, UserRole } from '@/types';
import { useAuth } from '@/hooks/useAuth.tsx';
import WorkflowNodeViewer from '../components/workflow/WorkflowNodeViewer';
import { getSubjects } from '../services/subjectService';
import { getWorkflows } from '../services/workflowService';

const RequestDetailPage: React.FC = () => {
  const { serviceRequestId } = useParams<{ serviceRequestId: string }>();
  const [serviceRequest, setServiceRequest] = useState<ServiceRequest | null>(null);
  const [workflowDefinition, setWorkflowDefinition] = useState<WorkflowDefinition | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApprovalDocument, setShowApprovalDocument] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'correction'>('approve');
  const [actionStepId, setActionStepId] = useState('');
  const [actionComment, setActionComment] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning'; message: string; show: boolean } | null>(null);
  const [assignUserId, setAssignUserId] = useState<string>('');
  const [assigning, setAssigning] = useState(false);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (serviceRequestId) {
      loadRequestData();
    }
  }, [serviceRequestId]);

  const loadRequestData = async () => {
    setLoading(true);
    try {
      // Fetch subjects from API
      setSubjectsLoading(true);
      const fetchedSubjects = await getSubjects();
      setSubjects(fetchedSubjects);
      setSubjectsLoading(false);

      // Fetch workflows from backend
      const allWorkflows = await getWorkflows();

      // Load other data from localStorage (for now)
      const allServiceRequests: ServiceRequest[] = JSON.parse(localStorage.getItem('govflow-service-requests') || '[]');
      const allOffices: Office[] = JSON.parse(localStorage.getItem('govflow-offices') || '[]');
      const allUsers: UserType[] = JSON.parse(localStorage.getItem('govflow-users') || '[]');

      const request = allServiceRequests.find(sr => String(sr.id) === String(serviceRequestId));
      if (!request) {
        throw new Error('Request not found');
      }

      const workflow = allWorkflows.find(w => String(w.id) === String(request.workflowDefinitionId));
      if (!workflow) {
        throw new Error('Workflow not found');
      }

      setServiceRequest(request);
      setWorkflowDefinition(workflow);
      setOffices(allOffices);
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading request data:', error);
      setAlert({ type: 'error', message: 'Failed to load request data. Please try again.', show: true });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (stepId: string, comment?: string) => {
    if (!serviceRequest) return;

    try {
      // Update the service request with approval
      const updatedRequest: ServiceRequest = {
        ...serviceRequest,
        status: 'Completed' as const,
        updatedAt: new Date().toISOString(),
        history: [
          ...serviceRequest.history,
          {
            stepId,
            stepName: workflowDefinition?.steps.find(s => s.id === stepId)?.name || 'Unknown Step',
            userId: user?.id || '',
            userName: user?.name || 'Unknown User',
            timestamp: new Date().toISOString(),
            action: 'Approved by Department Head',
            comment: comment || 'Approved'
          }
        ]
      };

      // Save to localStorage
      const allRequests: ServiceRequest[] = JSON.parse(localStorage.getItem('govflow-service-requests') || '[]');
      const updatedRequests = allRequests.map(r => r.id === serviceRequest.id ? updatedRequest : r);
      localStorage.setItem('govflow-service-requests', JSON.stringify(updatedRequests));

      setServiceRequest(updatedRequest);
    } catch (error) {
      console.error('Error approving step:', error);
    }
  };

  const handleReject = async (stepId: string, reason: string) => {
    if (!serviceRequest) return;

    try {
      const updatedRequest: ServiceRequest = {
        ...serviceRequest,
        status: 'Rejected' as const,
        updatedAt: new Date().toISOString(),
        history: [
          ...serviceRequest.history,
          {
            stepId,
            stepName: workflowDefinition?.steps.find(s => s.id === stepId)?.name || 'Unknown Step',
            userId: user?.id || '',
            userName: user?.name || 'Unknown User',
            timestamp: new Date().toISOString(),
            action: 'Rejected by Department Head',
            comment: reason
          }
        ]
      };

      const allRequests: ServiceRequest[] = JSON.parse(localStorage.getItem('govflow-service-requests') || '[]');
      const updatedRequests = allRequests.map(r => r.id === serviceRequest.id ? updatedRequest : r);
      localStorage.setItem('govflow-service-requests', JSON.stringify(updatedRequests));

      setServiceRequest(updatedRequest);
    } catch (error) {
      console.error('Error rejecting step:', error);
    }
  };

  const handleRequestCorrection = async (stepId: string, comment: string) => {
    if (!serviceRequest) return;

    try {
      const updatedRequest: ServiceRequest = {
        ...serviceRequest,
        status: 'CorrectionRequested' as const,
        updatedAt: new Date().toISOString(),
        history: [
          ...serviceRequest.history,
          {
            stepId,
            stepName: workflowDefinition?.steps.find(s => s.id === stepId)?.name || 'Unknown Step',
            userId: user?.id || '',
            userName: user?.name || 'Unknown User',
            timestamp: new Date().toISOString(),
            action: 'Correction Requested by Department Head',
            comment: comment
          }
        ]
      };

      const allRequests: ServiceRequest[] = JSON.parse(localStorage.getItem('govflow-service-requests') || '[]');
      const updatedRequests = allRequests.map(r => r.id === serviceRequest.id ? updatedRequest : r);
      localStorage.setItem('govflow-service-requests', JSON.stringify(updatedRequests));

      setServiceRequest(updatedRequest);
    } catch (error) {
      console.error('Error requesting correction:', error);
    }
  };

  const handleGenerateApprovalDocument = (stepId: string) => {
    // Generate approval document
    const step = workflowDefinition?.steps.find(s => s.id === stepId);
    const stepData = serviceRequest?.history.find(h => h.stepId === stepId);
    
    const documentContent = `
      APPROVAL DOCUMENT
      
      Service Request ID: ${serviceRequest?.id}
      Citizen Name: ${serviceRequest?.serviceRequestData.citizenName}
      NIC Number: ${serviceRequest?.serviceRequestData.nicNumber}
      Subject: ${subjects.find(s => s.id === serviceRequest?.serviceRequestData.subjectId)?.name}
      
      Step: ${step?.name}
      Approved By: ${user?.name}
      Approval Date: ${new Date().toLocaleDateString()}
      Approval Time: ${new Date().toLocaleTimeString()}
      
      Comments: ${stepData?.comment || 'Approved'}
      
      This document certifies that the above step has been approved and the request can proceed to the next stage.
      
      Department Head Signature: _________________
      Date: _________________
    `;

    // Create and download document
    const blob = new Blob([documentContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `approval_${serviceRequest?.id}_${stepId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handler to assign the request to a user
  const handleAssignToUser = async () => {
    if (!serviceRequest || !assignUserId) return;
    setAssigning(true);
    try {
      const updatedRequest: ServiceRequest = {
        ...serviceRequest,
        assignedToUserId: assignUserId,
        updatedAt: new Date().toISOString(),
      };
      const allRequests: ServiceRequest[] = JSON.parse(localStorage.getItem('govflow-service-requests') || '[]');
      const updatedRequests = allRequests.map(r => r.id === serviceRequest.id ? updatedRequest : r);
      localStorage.setItem('govflow-service-requests', JSON.stringify(updatedRequests));
      setServiceRequest(updatedRequest);
      setAlert({ type: 'success', message: 'Request assigned successfully!', show: true });
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to assign request.', show: true });
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!serviceRequest || !workflowDefinition) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Request Not Found</h2>
          <p className="text-gray-600 mb-4">The requested service request could not be found.</p>
          <Button onClick={() => navigate('/command-center')}>
            Back to Command Center
          </Button>
        </div>
      </div>
    );
  }

  const subject = subjects.find(s => s.id === serviceRequest.serviceRequestData.subjectId);
  const office = offices.find(o => o.id === serviceRequest.assignedToOfficeId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate('/command-center')}
            variant="secondary"
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Command Center
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Request Details</h1>
            <p className="text-gray-600">Service Request ID: {serviceRequest.id}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => setShowApprovalDocument(true)}
            variant="secondary"
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Generate Final Document
          </Button>
        </div>
      </div>

      {/* Request Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Citizen Information */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Citizen Information
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="text-gray-900">{serviceRequest.serviceRequestData.citizenName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">NIC Number</label>
              <p className="text-gray-900">{serviceRequest.serviceRequestData.nicNumber}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <p className="text-gray-900">{serviceRequest.serviceRequestData.citizenAddress}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact</label>
              <p className="text-gray-900">{serviceRequest.serviceRequestData.citizenContact}</p>
            </div>
          </div>
        </Card>

        {/* Request Details */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Request Details
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Subject</label>
              <p className="text-gray-900">{subject?.name || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Assigned Office</label>
              <p className="text-gray-900">{office?.name || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Assigned User</label>
              <p className="text-gray-900">{users.find(u => u.id === serviceRequest.assignedToUserId)?.name || 'N/A'}</p>
            </div>
            {/* Assignment UI for Department Head */}
            {user?.role === UserRole.DEPARTMENT_HEAD && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Assign to User</label>
                <select
                  value={assignUserId}
                  onChange={e => setAssignUserId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a user</option>
                  {users.filter(u => u.role === UserRole.OFFICER || u.role === UserRole.SECTION_HEAD).map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
                <Button
                  onClick={handleAssignToUser}
                  disabled={!assignUserId || assigning}
                  className="mt-2"
                >
                  {assigning ? 'Assigning...' : 'Assign'}
                </Button>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                serviceRequest.status === 'Completed' ? 'bg-green-100 text-green-800' :
                serviceRequest.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                serviceRequest.status === 'InProgress' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {serviceRequest.status}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Created Date</label>
              <p className="text-gray-900">{new Date(serviceRequest.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Updated</label>
              <p className="text-gray-900">{new Date(serviceRequest.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </Card>

        {/* Workflow Progress */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Workflow Progress
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Steps</label>
              <p className="text-gray-900">{workflowDefinition.steps.length}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Completed Steps</label>
              <p className="text-gray-900">
                {serviceRequest.history.filter(h => h.action.includes('Approved')).length}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Step</label>
              <p className="text-gray-900">
                {workflowDefinition.steps.find(s => s.id === serviceRequest.currentStepId)?.name || 'N/A'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Progress</label>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(serviceRequest.history.filter(h => h.action.includes('Approved')).length / workflowDefinition.steps.length) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Workflow Node Viewer */}
      {workflowDefinition && (
        <WorkflowNodeViewer
          serviceRequest={serviceRequest}
          workflowDefinition={workflowDefinition}
          onApprove={handleApprove}
          onReject={handleReject}
          onRequestCorrection={handleRequestCorrection}
          onGenerateApprovalDocument={handleGenerateApprovalDocument}
        />
      )}

      {/* Request History */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Request History & Documents</h3>
        <div className="space-y-4">
          {serviceRequest.history.map((event, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{event.action}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Step: {event.stepName}</p>
                      <p className="text-xs text-gray-500">By: {event.userName}</p>
                    </div>
                  </div>
                  
                  {event.comment && (
                    <div className="mb-3 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Comment:</span> {event.comment}
                      </p>
                    </div>
                  )}

                  {/* Display uploaded documents */}
                  {event.documents && event.documents.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        Uploaded Documents ({event.documents.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {event.documents.map((doc, docIndex) => (
                          <div 
                            key={docIndex} 
                            className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                          >
                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                              <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-700 truncate">
                                  {doc.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(doc.uploadedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-1 ml-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  // Create a temporary link to download the file
                                  const link = document.createElement('a');
                                  link.href = doc.url;
                                  link.download = doc.name;
                                  link.click();
                                }}
                                className="p-1"
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  // Open file in new tab for preview
                                  window.open(doc.url, '_blank');
                                }}
                                className="p-1"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Display form data if available */}
                  {event.data && Object.keys(event.data).length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Form Data Submitted
                      </h4>
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {Object.entries(event.data).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium text-gray-600">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                              </span>
                              <span className="ml-1 text-gray-800">
                                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Final Approval Document Modal */}
      {showApprovalDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Generate Final Approval Document</h3>
            <div className="space-y-4">
              <p className="text-gray-600">
                This will generate a comprehensive approval document for the entire request.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Document will include:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Citizen information and request details</li>
                  <li>• Complete workflow progress</li>
                  <li>• All approvals and comments</li>
                  <li>• Final approval signature</li>
                  <li>• Downloadable format</li>
                </ul>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="secondary" onClick={() => setShowApprovalDocument(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  // Generate final document
                  const documentContent = `
                    FINAL APPROVAL DOCUMENT
                    
                    Service Request ID: ${serviceRequest.id}
                    Citizen Name: ${serviceRequest.serviceRequestData.citizenName}
                    NIC Number: ${serviceRequest.serviceRequestData.nicNumber}
                    Address: ${serviceRequest.serviceRequestData.citizenAddress}
                    Contact: ${serviceRequest.serviceRequestData.citizenContact}
                    
                    Subject: ${subject?.name}
                    Assigned Office: ${office?.name}
                    
                    Request Status: ${serviceRequest.status}
                    Created Date: ${new Date(serviceRequest.createdAt).toLocaleDateString()}
                    Completed Date: ${new Date().toLocaleDateString()}
                    
                    WORKFLOW PROGRESS:
                    ${workflowDefinition.steps.map((step, index) => {
                      const stepHistory = serviceRequest.history.find(h => h.stepId === step.id);
                      return `${index + 1}. ${step.name}: ${stepHistory?.action || 'Pending'}`;
                    }).join('\n')}
                    
                    APPROVAL HISTORY:
                    ${serviceRequest.history.map(event => 
                      `${event.timestamp}: ${event.action} by ${event.userName}${event.comment ? ` - ${event.comment}` : ''}`
                    ).join('\n')}
                    
                    FINAL APPROVAL:
                    This request has been reviewed and approved by the Department Head.
                    
                    Department Head: ${user?.name}
                    Approval Date: ${new Date().toLocaleDateString()}
                    Approval Time: ${new Date().toLocaleTimeString()}
                    
                    Signature: _________________
                    Date: _________________
                    
                    This document certifies that the above service request has been completed and approved.
                  `;

                  const blob = new Blob([documentContent], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `final_approval_${serviceRequest.id}.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  setShowApprovalDocument(false);
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Generate Document
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RequestDetailPage; 