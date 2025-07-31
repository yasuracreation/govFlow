import { DocumentTemplate, ServiceRequest, User, WorkflowDefinition } from '@/types';
import { API_BASE_URL } from '../apiConfig';

const DOCUMENTS_URL = `${API_BASE_URL}/documents`;

export interface DocumentData {
  customer: {
    name: string;
    nic: string;
    address: string;
    contact: string;
    email: string;
  };
  request: {
    id: string;
    subject: string;
    createdDate: string;
    status: string;
    description: string;
  };
  approval: {
    approvedBy: string;
    approvalDate: string;
    comments: string;
    conditions: string;
  };
  system: {
    currentDate: string;
    office: string;
    department: string;
    officer: string;
  };
}

export interface GeneratedDocument {
  id: string;
  templateId: string;
  templateName: string;
  content: string;
  data: DocumentData;
  generatedAt: string;
  generatedBy: string;
  fileName: string;
}

class DocumentGenerationService {
  private templates: DocumentTemplate[] = [];

  constructor() {
    this.loadTemplates();
  }

  private loadTemplates(): void {
    try {
      const storedTemplates = localStorage.getItem('govflow_document_templates');
      if (storedTemplates) {
        this.templates = JSON.parse(storedTemplates);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  }

  private refreshTemplates(): void {
    this.loadTemplates();
  }

  /**
   * Get all available templates
   */
  getTemplates(): DocumentTemplate[] {
    this.refreshTemplates();
    return this.templates;
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: string): DocumentTemplate[] {
    return this.getTemplates().filter(template => template.category === category && template.isActive);
  }

  /**
   * Get a specific template by ID
   */
  getTemplateById(templateId: string): DocumentTemplate | null {
    return this.getTemplates().find(template => template.id === templateId) || null;
  }

  /**
   * Prepare document data from service request
   */
  prepareDocumentData(
    serviceRequest: ServiceRequest,
    workflowDefinition: WorkflowDefinition,
    currentUser: User,
    approvalData?: {
      approvedBy: string;
      approvalDate: string;
      comments: string;
      conditions: string;
    }
  ): DocumentData {
    return {
      customer: {
        name: serviceRequest.customerName || 'N/A',
        nic: serviceRequest.customerNIC || 'N/A',
        address: serviceRequest.customerAddress || 'N/A',
        contact: serviceRequest.customerContact || 'N/A',
        email: serviceRequest.customerEmail || 'N/A'
      },
      request: {
        id: serviceRequest.id,
        subject: serviceRequest.subject || 'N/A',
        createdDate: new Date(serviceRequest.createdAt).toLocaleDateString(),
        status: serviceRequest.status,
        description: serviceRequest.description || 'N/A'
      },
      approval: {
        approvedBy: approvalData?.approvedBy || currentUser.name,
        approvalDate: approvalData?.approvalDate || new Date().toLocaleDateString(),
        comments: approvalData?.comments || 'No comments provided',
        conditions: approvalData?.conditions || 'No special conditions'
      },
      system: {
        currentDate: new Date().toLocaleDateString(),
        office: currentUser.office || 'N/A',
        department: currentUser.department || 'N/A',
        officer: currentUser.name
      }
    };
  }

  /**
   * Replace variables in template content with actual data
   */
  replaceVariables(content: string, data: DocumentData): string {
    let processedContent = content;
    
    // Replace customer variables
    Object.entries(data.customer).forEach(([key, value]) => {
      processedContent = processedContent.replace(new RegExp(`{{customer.${key}}}`, 'g'), String(value));
    });
    
    // Replace request variables
    Object.entries(data.request).forEach(([key, value]) => {
      processedContent = processedContent.replace(new RegExp(`{{request.${key}}}`, 'g'), String(value));
    });
    
    // Replace approval variables
    Object.entries(data.approval).forEach(([key, value]) => {
      processedContent = processedContent.replace(new RegExp(`{{approval.${key}}}`, 'g'), String(value));
    });
    
    // Replace system variables
    Object.entries(data.system).forEach(([key, value]) => {
      processedContent = processedContent.replace(new RegExp(`{{system.${key}}}`, 'g'), String(value));
    });
    
    return processedContent;
  }

  /**
   * Generate a document from a template
   */
  generateDocument(
    templateId: string,
    data: DocumentData,
    generatedBy: string
  ): GeneratedDocument | null {
    const template = this.getTemplateById(templateId);
    if (!template) {
      console.error('Template not found:', templateId);
      return null;
    }

    const processedContent = this.replaceVariables(template.content, data);
    
    const generatedDocument: GeneratedDocument = {
      id: `doc-${Date.now()}`,
      templateId: template.id,
      templateName: template.name,
      content: processedContent,
      data,
      generatedAt: new Date().toISOString(),
      generatedBy,
      fileName: `${template.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
    };

    return generatedDocument;
  }

  /**
   * Generate PDF from document content
   */
  async generatePDF(document: GeneratedDocument): Promise<Blob | null> {
    try {
      // Create HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${document.templateName}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 40px; 
                line-height: 1.6; 
                color: #333;
              }
              .header { 
                text-align: center; 
                margin-bottom: 30px; 
                border-bottom: 2px solid #333; 
                padding-bottom: 20px; 
              }
              .content { 
                margin: 20px 0; 
                white-space: pre-wrap;
              }
              .footer { 
                margin-top: 50px; 
                text-align: center; 
                font-size: 12px; 
                color: #666; 
                border-top: 1px solid #ccc;
                padding-top: 20px;
              }
              .document-info {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
                margin-bottom: 20px;
                font-size: 12px;
              }
              .document-info table {
                width: 100%;
                border-collapse: collapse;
              }
              .document-info td {
                padding: 5px;
                border-bottom: 1px solid #eee;
              }
              .document-info td:first-child {
                font-weight: bold;
                width: 30%;
              }
              @media print { 
                body { margin: 20px; } 
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${document.templateName}</h1>
              <p>Generated on: ${new Date(document.generatedAt).toLocaleDateString()}</p>
            </div>
            
            <div class="document-info">
              <table>
                <tr>
                  <td>Document ID:</td>
                  <td>${document.id}</td>
                </tr>
                <tr>
                  <td>Request ID:</td>
                  <td>${document.data.request.id}</td>
                </tr>
                <tr>
                  <td>Customer:</td>
                  <td>${document.data.customer.name}</td>
                </tr>
                <tr>
                  <td>Generated By:</td>
                  <td>${document.generatedBy}</td>
                </tr>
              </table>
            </div>
            
            <div class="content">
              ${document.content.replace(/\n/g, '<br>')}
            </div>
            
            <div class="footer">
              <p>This document was generated by GovFlow System</p>
              <p>Document ID: ${document.id} | Generated: ${new Date(document.generatedAt).toLocaleString()}</p>
            </div>
          </body>
        </html>
      `;

      // For now, we'll create a simple HTML file that can be printed
      // In a production environment, you would use a proper PDF library like jsPDF or html2pdf
      const blob = new Blob([htmlContent], { type: 'text/html' });
      return blob;
    } catch (error) {
      console.error('Error generating PDF:', error);
      return null;
    }
  }

  /**
   * Download document as PDF
   */
  async downloadDocument(document: GeneratedDocument): Promise<boolean> {
    try {
      const blob = await this.generatePDF(document);
      if (!blob) {
        throw new Error('Failed to generate PDF');
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = document.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error downloading document:', error);
      return false;
    }
  }

  /**
   * Print document
   */
  async printDocument(document: GeneratedDocument): Promise<boolean> {
    try {
      const blob = await this.generatePDF(document);
      if (!blob) {
        throw new Error('Failed to generate PDF');
      }

      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');
      
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
          setTimeout(() => {
            printWindow.close();
            URL.revokeObjectURL(url);
          }, 1000);
        };
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error printing document:', error);
      return false;
    }
  }

  /**
   * Save generated document to storage
   */
  saveGeneratedDocument(document: GeneratedDocument): void {
    try {
      const storedDocuments = localStorage.getItem('govflow_generated_documents');
      const documents = storedDocuments ? JSON.parse(storedDocuments) : [];
      documents.push(document);
      localStorage.setItem('govflow_generated_documents', JSON.stringify(documents));
    } catch (error) {
      console.error('Error saving generated document:', error);
    }
  }

  /**
   * Get all generated documents
   */
  getGeneratedDocuments(): GeneratedDocument[] {
    try {
      const storedDocuments = localStorage.getItem('govflow_generated_documents');
      return storedDocuments ? JSON.parse(storedDocuments) : [];
    } catch (error) {
      console.error('Error loading generated documents:', error);
      return [];
    }
  }

  /**
   * Get generated documents for a specific request
   */
  getDocumentsForRequest(requestId: string): GeneratedDocument[] {
    return this.getGeneratedDocuments().filter(doc => doc.data.request.id === requestId);
  }

  /**
   * Delete a generated document
   */
  deleteGeneratedDocument(documentId: string): boolean {
    try {
      const documents = this.getGeneratedDocuments();
      const filteredDocuments = documents.filter(doc => doc.id !== documentId);
      localStorage.setItem('govflow_generated_documents', JSON.stringify(filteredDocuments));
      return true;
    } catch (error) {
      console.error('Error deleting generated document:', error);
      return false;
    }
  }

  /**
   * Get document statistics
   */
  getDocumentStats(): {
    totalTemplates: number;
    activeTemplates: number;
    totalGenerated: number;
    recentGenerated: number;
  } {
    const templates = this.getTemplates();
    const generatedDocuments = this.getGeneratedDocuments();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return {
      totalTemplates: templates.length,
      activeTemplates: templates.filter(t => t.isActive).length,
      totalGenerated: generatedDocuments.length,
      recentGenerated: generatedDocuments.filter(doc => 
        new Date(doc.generatedAt) > oneWeekAgo
      ).length
    };
  }
}

// Export singleton instance
export const documentGenerationService = new DocumentGenerationService();
export default documentGenerationService;

export async function getDocuments() {
  const res = await fetch(DOCUMENTS_URL, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export async function getDocumentById(id: string) {
  const res = await fetch(`${DOCUMENTS_URL}/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  if (!res.ok) throw new Error('Failed to fetch document');
  return res.json();
}

export async function createDocument(document: any) {
  const res = await fetch(DOCUMENTS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(document)
  });
  if (!res.ok) throw new Error('Failed to create document');
  return res.json();
}

export async function updateDocument(id: string, document: any) {
  const res = await fetch(`${DOCUMENTS_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(document)
  });
  if (!res.ok) throw new Error('Failed to update document');
  return res.json();
}

export async function deleteDocument(id: string) {
  const res = await fetch(`${DOCUMENTS_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  if (!res.ok) throw new Error('Failed to delete document');
} 