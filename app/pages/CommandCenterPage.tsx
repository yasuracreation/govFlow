import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import CustomAlert from '../components/common/CustomAlert';
import { Search, Filter, Download, Eye, TrendingUp, Users, Clock, CheckCircle, XCircle, FileText } from 'lucide-react';
import { ServiceRequest, WorkflowDefinition, Subject, Office, User } from '@/types';
import { useAuth } from '@/hooks/useAuth.tsx';
import WorkflowVisualizer from '../components/workflow/WorkflowVisualizer';
import { getSubjects } from '../services/subjectService';
import { getWorkflows } from '../services/workflowService';

const CommandCenterPage: React.FC = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string; show: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterOffice, setFilterOffice] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');
  
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch subjects from API
        setSubjectsLoading(true);
        const fetchedSubjects = await getSubjects();
        setSubjects(fetchedSubjects);
        setSubjectsLoading(false);
        
        // Fetch workflows from backend
        const allWorkflows = await getWorkflows();
        setWorkflows(allWorkflows);
        localStorage.setItem('govflow_workflows', JSON.stringify(allWorkflows)); // Optional: keep for compatibility

        // Fetch other data from localStorage (for now)
        const allServiceRequests: ServiceRequest[] = JSON.parse(localStorage.getItem('govflow-service-requests') || '[]');
        const allOffices: Office[] = JSON.parse(localStorage.getItem('govflow-offices') || '[]');
        const allUsers: User[] = JSON.parse(localStorage.getItem('govflow-users') || '[]');
        
        setRequests(allServiceRequests);
        setOffices(allOffices);
        setUsers(allUsers);
      } catch (error) {
        console.error('Error fetching data:', error);
        setAlert({ type: 'error', message: 'Failed to load data. Please try again.', show: true });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: ServiceRequest['status']) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-100';
      case 'Rejected': return 'text-red-600 bg-red-100';
      case 'InProgress': return 'text-blue-600 bg-blue-100';
      case 'PendingReview': return 'text-purple-600 bg-purple-100';
      case 'PendingApproval': return 'text-orange-600 bg-orange-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusIcon = (status: ServiceRequest['status']) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="h-4 w-4" />;
      case 'Rejected': return <XCircle className="h-4 w-4" />;
      case 'InProgress': return <Clock className="h-4 w-4" />;
      case 'PendingReview': return <Eye className="h-4 w-4" />;
      case 'PendingApproval': return <TrendingUp className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesOffice = filterOffice === 'all' || request.assignedToOfficeId === filterOffice;
    const matchesSubject = filterSubject === 'all' || request.serviceRequestData.subjectId === filterSubject;
    const matchesSearch = searchTerm === '' || 
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.serviceRequestData.citizenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.serviceRequestData.nicNumber.includes(searchTerm);

    return matchesStatus && matchesOffice && matchesSubject && matchesSearch;
  });

  const getStatistics = () => {
    const total = requests.length;
    const completed = requests.filter(r => r.status === 'Completed').length;
    const inProgress = requests.filter(r => r.status === 'InProgress').length;
    const pendingReview = requests.filter(r => r.status === 'PendingReview').length;
    const pendingApproval = requests.filter(r => r.status === 'PendingApproval').length;
    const rejected = requests.filter(r => r.status === 'Rejected').length;

    return {
      total,
      completed,
      inProgress,
      pendingReview,
      pendingApproval,
      rejected,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  const stats = getStatistics();

  const handleRequestClick = (request: ServiceRequest) => {
    setSelectedRequest(request);
  };

  const handleApprove = async (stepId: string, comment?: string) => {
    if (!selectedRequest || !user) {
      setAlert({ type: 'error', message: 'No request selected or user not authenticated', show: true });
      return;
    }

    try {
      // Check if step has already been processed
      const stepHistory = selectedRequest.history.find(h => h.stepId === stepId);
      if (stepHistory && (stepHistory.action === 'Approved' || stepHistory.action === 'Rejected')) {
        setAlert({ type: 'warning', message: 'This step has already been processed and cannot be modified', show: true });
        return;
      }

      // Update the service request
      const updatedRequest: ServiceRequest = {
        ...selectedRequest,
        status: 'InProgress',
        updatedAt: new Date().toISOString(),
        history: [
          ...selectedRequest.history,
          {
            stepId: stepId,
            stepName: 'Department Head Approval',
            userId: user.id,
            userName: user.name,
            timestamp: new Date().toISOString(),
            action: 'Approved',
            comment: comment || 'Approved by Department Head',
            data: {},
            documents: []
          }
        ]
      };

      // Update localStorage
      const allRequests = JSON.parse(localStorage.getItem('govflow-service-requests') || '[]');
      const updatedRequests = allRequests.map((req: ServiceRequest) => 
        req.id === selectedRequest.id ? updatedRequest : req
      );
      localStorage.setItem('govflow-service-requests', JSON.stringify(updatedRequests));

      // Update state
      setRequests(updatedRequests);
      setSelectedRequest(updatedRequest);
      setAlert({ type: 'success', message: 'Step approved successfully!', show: true });
    } catch (error) {
      console.error('Error approving step:', error);
      setAlert({ type: 'error', message: 'Failed to approve step. Please try again.', show: true });
    }
  };

  const handleReject = async (stepId: string, reason: string) => {
    if (!selectedRequest || !user) {
      setAlert({ type: 'error', message: 'No request selected or user not authenticated', show: true });
      return;
    }

    try {
      // Check if step has already been processed
      const stepHistory = selectedRequest.history.find(h => h.stepId === stepId);
      if (stepHistory && (stepHistory.action === 'Approved' || stepHistory.action === 'Rejected')) {
        setAlert({ type: 'warning', message: 'This step has already been processed and cannot be modified', show: true });
        return;
      }

      // Update the service request
      const updatedRequest: ServiceRequest = {
        ...selectedRequest,
        status: 'Rejected',
        updatedAt: new Date().toISOString(),
        history: [
          ...selectedRequest.history,
          {
            stepId: stepId,
            stepName: 'Department Head Approval',
            userId: user.id,
            userName: user.name,
            timestamp: new Date().toISOString(),
            action: 'Rejected',
            comment: reason,
            data: {},
            documents: []
          }
        ]
      };

      // Update localStorage
      const allRequests = JSON.parse(localStorage.getItem('govflow-service-requests') || '[]');
      const updatedRequests = allRequests.map((req: ServiceRequest) => 
        req.id === selectedRequest.id ? updatedRequest : req
      );
      localStorage.setItem('govflow-service-requests', JSON.stringify(updatedRequests));

      // Update state
      setRequests(updatedRequests);
      setSelectedRequest(updatedRequest);
      setAlert({ type: 'success', message: 'Step rejected successfully!', show: true });
    } catch (error) {
      console.error('Error rejecting step:', error);
      setAlert({ type: 'error', message: 'Failed to reject step. Please try again.', show: true });
    }
  };

  const handleRequestCorrection = async (stepId: string, comment: string) => {
    if (!selectedRequest || !user) {
      setAlert({ type: 'error', message: 'No request selected or user not authenticated', show: true });
      return;
    }

    try {
      // Check if step has already been processed
      const stepHistory = selectedRequest.history.find(h => h.stepId === stepId);
      if (stepHistory && (stepHistory.action === 'Approved' || stepHistory.action === 'Rejected')) {
        setAlert({ type: 'warning', message: 'This step has already been processed and cannot be modified', show: true });
        return;
      }

      // Update the service request
      const updatedRequest: ServiceRequest = {
        ...selectedRequest,
        status: 'PendingReview',
        updatedAt: new Date().toISOString(),
        history: [
          ...selectedRequest.history,
          {
            stepId: stepId,
            stepName: 'Department Head Review',
            userId: user.id,
            userName: user.name,
            timestamp: new Date().toISOString(),
            action: 'Correction Requested',
            comment: comment,
            data: {},
            documents: []
          }
        ]
      };

      // Update localStorage
      const allRequests = JSON.parse(localStorage.getItem('govflow-service-requests') || '[]');
      const updatedRequests = allRequests.map((req: ServiceRequest) => 
        req.id === selectedRequest.id ? updatedRequest : req
      );
      localStorage.setItem('govflow-service-requests', JSON.stringify(updatedRequests));

      // Update state
      setRequests(updatedRequests);
      setSelectedRequest(updatedRequest);
      setAlert({ type: 'success', message: 'Correction requested successfully!', show: true });
    } catch (error) {
      console.error('Error requesting correction:', error);
      setAlert({ type: 'error', message: 'Failed to request correction. Please try again.', show: true });
    }
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Command Center</h1>
          <p className="text-gray-600">Monitor and manage all workflow processes</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => setViewMode(viewMode === 'list' ? 'graph' : 'list')}
            variant="secondary"
          >
            {viewMode === 'list' ? 'Graph View' : 'List View'}
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              <p className="text-sm text-gray-500">{stats.completionRate}% completion rate</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingReview}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by ID, name, or NIC..."
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="New">New</option>
              <option value="InProgress">In Progress</option>
              <option value="PendingReview">Pending Review</option>
              <option value="PendingApproval">Pending Approval</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Office</label>
            <select
              value={filterOffice}
              onChange={(e) => setFilterOffice(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Offices</option>
              {offices.map(office => (
                <option key={office.id} value={office.id}>{office.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request List */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Service Requests ({filteredRequests.length})
              </h2>
            </div>

            <div className="space-y-3">
              {filteredRequests.map(request => {
                const workflow = workflows.find(w => w.id === request.workflowDefinitionId);
                const subject = subjects.find(s => s.id === request.serviceRequestData.subjectId);
                const office = offices.find(o => o.id === request.assignedToOfficeId);
                const currentStep = workflow?.steps.find(s => s.id === request.currentStepId);

                // Calculate total documents uploaded across all history events
                const totalDocuments = request.history.reduce((total, event) => {
                  return total + (event.documents ? event.documents.length : 0);
                }, 0);

                // Get recent documents (last 3 events with documents)
                const recentDocuments = request.history
                  .filter(event => event.documents && event.documents.length > 0)
                  .slice(-3)
                  .flatMap(event => event.documents || []);

                return (
                  <div
                    key={request.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedRequest?.id === request.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => handleRequestClick(request)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900">#{request.id}</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)}
                            <span className="ml-1">{request.status}</span>
                          </span>
                          {totalDocuments > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <FileText className="h-3 w-3 mr-1" />
                              {totalDocuments} docs
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Citizen:</span> {request.serviceRequestData.citizenName}
                          </div>
                          <div>
                            <span className="text-gray-500">NIC:</span> {request.serviceRequestData.nicNumber}
                          </div>
                          <div>
                            <span className="text-gray-500">Subject:</span> {subject?.name || 'N/A'}
                          </div>
                          <div>
                            <span className="text-gray-500">Office:</span> {office?.name || 'N/A'}
                          </div>
                          <div>
                            <span className="text-gray-500">Current Step:</span> {currentStep?.name || 'N/A'}
                          </div>
                          <div>
                            <span className="text-gray-500">Created:</span> {new Date(request.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Show recent documents if any */}
                        {recentDocuments.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-700">Recent Documents</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {recentDocuments.slice(0, 3).map((doc, index) => (
                                <span 
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                                  title={doc.name}
                                >
                                  <FileText className="h-3 w-3 mr-1" />
                                  {doc.name.length > 20 ? doc.name.substring(0, 20) + '...' : doc.name}
                                </span>
                              ))}
                              {recentDocuments.length > 3 && (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                                  +{recentDocuments.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          onClick={() => {
                            navigate(`/command-center/${request.id}`);
                          }}
                          variant="secondary"
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        {totalDocuments > 0 && (
                          <Button
                            onClick={() => {
                              navigate(`/command-center/${request.id}`);
                            }}
                            variant="secondary"
                            size="sm"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View Docs
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredRequests.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No requests found matching the current filters.</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Workflow Details */}
        <div className="lg:col-span-1">
          {selectedRequest ? (
            <Card>
              <h3 className="text-lg font-semibold mb-4">Workflow Details</h3>
              {(() => {
                const workflow = workflows.find(w => w.id === selectedRequest.workflowDefinitionId);
                if (!workflow) return <p className="text-gray-500">Workflow not found</p>;

                return (
                  <WorkflowVisualizer
                    serviceRequest={selectedRequest}
                    workflowDefinition={workflow}
                    onStepClick={(stepId) => console.log('Step clicked:', stepId)}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onRequestCorrection={handleRequestCorrection}
                  />
                );
              })()}
            </Card>
          ) : (
            <Card>
              <div className="text-center py-8">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select a request to view workflow details</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandCenterPage; 