import React, { useState, useEffect } from 'react';
import Card from './Card';
import Button from './Button';
import Select from './Select';
import CustomAlert from './CustomAlert';
import { Download, Eye, FileText, Printer, Plus, X } from 'lucide-react';
import { DocumentTemplate, ServiceRequest, User, WorkflowDefinition } from '@/types';
import documentGenerationService, { GeneratedDocument, DocumentData } from '@/services/documentGenerationService';

interface DocumentGeneratorProps {
  serviceRequest: ServiceRequest;
  workflowDefinition: WorkflowDefinition;
  currentUser: User;
  approvalData?: {
    approvedBy: string;
    approvalDate: string;
    comments: string;
    conditions: string;
  };
  onDocumentGenerated?: (document: GeneratedDocument) => void;
}

const DocumentGenerator: React.FC<DocumentGeneratorProps> = ({
  serviceRequest,
  workflowDefinition,
  currentUser,
  approvalData,
  onDocumentGenerated
}) => {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [generatedDocuments, setGeneratedDocuments] = useState<GeneratedDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<GeneratedDocument | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string; show: boolean } | null>(null);

  useEffect(() => {
    loadTemplates();
    loadGeneratedDocuments();
  }, [serviceRequest.id]);

  const loadTemplates = () => {
    const availableTemplates = documentGenerationService.getTemplates();
    setTemplates(availableTemplates);
  };

  const loadGeneratedDocuments = () => {
    const documents = documentGenerationService.getDocumentsForRequest(serviceRequest.id);
    setGeneratedDocuments(documents);
  };

  const handleGenerateDocument = async () => {
    if (!selectedTemplate) {
      setAlert({ type: 'error', message: 'Please select a template', show: true });
      return;
    }

    setLoading(true);
    try {
      const documentData = documentGenerationService.prepareDocumentData(
        serviceRequest,
        workflowDefinition,
        currentUser,
        approvalData
      );

      const generatedDocument = documentGenerationService.generateDocument(
        selectedTemplate,
        documentData,
        currentUser.name
      );

      if (generatedDocument) {
        // Save the generated document
        documentGenerationService.saveGeneratedDocument(generatedDocument);
        
        // Update local state
        setGeneratedDocuments(prev => [...prev, generatedDocument]);
        setSelectedTemplate('');
        
        // Notify parent component
        onDocumentGenerated?.(generatedDocument);
        
        setAlert({ type: 'success', message: 'Document generated successfully!', show: true });
      } else {
        setAlert({ type: 'error', message: 'Failed to generate document', show: true });
      }
    } catch (error) {
      console.error('Error generating document:', error);
      setAlert({ type: 'error', message: 'Error generating document', show: true });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocument = async (document: GeneratedDocument) => {
    setLoading(true);
    try {
      const success = await documentGenerationService.downloadDocument(document);
      if (success) {
        setAlert({ type: 'success', message: 'Document downloaded successfully!', show: true });
      } else {
        setAlert({ type: 'error', message: 'Failed to download document', show: true });
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      setAlert({ type: 'error', message: 'Error downloading document', show: true });
    } finally {
      setLoading(false);
    }
  };

  const handlePrintDocument = async (document: GeneratedDocument) => {
    setLoading(true);
    try {
      const success = await documentGenerationService.printDocument(document);
      if (success) {
        setAlert({ type: 'success', message: 'Document sent to printer!', show: true });
      } else {
        setAlert({ type: 'error', message: 'Failed to print document', show: true });
      }
    } catch (error) {
      console.error('Error printing document:', error);
      setAlert({ type: 'error', message: 'Error printing document', show: true });
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewDocument = (document: GeneratedDocument) => {
    setPreviewDocument(document);
    setShowPreview(true);
  };

  const handleDeleteDocument = (documentId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      const success = documentGenerationService.deleteGeneratedDocument(documentId);
      if (success) {
        setGeneratedDocuments(prev => prev.filter(doc => doc.id !== documentId));
        setAlert({ type: 'success', message: 'Document deleted successfully!', show: true });
      } else {
        setAlert({ type: 'error', message: 'Failed to delete document', show: true });
      }
    }
  };

  const getTemplateOptions = () => {
    return templates.map(template => ({
      value: template.id,
      label: `${template.name} (${template.category})`
    }));
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

      {/* Document Generation Section */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Generate Document</h3>
          <FileText className="h-5 w-5 text-blue-600" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Select
              label="Select Template"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              options={[
                { value: '', label: 'Choose a template...' },
                ...getTemplateOptions()
              ]}
              required
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleGenerateDocument}
              disabled={!selectedTemplate || loading}
              className="w-full"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Generate Document
            </Button>
          </div>
        </div>

        {selectedTemplate && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Template Preview:</strong> {templates.find(t => t.id === selectedTemplate)?.description}
            </p>
          </div>
        )}
      </Card>

      {/* Generated Documents Section */}
      {generatedDocuments.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Generated Documents</h3>
            <span className="text-sm text-gray-500">{generatedDocuments.length} document(s)</span>
          </div>

          <div className="space-y-3">
            {generatedDocuments.map((document) => (
              <div key={document.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <h4 className="font-medium text-gray-900">{document.templateName}</h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(templates.find(t => t.id === document.templateId)?.category || 'general')}`}>
                        {templates.find(t => t.id === document.templateId)?.category || 'general'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Generated on: {new Date(document.generatedAt).toLocaleString()} by {document.generatedBy}
                    </p>
                    <p className="text-sm text-gray-500">
                      File: {document.fileName}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handlePreviewDocument(document)}
                      variant="secondary"
                      size="sm"
                      title="Preview Document"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDownloadDocument(document)}
                      variant="secondary"
                      size="sm"
                      title="Download PDF"
                      disabled={loading}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handlePrintDocument(document)}
                      variant="secondary"
                      size="sm"
                      title="Print Document"
                      disabled={loading}
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteDocument(document.id)}
                      variant="secondary"
                      size="sm"
                      title="Delete Document"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Preview Modal */}
      {showPreview && previewDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Document Preview</h3>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleDownloadDocument(previewDocument)}
                  variant="secondary"
                  disabled={loading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={() => handlePrintDocument(previewDocument)}
                  variant="secondary"
                  disabled={loading}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button onClick={() => setShowPreview(false)} variant="secondary">
                  Close
                </Button>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <div className="bg-white p-6 rounded shadow-sm">
                <div className="text-center mb-6 border-b pb-4">
                  <h1 className="text-2xl font-bold">{previewDocument.templateName}</h1>
                  <p className="text-gray-600">Generated on: {new Date(previewDocument.generatedAt).toLocaleDateString()}</p>
                </div>
                
                <div className="prose max-w-none">
                  {previewDocument.content.split('\n').map((line, index) => (
                    <p key={index} className="mb-2">{line}</p>
                  ))}
                </div>
                
                <div className="text-center mt-8 pt-4 border-t text-sm text-gray-500">
                  <p>This document was generated by GovFlow System</p>
                  <p>Document ID: {previewDocument.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentGenerator; 