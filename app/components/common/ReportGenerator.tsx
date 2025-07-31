import React, { useState } from 'react';
import { Download, FileText, BarChart3, PieChart, TrendingUp, Calendar, Filter } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import Select from './Select';
import Input from './Input';
import Checkbox from './Checkbox';
import Modal from './Modal';

interface ReportConfig {
  id: string;
  name: string;
  type: 'summary' | 'detailed' | 'analytics' | 'performance';
  format: 'pdf' | 'excel' | 'csv';
  filters: {
    dateFrom?: string;
    dateTo?: string;
    status?: string[];
    serviceType?: string[];
    officeId?: string[];
    assignedTo?: string[];
  };
  columns: string[];
  groupBy?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface ReportGeneratorProps {
  onGenerate: (config: ReportConfig) => Promise<void>;
  onExport: (config: ReportConfig, format: string) => Promise<void>;
  loading?: boolean;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  onGenerate,
  onExport,
  loading = false
}) => {
  const [showConfig, setShowConfig] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [config, setConfig] = useState<Partial<ReportConfig>>({
    filters: {},
    columns: [],
    format: 'pdf'
  });

  const reportTypes = [
    { value: 'service_requests_summary', label: 'Service Requests Summary' },
    { value: 'service_requests_detailed', label: 'Service Requests Detailed' },
    { value: 'performance_analytics', label: 'Performance Analytics' },
    { value: 'user_activity', label: 'User Activity Report' },
    { value: 'office_performance', label: 'Office Performance Report' },
    { value: 'workflow_analytics', label: 'Workflow Analytics' },
    { value: 'processing_times', label: 'Processing Times Analysis' },
    { value: 'completion_rates', label: 'Completion Rates Report' }
  ];

  const statusOptions = [
    { value: 'New', label: 'New' },
    { value: 'InProgress', label: 'In Progress' },
    { value: 'PendingReview', label: 'Pending Review' },
    { value: 'PendingApproval', label: 'Pending Approval' },
    { value: 'CorrectionRequested', label: 'Correction Requested' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Rejected', label: 'Rejected' }
  ];

  const serviceTypes = [
    { value: 'BUSINESS_REGISTRATION', label: 'Business Name Registration' },
    { value: 'TREE_FELLING', label: 'Tree Felling Permits' },
    { value: 'ELDERS_ID', label: 'Elders ID Issuance' },
    { value: 'GRAMANILADHARI', label: 'Grama Niladhari Attestations' },
    { value: 'NUTRITION_CERT', label: 'Nutrition Certificates' },
    { value: 'REVENUE_CERT', label: 'Revenue Certificates' },
    { value: 'SAND_MINING', label: 'Sand Mining Permits' },
    { value: 'SCHOLARSHIP', label: 'Scholarship Recommendations' },
    { value: 'TIMBER_TRANSPORT', label: 'Timber Transport Permits' },
    { value: 'LAND_ADMIN', label: 'Land Administration' }
  ];

  const columnOptions = [
    { value: 'id', label: 'Request ID' },
    { value: 'citizenName', label: 'Citizen Name' },
    { value: 'nicNumber', label: 'NIC Number' },
    { value: 'serviceType', label: 'Service Type' },
    { value: 'status', label: 'Status' },
    { value: 'submittedAt', label: 'Submitted Date' },
    { value: 'assignedTo', label: 'Assigned To' },
    { value: 'office', label: 'Office' },
    { value: 'processingTime', label: 'Processing Time' },
    { value: 'completionDate', label: 'Completion Date' }
  ];

  const groupByOptions = [
    { value: 'serviceType', label: 'Service Type' },
    { value: 'status', label: 'Status' },
    { value: 'office', label: 'Office' },
    { value: 'assignedTo', label: 'Assigned To' },
    { value: 'month', label: 'Month' },
    { value: 'week', label: 'Week' }
  ];

  const handleReportTypeChange = (reportType: string) => {
    setSelectedReport(reportType);
    
    // Set default configuration based on report type
    const defaultConfigs: Record<string, Partial<ReportConfig>> = {
      service_requests_summary: {
        type: 'summary',
        columns: ['id', 'serviceType', 'status', 'submittedAt'],
        groupBy: 'serviceType'
      },
      service_requests_detailed: {
        type: 'detailed',
        columns: ['id', 'citizenName', 'nicNumber', 'serviceType', 'status', 'submittedAt', 'assignedTo', 'office']
      },
      performance_analytics: {
        type: 'analytics',
        columns: ['serviceType', 'processingTime', 'completionDate'],
        groupBy: 'serviceType'
      },
      user_activity: {
        type: 'analytics',
        columns: ['assignedTo', 'serviceType', 'status'],
        groupBy: 'assignedTo'
      },
      office_performance: {
        type: 'performance',
        columns: ['office', 'serviceType', 'processingTime', 'completionDate'],
        groupBy: 'office'
      },
      workflow_analytics: {
        type: 'analytics',
        columns: ['serviceType', 'status', 'processingTime'],
        groupBy: 'status'
      },
      processing_times: {
        type: 'analytics',
        columns: ['serviceType', 'processingTime', 'completionDate'],
        groupBy: 'serviceType'
      },
      completion_rates: {
        type: 'performance',
        columns: ['serviceType', 'status', 'completionDate'],
        groupBy: 'serviceType'
      }
    };

    setConfig(prev => ({
      ...prev,
      ...defaultConfigs[reportType]
    }));
  };

  const handleGenerate = async () => {
    if (!selectedReport) return;
    
    const fullConfig: ReportConfig = {
      id: `report_${Date.now()}`,
      name: reportTypes.find(r => r.value === selectedReport)?.label || 'Custom Report',
      type: config.type || 'summary',
      format: config.format || 'pdf',
      filters: config.filters || {},
      columns: config.columns || [],
      groupBy: config.groupBy,
      sortBy: config.sortBy,
      sortOrder: config.sortOrder || 'desc'
    };

    await onGenerate(fullConfig);
  };

  const handleExport = async (format: string) => {
    if (!selectedReport) return;
    
    const fullConfig: ReportConfig = {
      id: `report_${Date.now()}`,
      name: reportTypes.find(r => r.value === selectedReport)?.label || 'Custom Report',
      type: config.type || 'summary',
      format: format as 'pdf' | 'excel' | 'csv',
      filters: config.filters || {},
      columns: config.columns || [],
      groupBy: config.groupBy,
      sortBy: config.sortBy,
      sortOrder: config.sortOrder || 'desc'
    };

    await onExport(fullConfig, format);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Report Generator</h3>
        <Button
          variant="outline"
          onClick={() => setShowConfig(true)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Advanced Configuration
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Report Type Selection */}
        <Card className="p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Report Type</h4>
          <Select
            value={selectedReport}
            onChange={(e) => handleReportTypeChange(e.target.value)}
            options={reportTypes}
          />
        </Card>

        {/* Export Format */}
        <Card className="p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Export Format</h4>
          <div className="flex space-x-2">
            <Button
              variant={config.format === 'pdf' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleExport('pdf')}
              leftIcon={<Download size={16} />}
            >
              PDF
            </Button>
            <Button
              variant={config.format === 'excel' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleExport('excel')}
              leftIcon={<Download size={16} />}
            >
              Excel
            </Button>
            <Button
              variant={config.format === 'csv' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleExport('csv')}
              leftIcon={<Download size={16} />}
            >
              CSV
            </Button>
          </div>
        </Card>
      </div>

      {/* Quick Filters */}
      <Card className="p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Quick Filters</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
            <Input
              type="date"
              value={config.filters?.dateFrom || ''}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                filters: { ...prev.filters, dateFrom: e.target.value }
              }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
            <Input
              type="date"
              value={config.filters?.dateTo || ''}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                filters: { ...prev.filters, dateTo: e.target.value }
              }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <Select
              value={config.filters?.status?.[0] || ''}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                filters: { ...prev.filters, status: e.target.value ? [e.target.value] : [] }
              }))}
              options={[{ value: '', label: 'All Statuses' }, ...statusOptions]}
            />
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <Button
            onClick={handleGenerate}
            disabled={!selectedReport || loading}
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
          {selectedReport && (
            <>
              <Button
                variant="outline"
                onClick={() => handleExport('pdf')}
                disabled={loading}
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('excel')}
                disabled={loading}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Advanced Configuration Modal */}
      <Modal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        title="Advanced Report Configuration"
        size="xl"
      >
        <div className="space-y-6">
          {/* Column Selection */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Select Columns</h4>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {columnOptions.map(option => (
                <Checkbox
                  key={option.value}
                  label={option.label}
                  checked={config.columns?.includes(option.value)}
                  onChange={(e) => {
                    const newColumns = e.target.checked
                      ? [...(config.columns || []), option.value]
                      : (config.columns || []).filter(col => col !== option.value);
                    setConfig(prev => ({ ...prev, columns: newColumns }));
                  }}
                />
              ))}
            </div>
          </div>

          {/* Group By */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-2">Group By</h4>
            <Select
              value={config.groupBy || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, groupBy: e.target.value }))}
              options={[{ value: '', label: 'No Grouping' }, ...groupByOptions]}
            />
          </div>

          {/* Sort Options */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">Sort By</h4>
              <Select
                value={config.sortBy || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, sortBy: e.target.value }))}
                options={[{ value: '', label: 'Default' }, ...columnOptions]}
              />
            </div>
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">Sort Order</h4>
              <Select
                value={config.sortOrder || 'desc'}
                onChange={(e) => setConfig(prev => ({ ...prev, sortOrder: e.target.value as 'asc' | 'desc' }))}
                options={[
                  { value: 'desc', label: 'Descending' },
                  { value: 'asc', label: 'Ascending' }
                ]}
              />
            </div>
          </div>

          {/* Advanced Filters */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Advanced Filters</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Types</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {serviceTypes.map(option => (
                    <Checkbox
                      key={option.value}
                      label={option.label}
                      checked={config.filters?.serviceType?.includes(option.value)}
                      onChange={(e) => {
                        const newServiceTypes = e.target.checked
                          ? [...(config.filters?.serviceType || []), option.value]
                          : (config.filters?.serviceType || []).filter(type => type !== option.value);
                        setConfig(prev => ({
                          ...prev,
                          filters: { ...prev.filters, serviceType: newServiceTypes }
                        }));
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReportGenerator; 