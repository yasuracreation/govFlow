import React from 'react';
import { Clock, User, FileText, AlertCircle, CheckCircle, XCircle, MoreVertical } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';

interface TaskCardProps {
  task: {
    id: string;
    serviceRequestId: string;
    serviceRequestNic: string;
    serviceCategoryName: string;
    currentStepName: string;
    assignedOfficeName?: string;
    status: 'New' | 'InProgress' | 'PendingReview' | 'PendingApproval' | 'CorrectionRequested' | 'Completed' | 'Rejected';
    lastUpdate: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    estimatedCompletionDate?: string;
    assignedToUserId?: string;
    assignedToUserName?: string;
  };
  onViewDetails: (taskId: string) => void;
  onAssign: (taskId: string) => void;
  onUpdateStatus: (taskId: string, status: string) => void;
  userRole: string;
  loading?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onViewDetails,
  onAssign,
  onUpdateStatus,
  userRole,
  loading = false
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'blue';
      case 'InProgress': return 'yellow';
      case 'PendingReview': return 'orange';
      case 'PendingApproval': return 'purple';
      case 'CorrectionRequested': return 'red';
      case 'Completed': return 'green';
      case 'Rejected': return 'red';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = task.estimatedCompletionDate && new Date(task.estimatedCompletionDate) < new Date();

  if (loading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="flex justify-between items-center">
            <div className="h-8 bg-gray-200 rounded w-20"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 hover:shadow-md transition-shadow ${isOverdue ? 'border-l-4 border-l-red-500' : ''}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <FileText className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">
                {task.serviceCategoryName}
              </span>
              {task.priority && (
                <div className="flex items-center space-x-1">
                  {getPriorityIcon(task.priority)}
                  <Badge 
                    variant={getPriorityColor(task.priority) as any} 
                    size="sm"
                  >
                    {task.priority}
                  </Badge>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Request ID: {task.serviceRequestId} • NIC: {task.serviceRequestNic}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={getStatusColor(task.status) as any} size="sm">
              {task.status.replace(/([A-Z])/g, ' $1').trim()}
            </Badge>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Current Step:</span> {task.currentStepName}
          </p>
          {task.assignedOfficeName && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Office:</span> {task.assignedOfficeName}
            </p>
          )}
          {task.assignedToUserName && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Assigned to:</span> {task.assignedToUserName}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>Updated: {formatDate(task.lastUpdate)}</span>
            {task.estimatedCompletionDate && (
              <span className={`flex items-center space-x-1 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                <Clock className="h-3 w-3" />
                <span>
                  {isOverdue ? 'Overdue' : 'Due'}: {formatDate(task.estimatedCompletionDate)}
                </span>
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {!task.assignedToUserId && userRole !== 'FrontDesk' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAssign(task.id)}
              >
                Assign to Me
              </Button>
            )}
            
            {task.assignedToUserId && (userRole === 'Officer' || userRole === 'SectionHead') && (
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateStatus(task.id, 'Completed')}
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Complete
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateStatus(task.id, 'CorrectionRequested')}
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Request Correction
                </Button>
              </div>
            )}
            
            <Button
              size="sm"
              onClick={() => onViewDetails(task.serviceRequestId)}
            >
              View Details
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TaskCard; 