import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth.tsx';
import { DocumentTemplate, CustomFieldDefinition } from '../../types';
import Card from '../../components/common/Card.tsx';
import Button from '../../components/common/Button.tsx';
import Input from '../../components/common/Input.tsx';
import Select from '../../components/common/Select.tsx';
import Alert from '../../components/common/Alert.tsx';
import { FileText, Plus, Edit, Trash2, Download, Search, Filter, Eye, Settings } from 'lucide-react';
import CustomAlert from '../../components/common/CustomAlert';
import DocumentTemplateBuilder from '../../components/template/DocumentTemplateBuilder';
import { getDocumentTemplates, getCustomFields, createDocumentTemplate, updateDocumentTemplate, deleteDocumentTemplate, createCustomField, updateCustomField, deleteCustomField } from '../../services/workflowStudioService';

const AdminTemplateManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'templates' | 'customFields'>('templates');
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<DocumentTemplate | CustomFieldDefinition | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [filteredTemplates, setFilteredTemplates] = useState<DocumentTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string; show: boolean } | null>(null);

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General Document' },
    { value: 'approval', label: 'Approval Letter' },
    { value: 'rejection', label: 'Rejection Letter' },
    { value: 'correction', label: 'Correction Request' },
    { value: 'certificate', label: 'Certificate' },
    { value: 'license', label: 'License Document' },
    { value: 'permit', label: 'Permit Document' },
    { value: 'receipt', label: 'Receipt' },
    { value: 'invoice', label: 'Invoice' },
    { value: 'report', label: 'Report' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm, categoryFilter, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [templateData, customFieldData] = await Promise.all([
        getDocumentTemplates(),
        getCustomFields()
      ]);
      setTemplates(templateData);
      setCustomFields(customFieldData);
    } catch (error) {
      setAlert({ type: 'error', message: t('template.admin.loadError'), show: true });
    }
    setLoading(false);
  };

  const filterTemplates = () => {
    let filtered = templates;
    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (template.category && template.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(template => template.category === categoryFilter);
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(template => 
        statusFilter === 'active' ? template.isActive : !template.isActive
      );
    }
    setFilteredTemplates(filtered);
  };

  const handleCreateTemplate = async (template: Omit<DocumentTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    try {
      const newTemplate = await createDocumentTemplate(template as DocumentTemplate);
      setTemplates(prev => [...prev, newTemplate]);
      setShowCreateModal(false);
      setEditingItem(null);
      setAlert({ type: 'success', message: t('template.admin.createSuccess'), show: true });
    } catch (error) {
      setAlert({ type: 'error', message: t('template.admin.createError'), show: true });
    }
    setLoading(false);
  };

  const handleCreateCustomField = async (field: Omit<CustomFieldDefinition, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    try {
      const newField = await createCustomField(field as CustomFieldDefinition);
      setCustomFields(prev => [...prev, newField]);
      setShowCreateModal(false);
      setEditingItem(null);
      setAlert({ type: 'success', message: t('template.admin.createFieldSuccess'), show: true });
    } catch (error) {
      setAlert({ type: 'error', message: t('template.admin.createFieldError'), show: true });
    }
    setLoading(false);
  };

  const handleUpdateTemplate = async (id: string, updates: Partial<DocumentTemplate>) => {
    setLoading(true);
    try {
      const updated = await updateDocumentTemplate({ ...updates, id } as DocumentTemplate);
      setTemplates(prev => prev.map(template => 
        template.id === id 
          ? updated
          : template
      ));
      setShowCreateModal(false);
      setEditingItem(null);
      setAlert({ type: 'success', message: t('template.admin.updateSuccess'), show: true });
    } catch (error) {
      setAlert({ type: 'error', message: t('template.admin.updateError'), show: true });
    }
    setLoading(false);
  };

  const handleUpdateCustomField = async (id: string, updates: Partial<CustomFieldDefinition>) => {
    setLoading(true);
    try {
      const updated = await updateCustomField({ ...updates, id } as CustomFieldDefinition);
      setCustomFields(prev => prev.map(field => 
        field.id === id 
          ? updated
          : field
      ));
      setShowCreateModal(false);
      setEditingItem(null);
      setAlert({ type: 'success', message: t('template.admin.updateFieldSuccess'), show: true });
    } catch (error) {
      setAlert({ type: 'error', message: t('template.admin.updateFieldError'), show: true });
    }
    setLoading(false);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (window.confirm(t('template.admin.confirmDeleteTemplate'))) {
      setLoading(true);
      try {
        await deleteDocumentTemplate(id);
        setTemplates(prev => prev.filter(template => template.id !== id));
        setAlert({ type: 'success', message: t('template.admin.deleteSuccess'), show: true });
      } catch (error) {
        setAlert({ type: 'error', message: t('template.admin.deleteError'), show: true });
      }
      setLoading(false);
    }
  };

  const handleDeleteCustomField = async (id: string) => {
    if (window.confirm(t('template.admin.confirmDeleteField'))) {
      setLoading(true);
      try {
        await deleteCustomField(id);
        setCustomFields(prev => prev.filter(field => field.id !== id));
        setAlert({ type: 'success', message: t('template.admin.deleteFieldSuccess'), show: true });
      } catch (error) {
        setAlert({ type: 'error', message: t('template.admin.deleteFieldError'), show: true });
      }
      setLoading(false);
    }
  };

  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'select', label: 'Select' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'file', label: 'File Upload' }
  ];

  const fileTypes = [
    { value: 'pdf', label: 'PDF' },
    { value: 'docx', label: 'Word Document' },
    { value: 'doc', label: 'Word Document (Legacy)' }
  ];

  const handleSaveTemplate = (template: DocumentTemplate) => {
    try {
      const updatedTemplates = editingItem
        ? templates.map(t => t.id === template.id ? template : t)
        : [...templates, template];

      setTemplates(updatedTemplates);
      localStorage.setItem('govflow_document_templates', JSON.stringify(updatedTemplates));
      
      setShowBuilder(false);
      setEditingItem(null);
      setAlert({ type: 'success', message: `Template ${editingItem ? 'updated' : 'created'} successfully!`, show: true });
    } catch (error) {
      console.error('Error saving template:', error);
      setAlert({ type: 'error', message: 'Failed to save template', show: true });
    }
  };

  const handleEditTemplate = (template: DocumentTemplate) => {
    setEditingItem(template);
    setShowBuilder(true);
  };

  const handleToggleStatus = (templateId: string) => {
    try {
      const updatedTemplates = templates.map(template =>
        template.id === templateId
          ? { ...template, isActive: !template.isActive, updatedAt: new Date().toISOString() }
          : template
      );
      setTemplates(updatedTemplates);
      localStorage.setItem('govflow_document_templates', JSON.stringify(updatedTemplates));
      setAlert({ type: 'success', message: 'Template status updated successfully!', show: true });
    } catch (error) {
      console.error('Error updating template status:', error);
      setAlert({ type: 'error', message: 'Failed to update template status', show: true });
    }
  };

  const handleGeneratePDF = (template: DocumentTemplate) => {
    // This would integrate with the PDF generation service
    setAlert({ type: 'info', message: 'PDF generation feature will be implemented with jsPDF library', show: true });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      approval: 'bg-green-100 text-green-800',
      rejection: 'bg-red-100 text-red-800',
      correction: 'bg-yellow-100 text-yellow-800',
      certificate: 'bg-blue-100 text-blue-800',
      license: 'bg-purple-100 text-purple-800',
      permit: 'bg-indigo-100 text-indigo-800',
      receipt: 'bg-gray-100 text-gray-800',
      invoice: 'bg-orange-100 text-orange-800',
      report: 'bg-teal-100 text-teal-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.general;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (showBuilder) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {editingItem ? 'Edit Template' : 'Create New Template'}
          </h1>
          <Button onClick={() => { setShowBuilder(false); setEditingItem(null); }} variant="secondary">
            Back to Templates
          </Button>
        </div>
        
        <DocumentTemplateBuilder
          template={editingItem || undefined}
          onSave={handleSaveTemplate}
          onCancel={() => { setShowBuilder(false); setEditingItem(null); }}
        />
      </div>
    );
  }

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

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Document Templates</h1>
          <p className="text-gray-600 mt-2">Manage document templates for generating official documents</p>
        </div>
        <Button onClick={() => setShowBuilder(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search templates..."
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={categoryOptions}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
            />
          </div>
          
          <div className="flex items-end">
            <Button onClick={filterTemplates} variant="secondary" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Templates List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                  {template.category}
                </span>
                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${template.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {template.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex space-x-1">
                <Button
                  onClick={() => handleEditTemplate(template)}
                  variant="secondary"
                  size="sm"
                  title="Edit Template"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => handleToggleStatus(template.id)}
                  variant="secondary"
                  size="sm"
                  title={template.isActive ? 'Deactivate' : 'Activate'}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => handleDeleteTemplate(template.id)}
                  variant="secondary"
                  size="sm"
                  title="Delete Template"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{template.description}</p>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>Version: {template.version}</span>
              <span>Updated: {new Date(template.updatedAt).toLocaleDateString()}</span>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={() => handleGeneratePDF(template)}
                variant="secondary"
                size="sm"
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-1" />
                Generate PDF
              </Button>
              <Button
                onClick={() => handleEditTemplate(template)}
                variant="secondary"
                size="sm"
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search criteria'
                : 'Get started by creating your first document template'
              }
            </p>
            {!searchTerm && categoryFilter === 'all' && statusFilter === 'all' && (
              <Button onClick={() => setShowBuilder(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

// Template Form Component
interface TemplateFormProps {
  template?: DocumentTemplate | null;
  fileTypes: { value: string; label: string }[];
  onSubmit: (template: Omit<DocumentTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const TemplateForm: React.FC<TemplateFormProps> = ({ template, fileTypes, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    fileType: template?.fileType || 'pdf',
    version: template?.version || '1.0',
    isActive: template?.isActive ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('template.admin.templateName')}
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('template.admin.description')}
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('template.admin.fileType')}
        </label>
        <select
          value={formData.fileType}
          onChange={(e) => setFormData(prev => ({ ...prev, fileType: e.target.value as any }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {fileTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('template.admin.version')}
        </label>
        <input
          type="text"
          value={formData.version}
          onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">{t('template.admin.isActive')}</span>
        </label>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {template ? t('common.update') : t('common.create')}
        </button>
      </div>
    </form>
  );
};

// Custom Field Form Component
interface CustomFieldFormProps {
  field?: CustomFieldDefinition | null;
  fieldTypes: { value: string; label: string }[];
  onSubmit: (field: Omit<CustomFieldDefinition, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const CustomFieldForm: React.FC<CustomFieldFormProps> = ({ field, fieldTypes, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: field?.name || '',
    label: field?.label || '',
    type: field?.type || 'text',
    category: field?.category || '',
    description: field?.description || '',
    isActive: field?.isActive ?? true,
    required: field?.validation?.required ?? false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      validation: { required: formData.required },
      options: formData.type === 'select' ? [] : undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('template.admin.fieldName')}
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('template.admin.fieldLabel')}
        </label>
        <input
          type="text"
          value={formData.label}
          onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('template.admin.fieldType')}
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {fieldTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('template.admin.category')}
        </label>
        <input
          type="text"
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('template.admin.description')}
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="space-y-2">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.required}
            onChange={(e) => setFormData(prev => ({ ...prev, required: e.target.checked }))}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">{t('template.admin.required')}</span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">{t('template.admin.isActive')}</span>
        </label>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {field ? t('common.update') : t('common.create')}
        </button>
      </div>
    </form>
  );
};

export default AdminTemplateManagementPage;