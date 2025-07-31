import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ServiceRequest, WorkflowDefinition, Subject, TaskSummary, User, UserRole } from '@/types';
import { useAuth } from '@/hooks/useAuth.tsx';
import { getSubjects } from '../services/subjectService';
import serviceRequestService from '../services/serviceRequestService';
import { getOffices } from '../services/officeService';

const TaskQueuePage: React.FC = () => {
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [allServiceRequests, setAllServiceRequests] = useState<ServiceRequest[]>([]);
  const [offices, setOffices] = useState<any[]>([]); // Assuming Office type is needed for getOffices
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [assignToUserId, setAssignToUserId] = useState<string>('');
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        setSubjectsLoading(true);
        const [fetchedSubjects, fetchedOffices] = await Promise.all([
          getSubjects(),
          getOffices()
        ]);
        setSubjects(fetchedSubjects);
        setOffices(fetchedOffices);
        setSubjectsLoading(false);
        const allRequests: ServiceRequest[] = await serviceRequestService.getServiceRequests();
        setAllServiceRequests(allRequests);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [user]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'in_progress': return <Clock className="h-5 w-5 text-blue-600" />;
      default: return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  // Filter service requests for the queue
  const filteredRequests = allServiceRequests.filter(sr => {
    // Only show requests for user's subjects (unless admin/department head)
    if (user?.role !== UserRole.ADMIN && user?.role !== UserRole.DEPARTMENT_HEAD) {
      if (!user?.subjectIds || !user.subjectIds.includes(String(sr.serviceRequestData.subjectId))) {
        return false;
      }
    }
    // Filter by subject
    if (filterSubject !== 'all' && String(sr.serviceRequestData.subjectId) !== filterSubject) return false;
    // Filter by status
    if (filterStatus !== 'all' && sr.status !== filterStatus) return false;
    // Filter by NIC or citizen name
    if (searchTerm && !(
      sr.serviceRequestData.nicNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sr.serviceRequestData.citizenName?.toLowerCase().includes(searchTerm.toLowerCase())
    )) return false;
    return true;
  });

  const handleStatusChange = (taskId: string, newStatus: ServiceRequest['status']) => {
    // This is a mock interaction. In a real app, this would trigger a backend update
    // and potentially move the service request to the next step.
    console.log(`Task ${taskId} status changed to ${newStatus}`);
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  // Handler to assign a request to the current user
  const handleAssignToMe = async (requestId: string) => {
    setAssigningId(requestId);
    try {
      await serviceRequestService.assignRequest(requestId, user!.id);
      setAllServiceRequests(prev => prev.map(r => r.id === requestId ? { ...r, assignedToUserId: user!.id } : r));
    } finally {
      setAssigningId(null);
    }
  };
  // Handler to assign a request to another user (admin/department head)
  const handleAssignToUser = async (requestId: string, userId: string) => {
    setAssigningId(requestId);
    try {
      await serviceRequestService.assignRequest(requestId, userId);
      setAllServiceRequests(prev => prev.map(r => r.id === requestId ? { ...r, assignedToUserId: userId } : r));
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Service Request Queue</h1>
          <p className="text-gray-600">View and claim service requests for your assigned subjects</p>
        </div>
        <div className="flex space-x-2">
          <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option value="all">All Subjects</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option value="all">All Statuses</option>
            <option value="New">New</option>
            <option value="InProgress">In Progress</option>
            <option value="PendingReview">Pending Review</option>
            <option value="PendingApproval">Pending Approval</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
          </select>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by NIC or name"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="grid gap-4">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((sr) => (
            <Card key={sr.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {subjects.find(s => s.id === sr.serviceRequestData.subjectId)?.name || 'N/A'}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sr.status)}`}>
                      {sr.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Request ID</p>
                      <p className="font-medium">{sr.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Citizen NIC</p>
                      <p className="font-medium">{sr.serviceRequestData.nicNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Current Step</p>
                      <p className="font-medium">{sr.currentStepId}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Last updated: {new Date(sr.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                  {/* Assignment actions */}
                  {(!sr.assignedToUserId || sr.assignedToUserId === '') && (
                    user?.role === UserRole.ADMIN || user?.role === UserRole.DEPARTMENT_HEAD ? (
                      <>
                        <select value={assignToUserId} onChange={e => setAssignToUserId(e.target.value)} className="border border-gray-300 rounded-md px-2 py-1 text-sm mb-2">
                          <option value="">Assign to user</option>
                          {/* Assuming 'users' state exists or is fetched elsewhere */}
                          {/* For now, using a placeholder or fetching users if needed */}
                          {/* Example: const { users } = useUsers(); */}
                          {/* {users.filter(u => u.role === UserRole.OFFICER || u.role === UserRole.SECTION_HEAD).map(u => ( */}
                          {/*   <option key={u.id} value={u.id}>{u.name} ({u.role})</option> */}
                          {/* ))} */}
                        </select>
                        <Button onClick={() => handleAssignToUser(sr.id, assignToUserId)} disabled={!assignToUserId || assigningId === sr.id}>
                          {assigningId === sr.id ? 'Assigning...' : 'Assign'}
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => handleAssignToMe(sr.id)} disabled={assigningId === sr.id}>
                        {assigningId === sr.id ? 'Assigning...' : 'Assign to Me'}
                      </Button>
                    )
                  )}
                  {sr.assignedToUserId && (
                    <span className="text-xs text-gray-700">Assigned to: {/* Assuming 'users' state exists or is fetched elsewhere */}
                      {/* {users.find(u => u.id === sr.assignedToUserId)?.name || sr.assignedToUserId} */}
                      {/* Placeholder for assigned user name */}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center bg-gray-50 border-gray-200">
            <p className="text-gray-700 font-medium">No service requests found matching your filters.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TaskQueuePage; 