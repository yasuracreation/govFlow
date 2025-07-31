import React, { useState } from 'react';
import { Clock, User, FileText, CheckCircle, AlertCircle, ArrowRight, Filter, Search } from 'lucide-react';
import Card from './Card';
import Input from './Input';
import Select from './Select';
import Badge from './Badge';
import Button from './Button';

interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  category: 'workflow' | 'document' | 'status' | 'assignment' | 'system' | 'security';
  description: string;
  details?: Record<string, any>;
  serviceRequestId?: string;
  officeId?: string;
  ipAddress?: string;
  userAgent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface AuditTrailProps {
  events: AuditEvent[];
  loading?: boolean;
  onFilter?: (filters: AuditFilters) => void;
  onExport?: () => void;
  showFilters?: boolean;
  maxHeight?: string;
}

interface AuditFilters {
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  action?: string;
  category?: string;
  severity?: string;
  serviceRequestId?: string;
}

const AuditTrail: React.FC<AuditTrailProps> = ({
  events,
  loading = false,
  onFilter,
  onExport,
  showFilters = true,
  maxHeight = '600px'
}) => {
  const [filters, setFilters] = useState<AuditFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const actionTypes = [
    { value: 'created', label: 'Created' },
    { value: 'updated', label: 'Updated' },
    { value: 'deleted', label: 'Deleted' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'uploaded', label: 'Document Uploaded' },
    { value: 'downloaded', label: 'Document Downloaded' },
    { value: 'logged_in', label: 'Logged In' },
    { value: 'logged_out', label: 'Logged Out' },
    { value: 'status_changed', label: 'Status Changed' }
  ];

  const categories = [
    { value: 'workflow', label: 'Workflow' },
    { value: 'document', label: 'Document' },
    { value: 'status', label: 'Status' },
    { value: 'assignment', label: 'Assignment' },
    { value: 'system', label: 'System' },
    { value: 'security', label: 'Security' }
  ];

  const severityLevels = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'created':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'updated':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'deleted':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'assigned':
        return <User className="h-4 w-4 text-purple-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'uploaded':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'downloaded':
        return <FileText className="h-4 w-4 text-gray-600" />;
      case 'logged_in':
        return <User className="h-4 w-4 text-green-500" />;
      case 'logged_out':
        return <User className="h-4 w-4 text-gray-500" />;
      case 'status_changed':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'gray';
      case 'medium': return 'yellow';
      case 'high': return 'orange';
      case 'critical': return 'red';
      default: return 'gray';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleFilterChange = (key: keyof AuditFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // Implement search logic here
  };

  const filteredEvents = events.filter(event => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        event.description.toLowerCase().includes(searchLower) ||
        event.userName.toLowerCase().includes(searchLower) ||
        event.action.toLowerCase().includes(searchLower) ||
        event.serviceRequestId?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
        <h3 className="text-lg font-medium text-gray-900">Audit Trail</h3>
        <div className="flex items-center space-x-2">
          {onExport && (
            <Button
              size="sm"
              variant="outline"
              onClick={onExport}
            >
              Export
            </Button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search audit events..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Basic Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <Input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <Input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
              <Select
                value={filters.action || ''}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                options={[{ value: '', label: 'All Actions' }, ...actionTypes]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <Select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                options={[{ value: '', label: 'All Categories' }, ...categories]}
              />
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
          </Button>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                <Select
                  value={filters.severity || ''}
                  onChange={(e) => handleFilterChange('severity', e.target.value)}
                  options={[{ value: '', label: 'All Severities' }, ...severityLevels]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <Input
                  value={filters.userId || ''}
                  onChange={(e) => handleFilterChange('userId', e.target.value)}
                  placeholder="Enter user ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Request ID</label>
                <Input
                  value={filters.serviceRequestId || ''}
                  onChange={(e) => handleFilterChange('serviceRequestId', e.target.value)}
                  placeholder="Enter request ID"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Events List */}
      <div className="space-y-4" style={{ maxHeight, overflowY: 'auto' }}>
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No audit events found</p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div key={event.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0">
                {getActionIcon(event.action)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{event.userName}</span>
                    <span className="text-sm text-gray-500">({event.userRole})</span>
                    {event.serviceRequestId && (
                      <span className="text-sm text-blue-600 font-medium">
                        #{event.serviceRequestId}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getSeverityColor(event.severity) as any} size="sm">
                      {event.severity}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {getTimeAgo(event.timestamp)}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-medium">{event.action}</span>: {event.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{formatTimestamp(event.timestamp)}</span>
                    {event.ipAddress && (
                      <span>IP: {event.ipAddress}</span>
                    )}
                    {event.officeId && (
                      <span>Office: {event.officeId}</span>
                    )}
                  </div>
                  
                  {event.details && Object.keys(event.details).length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Show details modal or expand details
                        console.log('Event details:', event.details);
                      }}
                    >
                      <ArrowRight className="h-3 w-3 mr-1" />
                      Details
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {filteredEvents.length > 0 && (
        <div className="mt-4 text-sm text-gray-500 text-center">
          Showing {filteredEvents.length} of {events.length} events
        </div>
      )}
    </Card>
  );
};

export default AuditTrail; 