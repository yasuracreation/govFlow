import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { DocumentTemplate } from '../../types';
import { Plus, Edit3, Trash2, Save, X, Upload, Download, Eye } from 'lucide-react';
import CustomAlert from '../common/CustomAlert';

interface DocumentTemplateManagerProps {
  documentTemplates: DocumentTemplate[];
  onSave: (template: DocumentTemplate) => void;
  onDelete: (templateId: string) => void;
  onUpdate: (template: DocumentTemplate) => void;
}

const DocumentTemplateManager: React.FC<DocumentTemplateManagerProps> = ({
  documentTemplates,
  onSave,
  onDelete,
  onUpdate
}) => {
  const [editingTemplate, setEditingTemplate] = useState<DocumentTemplate | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [alert, setAlert] = useState<{ type: 'error'; message: string; show: boolean } | null>(null);

  const fileTypeOptions = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'docx', label: 'Word Document (.docx)' },
    { value: 'doc', label: 'Word Document (.doc)' }
  ];

  const handleAddNew = () => {
    const newTemplate: DocumentTemplate = {
      id: `template-${Date.now()}`,
      name: '',
      description: '',
      fileUrl: '',
      fileType: 'pdf',
      version: '1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };
    setEditingTemplate(newTemplate);
    setIsAddingNew(true);
  };

  const handleEdit = (template: DocumentTemplate) => {
    setEditingTemplate({ ...template });
    setIsAddingNew(false);
  };

  const handleSave = () => {
    if (!editingTemplate) return;
    
    if (!editingTemplate.name.trim()) {
      setAlert({ type: 'error', message: 'Template name is required', show: true });
      return;
    }

    if (isAddingNew) {
      onSave(editingTemplate);
    } else {
      onUpdate({ ...editingTemplate, updatedAt: new Date().toISOString() });
    }
    
    setEditingTemplate(null);
    setIsAddingNew(false);
  };

  const handleCancel = () => {
    setEditingTemplate(null);
    setIsAddingNew(false);
  };

  const handleTemplateChange = (field: keyof DocumentTemplate, value: any) => {
    if (!editingTemplate) return;
    setEditingTemplate({ ...editingTemplate, [field]: value });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && editingTemplate) {
      // In a real application, you would upload the file to a server
      // For now, we'll just simulate it
      const fileUrl = URL.createObjectURL(file);
      setEditingTemplate({
        ...editingTemplate,
        fileUrl,
        fileType: file.name.endsWith('.pdf') ? 'pdf' : 
                  file.name.endsWith('.docx') ? 'docx' : 'doc'
      });
    }
  };

  const handlePreview = (template: DocumentTemplate) => {
    if (template.fileUrl) {
      window.open(template.fileUrl, '_blank');
    } else {
      setAlert({ type: 'error', message: 'No file uploaded for this template', show: true });
    }
  };

  const handleDownload = (template: DocumentTemplate) => {
    if (template.fileUrl) {
      const link = document.createElement('a');
      link.href = template.fileUrl;
      link.download = template.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      setAlert({ type: 'error', message: 'No file uploaded for this template', show: true });
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Document Templates</h2>
        <Button
          variant="primary"
          onClick={handleAddNew}
          leftIcon={<Plus size={16} />}
          disabled={!!editingTemplate}
        >
          Add New Template
        </Button>
      </div>

      {editingTemplate && (
        <Card title={isAddingNew ? "Add New Document Template" : "Edit Document Template"} className="bg-blue-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Template Name"
              value={editingTemplate.name}
              onChange={(e) => handleTemplateChange('name', e.target.value)}
              placeholder="e.g., Business License Application Form"
              required
            />
            <Input
              label="Version"
              value={editingTemplate.version}
              onChange={(e) => handleTemplateChange('version', e.target.value)}
              placeholder="e.g., 1.0"
              required
            />
            <Select
              label="File Type"
              value={editingTemplate.fileType}
              onChange={(e) => handleTemplateChange('fileType', e.target.value)}
              options={fileTypeOptions}
              required
            />
            <div className="flex items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template File
                </label>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <Input
                label="Description"
                value={editingTemplate.description || ''}
                onChange={(e) => handleTemplateChange('description', e.target.value)}
                placeholder="Brief description of this template and its purpose"
              />
            </div>
          </div>

          {editingTemplate.fileUrl && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-800">
                ✓ File uploaded successfully
              </p>
            </div>
          )}

          <div className="mt-6 flex space-x-2">
            <Button onClick={handleSave} leftIcon={<Save size={16} />}>
              {isAddingNew ? 'Create Template' : 'Update Template'}
            </Button>
            <Button onClick={handleCancel} variant="secondary">
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Template List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documentTemplates.map(template => (
          <Card key={template.id} title={template.name} className="hover:shadow-md transition-shadow">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Version:</span> {template.version}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Type:</span> {template.fileType.toUpperCase()}
              </p>
              {template.description && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Description:</span> {template.description}
                </p>
              )}
              <p className="text-sm text-gray-600">
                <span className="font-medium">Created:</span> {new Date(template.createdAt).toLocaleDateString()}
              </p>
              <div className="flex items-center space-x-2">
                <span className={`