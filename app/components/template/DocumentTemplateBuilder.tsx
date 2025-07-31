import React, { useState, useRef, useEffect } from 'react';
import { DocumentTemplate, TemplateVariable } from '../../types';

interface DocumentTemplateBuilderProps {
  template?: DocumentTemplate;
  onSave: (template: DocumentTemplate) => void;
  onCancel: () => void;
}

const DocumentTemplateBuilder: React.FC<DocumentTemplateBuilderProps> = ({
  template,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<Partial<DocumentTemplate>>({
    name: template?.name || '',
    description: template?.description || '',
    content: template?.content || '',
    variables: template?.variables || [],
    isActive: template?.isActive ?? true
  });

  const [showVariableModal, setShowVariableModal] = useState(false);
  const [newVariable, setNewVariable] = useState<Partial<TemplateVariable>>({
    name: '',
    type: 'text',
    description: '',
    required: false
  });

  const editorRef = useRef<HTMLDivElement>(null);
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Available variables for insertion
  const availableVariables = [
    { name: 'customerName', description: 'Customer Full Name', type: 'text' },
    { name: 'customerEmail', description: 'Customer Email Address', type: 'email' },
    { name: 'customerPhone', description: 'Customer Phone Number', type: 'phone' },
    { name: 'customerAddress', description: 'Customer Address', type: 'text' },
    { name: 'requestId', description: 'Service Request ID', type: 'text' },
    { name: 'requestDate', description: 'Request Submission Date', type: 'date' },
    { name: 'requestType', description: 'Type of Service Request', type: 'text' },
    { name: 'requestStatus', description: 'Current Request Status', type: 'text' },
    { name: 'officerName', description: 'Assigned Officer Name', type: 'text' },
    { name: 'officerEmail', description: 'Officer Email Address', type: 'email' },
    { name: 'approvalDate', description: 'Approval Date', type: 'date' },
    { name: 'approvalComments', description: 'Approval Comments', type: 'text' },
    { name: 'departmentName', description: 'Department Name', type: 'text' },
    { name: 'sectionName', description: 'Section Name', type: 'text' },
    { name: 'officeName', description: 'Office Name', type: 'text' }
  ];

  // Initialize editor content only once when component mounts
  useEffect(() => {
    if (editorRef.current && !isInitialized && formData.content) {
      editorRef.current.innerHTML = formData.content;
      setIsInitialized(true);
    }
  }, [formData.content, isInitialized]);

  // Rich text editor commands
  const execCommand = (command: string, value?: string) => {
    if (editorRef.current) {
      document.execCommand(command, false, value);
      editorRef.current.focus();
    }
  };

  const insertVariable = (variableName: string) => {
    if (editorRef.current) {
      const variable = `{{${variableName}}}`;
      document.execCommand('insertText', false, variable);
      editorRef.current.focus();
    }
  };

  const addCustomVariable = () => {
    if (newVariable.name && newVariable.description) {
      const customVariable: TemplateVariable = {
        id: Date.now().toString(),
        name: newVariable.name,
        type: newVariable.type as 'text' | 'email' | 'phone' | 'date' | 'number',
        description: newVariable.description,
        required: newVariable.required || false,
        isCustom: true
      };

      setFormData(prev => ({
        ...prev,
        variables: [...(prev.variables || []), customVariable]
      }));

      setNewVariable({ name: '', type: 'text', description: '', required: false });
      setShowVariableModal(false);
    }
  };

  const removeCustomVariable = (variableId: string) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables?.filter(v => v.id !== variableId) || []
    }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.content) {
      alert('Please fill in all required fields');
      return;
    }

    const templateData: DocumentTemplate = {
      id: template?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description || '',
      content: formData.content,
      variables: formData.variables || [],
      isActive: formData.isActive || false,
      createdAt: template?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(templateData);
  };

  const handlePreview = () => {
    // Create a preview with sample data
    const sampleData = {
      customerName: 'John Doe',
      customerEmail: 'john.doe@example.com',
      customerPhone: '+94 11 234 5678',
      customerAddress: '123 Main Street, Colombo 01',
      requestId: 'REQ-2024-001',
      requestDate: new Date().toLocaleDateString(),
      requestType: 'Business Registration',
      requestStatus: 'Under Review',
      officerName: 'Jane Smith',
      officerEmail: 'jane.smith@gov.lk',
      approvalDate: new Date().toLocaleDateString(),
      approvalComments: 'Approved with conditions',
      departmentName: 'Department of Commerce',
      sectionName: 'Business Registration Section',
      officeName: 'Colombo District Office'
    };

    let previewContent = formData.content || '';
    
    // Replace variables with sample data
    availableVariables.forEach(variable => {
      const regex = new RegExp(`{{${variable.name}}}`, 'g');
      previewContent = previewContent.replace(regex, sampleData[variable.name as keyof typeof sampleData] || `[${variable.name}]`);
    });

    // Replace custom variables
    formData.variables?.forEach(variable => {
      if (variable.isCustom) {
        const regex = new RegExp(`{{${variable.name}}}`, 'g');
        previewContent = previewContent.replace(regex, `[${variable.name}]`);
      }
    });

    // Open preview in new window
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Document Preview</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; }
            .content { text-align: justify; }
            .footer { margin-top: 50px; text-align: center; }
            @media print { body { margin: 20px; } }
          </style>
        </head>
        <body>
          <div class="content">${previewContent}</div>
        </body>
        </html>
      `);
      previewWindow.document.close();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {template ? 'Edit Document Template' : 'Create New Document Template'}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handlePreview}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Preview
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Save Template
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Template Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter template name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter template description"
          />
        </div>
      </div>

      {/* Rich Text Editor Toolbar */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-200 rounded-t-lg">
          {/* Text Formatting */}
          <div className="flex gap-1">
            <button
              onClick={() => execCommand('bold')}
              className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50"
              title="Bold"
            >
              <strong>B</strong>
            </button>
            <button
              onClick={() => execCommand('italic')}
              className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50"
              title="Italic"
            >
              <em>I</em>
            </button>
            <button
              onClick={() => execCommand('underline')}
              className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50"
              title="Underline"
            >
              <u>U</u>
            </button>
          </div>

          {/* Text Alignment */}
          <div className="flex gap-1">
            <button
              onClick={() => execCommand('justifyLeft')}
              className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50"
              title="Align Left"
            >
              ⬅️
            </button>
            <button
              onClick={() => execCommand('justifyCenter')}
              className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50"
              title="Align Center"
            >
              ↔️
            </button>
            <button
              onClick={() => execCommand('justifyRight')}
              className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50"
              title="Align Right"
            >
              ➡️
            </button>
            <button
              onClick={() => execCommand('justifyFull')}
              className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50"
              title="Justify"
            >
              ↔️↔️
            </button>
          </div>

          {/* Lists */}
          <div className="flex gap-1">
            <button
              onClick={() => execCommand('insertUnorderedList')}
              className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50"
              title="Bullet List"
            >
              •
            </button>
            <button
              onClick={() => execCommand('insertOrderedList')}
              className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50"
              title="Numbered List"
            >
              1.
            </button>
          </div>

          {/* Headings */}
          <div className="flex gap-1">
            <button
              onClick={() => execCommand('formatBlock', '<h1>')}
              className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm font-bold"
              title="Heading 1"
            >
              H1
            </button>
            <button
              onClick={() => execCommand('formatBlock', '<h2>')}
              className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm font-bold"
              title="Heading 2"
            >
              H2
            </button>
            <button
              onClick={() => execCommand('formatBlock', '<h3>')}
              className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm font-bold"
              title="Heading 3"
            >
              H3
            </button>
          </div>

          {/* Variables */}
          <div className="flex gap-1">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  insertVariable(e.target.value);
                  e.target.value = '';
                }
              }}
              className="px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
              title="Insert Variable"
            >
              <option value="">Insert Variable</option>
              {availableVariables.map(variable => (
                <option key={variable.name} value={variable.name}>
                  {variable.description}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowVariableModal(true)}
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              title="Add Custom Variable"
            >
              + Custom
            </button>
          </div>
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          onInput={(e) => setFormData(prev => ({ ...prev, content: e.currentTarget?.innerHTML }))}
          onFocus={() => setIsEditorFocused(true)}
          onBlur={() => setIsEditorFocused(false)}
          className={`min-h-96 p-4 border border-gray-300 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isEditorFocused ? 'bg-white' : 'bg-gray-50'
          }`}
          style={{ 
            fontFamily: 'Arial, sans-serif',
            lineHeight: '1.6',
            textAlign: 'justify'
          }}
        />
      </div>

      {/* Custom Variables */}
      {formData.variables && formData.variables.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Custom Variables</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {formData.variables.map(variable => (
              <div key={variable.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                <div>
                  <div className="font-medium text-gray-800">{variable.name}</div>
                  <div className="text-sm text-gray-600">{variable.description}</div>
                  <div className="text-xs text-gray-500">Type: {variable.type}</div>
                </div>
                {variable.isCustom && (
                  <button
                    onClick={() => removeCustomVariable(variable.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Remove variable"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Template Status */}
      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            className="mr-2"
          />
          <span className="text-sm font-medium text-gray-700">Active Template</span>
        </label>
      </div>

      {/* Custom Variable Modal */}
      {showVariableModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Custom Variable</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Variable Name *
                </label>
                <input
                  type="text"
                  value={newVariable.name}
                  onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., customField"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  value={newVariable.description}
                  onChange={(e) => setNewVariable(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Custom field description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={newVariable.type}
                  onChange={(e) => setNewVariable(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="date">Date</option>
                  <option value="number">Number</option>
                </select>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newVariable.required}
                    onChange={(e) => setNewVariable(prev => ({ ...prev, required: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Required Field</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={addCustomVariable}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Variable
              </button>
              <button
                onClick={() => setShowVariableModal(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentTemplateBuilder; 