import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Plus, Edit, Trash2, Eye, Settings, Copy, Archive } from 'lucide-react';
import { WorkflowDefinition, Subject, Office, Section } from '@/types';
import WorkflowStudio from '../../components/workflow/WorkflowStudio';
import { getWorkflows } from '../../services/workflowService';
import { getSubjects } from '../../services/subjectService';
import { getOffices } from '../../services/officeService';
import { getSections } from '../../services/sectionService';

const AdminWorkflowManagementPage: React.FC = () => {
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowDefinition | null>(null);
  const [showStudio, setShowStudio] = useState(false);
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { t } = useTranslation();

  useEffect(() => {
    Promise.all([
      getWorkflows(),
      getSubjects(),
      getOffices(),
      getSections()
    ]).then(([wf, subj, off, sect]) => {
      setWorkflows(wf);
      // Optionally keep for compatibility:
      localStorage.setItem('govflow_workflows', JSON.stringify(wf));
      setSubjects(subj);
      setOffices(off);
      setSections(sect);
    }).catch(() => {
      setWorkflows([]);
      setSubjects([]);
      setOffices([]);
      setSections([]);
    });
  }, []);

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSubject = filterSubject === 'all' || workflow.subjectId === filterSubject;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && workflow.isActive) ||
      (filterStatus === 'inactive' && !workflow.isActive);
    const matchesSearch = searchTerm === '' || 
      workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.description?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSubject && matchesStatus && matchesSearch;
  });

  const handleCreateWorkflow = () => {
    setSelectedWorkflow(null);
    setShowStudio(true);
  };

  const handleEditWorkflow = (workflow: WorkflowDefinition) => {
    setSelectedWorkflow(workflow);
    setShowStudio(true);
  };

  const handleDuplicateWorkflow = (workflow: WorkflowDefinition) => {
    const duplicatedWorkflow: WorkflowDefinition = {
      ...workflow,
      id: `wf_${Date.now()}`,
      name: `${workflow.name} (Copy)`,
      version: '1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: false
    };
    setWorkflows(prev => [...prev, duplicatedWorkflow]);
  };

  const handleToggleWorkflowStatus = (workflowId: string) => {
    setWorkflows(prev => 
      prev.map(w => 
        w.id === workflowId 
          ? { ...w, isActive: !w.isActive, updatedAt: new Date().toISOString() }
          : w
      )
    );
  };

  const handleDeleteWorkflow = (workflowId: string) => {
    if (window.confirm('Are you sure you want to delete this workflow? This action cannot be undone.')) {
      setWorkflows(prev => prev.filter(w => w.id !== workflowId));
      if (selectedWorkflow?.id === workflowId) {
        setSelectedWorkflow(null);
      }
    }
  };

  const getWorkflowStats = () => {
    const total = workflows.length;
    const active = workflows.filter(w => w.isActive).length;
    const inactive = total - active;
    const avgSteps = workflows.length > 0 
      ? Math.round(workflows.reduce((acc, w) => acc + w.steps.length, 0) / workflows.length)
      : 0;

    return { total, active, inactive, avgSteps };
  };

  const stats = getWorkflowStats();

  if (showStudio) {
    return (
      <div className="h-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {selectedWorkflow ? 'Edit Workflow' : 'Create New Workflow'}
            </h1>
            <p className="text-gray-600">
              {selectedWorkflow ? 'Modify workflow configuration' : 'Design a new workflow process'}
            </p>
          </div>
          <Button
            onClick={() => setShowStudio(false)}
            variant="secondary"
          >
            Back to Workflows
          </Button>
        </div>
        <WorkflowStudio
          workflow={selectedWorkflow || undefined}
          onSave={(workflow) => {
            if (selectedWorkflow) {
              setWorkflows(prev => 
                prev.map(w => w.id === workflow.id ? workflow : w)
              );
            } else {
              setWorkflows(prev => [...prev, workflow]);
            }
            setShowStudio(false);
            setSelectedWorkflow(null);
          }}
          onCancel={() => {
            setShowStudio(false);
            setSelectedWorkflow(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workflow Management</h1>
          <p className="text-gray-600">Create and manage workflow processes</p>
        </div>
        <Button onClick={handleCreateWorkflow} className="flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Settings className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Workflows</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-gray-100 rounded-lg">
              <Archive className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Settings className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Steps</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgSteps}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search workflows..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Workflows List */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Workflows ({filteredWorkflows.length})
          </h2>
        </div>

        <div className="space-y-4">
          {filteredWorkflows.map(workflow => {
            const subject = subjects.find(s => s.id === workflow.subjectId);
            
            return (
              <div
                key={workflow.id}
                className={`p-6 border rounded-lg transition-colors ${
                  workflow.isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        workflow.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {workflow.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-sm text-gray-500">v{workflow.version}</span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{workflow.description || 'No description'}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Subject:</span> {subject?.name || 'N/A'}
                      </div>
                      <div>
                        <span className="text-gray-500">Steps:</span> {workflow.steps.length}
                      </div>
                      <div>
                        <span className="text-gray-500">Created:</span> {new Date(workflow.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleEditWorkflow(workflow)}
                      variant="secondary"
                      size="sm"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    
                    <Button
                      onClick={() => handleDuplicateWorkflow(workflow)}
                      variant="secondary"
                      size="sm"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Duplicate
                    </Button>
                    
                    <Button
                      onClick={() => handleToggleWorkflowStatus(workflow.id)}
                      variant="secondary"
                      size="sm"
                    >
                      {workflow.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    
                    <Button
                      onClick={() => handleDeleteWorkflow(workflow.id)}
                      variant="secondary"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Steps Preview */}
                {workflow.steps.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Steps Preview</h4>
                    <div className="flex flex-wrap gap-2">
                      {workflow.steps.slice(0, 5).map((step, index) => (
                        <span
                          key={step.id}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                        >
                          {index + 1}. {step.name}
                        </span>
                      ))}
                      {workflow.steps.length > 5 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                          +{workflow.steps.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredWorkflows.length === 0 && (
            <div className="text-center py-12">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterSubject !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'Get started by creating your first workflow.'}
              </p>
              {!searchTerm && filterSubject === 'all' && filterStatus === 'all' && (
                <Button onClick={handleCreateWorkflow}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Workflow
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AdminWorkflowManagementPage;
