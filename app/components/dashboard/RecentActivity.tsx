import React from 'react';
import { Clock, User, FileText, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

interface ActivityItem {
  id: string;
  type: 'request_submitted' | 'task_assigned' | 'status_updated' | 'document_uploaded' | 'approval_required' | 'completed';
  title: string;
  description: string;
  timestamp: string;
  userId: string;
  userName: string;
  serviceRequestId?: string;
  status?: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  loading?: boolean;
  maxItems?: number;
}

const ActivityIcon: React.FC<{ type: ActivityItem['type'] }> = ({ type }) => {
  const iconClasses = 'h-5 w-5';
  
  switch (type) {
    case 'request_submitted':
      return <FileText className={`${iconClasses} text-blue-500`} />;
    case 'task_assigned':
      return <User className={`${iconClasses} text-green-500`} />;
    case 'status_updated':
      return <Clock className={`${iconClasses} text-yellow-500`} />;
    case 'document_uploaded':
      return <FileText className={`${iconClasses} text-purple-500`} />;
    case 'approval_required':
      return <AlertCircle className={`${iconClasses} text-red-500`} />;
    case 'completed':
      return <CheckCircle className={`${iconClasses} text-green-600`} />;
    default:
      return <Clock className={`${iconClasses} text-gray-500`} />;
  }
};

const ActivityBadge: React.FC<{ type: ActivityItem['type'] }> = ({ type }) => {
  const badgeConfig = {
    request_submitted: { label: 'Submitted', variant: 'primary' as const },
    task_assigned: { label: 'Assigned', variant: 'success' as const },
    status_updated: { label: 'Updated', variant: 'info' as const },
    document_uploaded: { label: 'Document', variant: 'primary' as const },
    approval_required: { label: 'Approval', variant: 'warning' as const },
    completed: { label: 'Completed', variant: 'success' as const }
  };

  const config = badgeConfig[type];
  return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return date.toLocaleDateString();
};

const RecentActivity: React.FC<RecentActivityProps> = ({ 
  activities, 
  loading = false, 
  maxItems = 10 
}) => {
  const displayActivities = activities.slice(0, maxItems);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          View All
        </button>
      </div>
      
      {displayActivities.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 group">
              <div className="flex-shrink-0">
                <ActivityIcon type={activity.type} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </p>
                  <div className="flex items-center space-x-2">
                    <ActivityBadge type={activity.type} />
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mt-1">
                  {activity.description}
                </p>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">by</span>
                    <span className="text-xs font-medium text-gray-700">
                      {activity.userName}
                    </span>
                  </div>
                  
                  {activity.serviceRequestId && (
                    <button className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>View Request</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {activities.length > maxItems && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium">
            Load More Activity
          </button>
        </div>
      )}
    </Card>
  );
};

export default RecentActivity; 