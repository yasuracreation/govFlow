import { 
  CustomFieldDefinition, 
  DocumentTemplate, 
  WorkflowDefinition,
  WorkflowOutputTemplate,
  WorkflowStepDefinition,
  ServiceRequest
} from '../types';
import { API_BASE_URL } from '../apiConfig';

export const getCustomFields = async (): Promise<CustomFieldDefinition[]> => {
  const res = await fetch(`${API_BASE_URL}/custom-fields`);
  if (!res.ok) throw new Error('Failed to fetch custom fields');
  return res.json();
};

export const getDocumentTemplates = async (): Promise<DocumentTemplate[]> => {
  const res = await fetch(`${API_BASE_URL}/document-templates`);
  if (!res.ok) throw new Error('Failed to fetch document templates');
  return res.json();
};

export const getWorkflowOutputTemplates = async (workflowId?: string): Promise<WorkflowOutputTemplate[]> => {
  let url = `${API_BASE_URL}/workflow-output-templates`;
  if (workflowId) url += `?workflowId=${encodeURIComponent(workflowId)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch workflow output templates');
  return res.json();
};

// Custom Field Management
export const createCustomField = async (field: CustomFieldDefinition): Promise<CustomFieldDefinition> => {
  const res = await fetch(`${API_BASE_URL}/custom-fields`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(field)
  });
  if (!res.ok) throw new Error('Failed to create custom field');
  return res.json();
};

export const updateCustomField = async (field: CustomFieldDefinition): Promise<CustomFieldDefinition> => {
  const res = await fetch(`${API_BASE_URL}/custom-fields/${field.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(field)
  });
  if (!res.ok) throw new Error('Failed to update custom field');
  return res.json();
};

export const deleteCustomField = async (fieldId: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/custom-fields/${fieldId}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete custom field');
};

// Document Template Management
export const createDocumentTemplate = async (template: DocumentTemplate): Promise<DocumentTemplate> => {
  const res = await fetch(`${API_BASE_URL}/document-templates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(template)
  });
  if (!res.ok) throw new Error('Failed to create document template');
  return res.json();
};

export const updateDocumentTemplate = async (template: DocumentTemplate): Promise<DocumentTemplate> => {
  const res = await fetch(`${API_BASE_URL}/document-templates/${template.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(template)
  });
  if (!res.ok) throw new Error('Failed to update document template');
  return res.json();
};

export const deleteDocumentTemplate = async (templateId: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/document-templates/${templateId}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete document template');
};

// Workflow Output Template Management
export const createWorkflowOutputTemplate = async (template: WorkflowOutputTemplate): Promise<WorkflowOutputTemplate> => {
  const res = await fetch(`${API_BASE_URL}/workflow-output-templates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(template)
  });
  if (!res.ok) throw new Error('Failed to create workflow output template');
  return res.json();
};

export const updateWorkflowOutputTemplate = async (template: WorkflowOutputTemplate): Promise<WorkflowOutputTemplate> => {
  const res = await fetch(`${API_BASE_URL}/workflow-output-templates/${template.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(template)
  });
  if (!res.ok) throw new Error('Failed to update workflow output template');
  return res.json();
};

export const deleteWorkflowOutputTemplate = async (templateId: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/workflow-output-templates/${templateId}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete workflow output template');
};

// Workflow Management
export const saveWorkflow = async (workflow: WorkflowDefinition): Promise<WorkflowDefinition> => {
  const res = await fetch(`${API_BASE_URL}/workflows`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(workflow)
  });
  if (!res.ok) throw new Error('Failed to save workflow');
  return res.json();
};

export const validateWorkflow = async (workflow: WorkflowDefinition): Promise<{ isValid: boolean; errors: string[] }> => {
  const res = await fetch(`${API_BASE_URL}/workflows/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(workflow)
  });
  if (!res.ok) throw new Error('Failed to validate workflow');
  return res.json();
};

// Utility functions
export const getFieldCategories = async (): Promise<string[]> => {
  const res = await fetch(`${API_BASE_URL}/custom-fields/categories`);
  if (!res.ok) throw new Error('Failed to fetch field categories');
  return res.json();
};

export const getFieldTypes = async (): Promise<string[]> => {
  const res = await fetch(`${API_BASE_URL}/custom-fields/types`);
  if (!res.ok) throw new Error('Failed to fetch field types');
  return res.json();
};

export const searchCustomFields = async (query: string): Promise<CustomFieldDefinition[]> => {
  const res = await fetch(`${API_BASE_URL}/custom-fields/search?query=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to search custom fields');
  return res.json();
};

export const searchDocumentTemplates = async (query: string): Promise<DocumentTemplate[]> => {
  const res = await fetch(`${API_BASE_URL}/document-templates/search?query=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to search document templates');
  return res.json();
};

export interface WorkflowStudioService {
  // Workflow Management
  getWorkflows(): Promise<WorkflowDefinition[]>;
  getWorkflowById(id: string): Promise<WorkflowDefinition | null>;
  createWorkflow(workflow: Omit<WorkflowDefinition, 'id'>): Promise<WorkflowDefinition>;
  updateWorkflow(id: string, workflow: Partial<WorkflowDefinition>): Promise<WorkflowDefinition>;
  deleteWorkflow(id: string): Promise<void>;
  
  // Step Management
  addStepToWorkflow(workflowId: string, step: Omit<WorkflowStepDefinition, 'id'>): Promise<WorkflowStepDefinition>;
  updateWorkflowStep(workflowId: string, stepId: string, updates: Partial<WorkflowStepDefinition>): Promise<WorkflowStepDefinition>;
  deleteWorkflowStep(workflowId: string, stepId: string): Promise<void>;
  reorderWorkflowSteps(workflowId: string, stepIds: string[]): Promise<void>;
  
  // Workflow Execution
  startWorkflow(workflowId: string, serviceRequestData: any): Promise<ServiceRequest>;
  getWorkflowExecutionStatus(serviceRequestId: string): Promise<any>;
  advanceWorkflowStep(serviceRequestId: string, stepData: any): Promise<void>;
  
  // Validation
  validateWorkflow(workflow: WorkflowDefinition): Promise<{ isValid: boolean; errors: string[] }>;
  
  // Templates
  getWorkflowTemplates(): Promise<WorkflowDefinition[]>;
  saveAsTemplate(workflow: WorkflowDefinition, templateName: string): Promise<WorkflowDefinition>;
}

class WorkflowStudioServiceImpl implements WorkflowStudioService {
  async getWorkflows(): Promise<WorkflowDefinition[]> {
    const res = await fetch(`${API_BASE_URL}/workflows`);
    if (!res.ok) throw new Error('Failed to fetch workflows');
    return res.json();
  }

  async getWorkflowById(id: string): Promise<WorkflowDefinition | null> {
    const res = await fetch(`${API_BASE_URL}/workflows/${id}`);
    if (!res.ok) throw new Error('Failed to fetch workflow');
    return res.json();
  }

  async createWorkflow(workflow: Omit<WorkflowDefinition, 'id'>): Promise<WorkflowDefinition> {
    const res = await fetch(`${API_BASE_URL}/workflows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(workflow)
    });
    if (!res.ok) throw new Error('Failed to create workflow');
    return res.json();
  }

  async updateWorkflow(id: string, updates: Partial<WorkflowDefinition>): Promise<WorkflowDefinition> {
    const res = await fetch(`${API_BASE_URL}/workflows/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update workflow');
    return res.json();
  }

  async deleteWorkflow(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/workflows/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete workflow');
  }

  async addStepToWorkflow(workflowId: string, step: Omit<WorkflowStepDefinition, 'id'>): Promise<WorkflowStepDefinition> {
    const res = await fetch(`${API_BASE_URL}/workflows/${workflowId}/steps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(step)
    });
    if (!res.ok) throw new Error('Failed to add step to workflow');
    return res.json();
  }

  async updateWorkflowStep(workflowId: string, stepId: string, updates: Partial<WorkflowStepDefinition>): Promise<WorkflowStepDefinition> {
    const res = await fetch(`${API_BASE_URL}/workflows/${workflowId}/steps/${stepId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update workflow step');
    return res.json();
  }

  async deleteWorkflowStep(workflowId: string, stepId: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/workflows/${workflowId}/steps/${stepId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete workflow step');
  }

  async reorderWorkflowSteps(workflowId: string, stepIds: string[]): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/workflows/${workflowId}/steps/reorder`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ stepIds })
    });
    if (!res.ok) throw new Error('Failed to reorder workflow steps');
  }

  async startWorkflow(workflowId: string, serviceRequestData: any): Promise<ServiceRequest> {
    const res = await fetch(`${API_BASE_URL}/workflows/${workflowId}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(serviceRequestData)
    });
    if (!res.ok) throw new Error('Failed to start workflow');
    return res.json();
  }

  async getWorkflowExecutionStatus(serviceRequestId: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/service-requests/${serviceRequestId}/status`);
    if (!res.ok) throw new Error('Failed to fetch workflow execution status');
    return res.json();
  }

  async advanceWorkflowStep(serviceRequestId: string, stepData: any): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/service-requests/${serviceRequestId}/advance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(stepData)
    });
    if (!res.ok) throw new Error('Failed to advance workflow step');
  }

  async validateWorkflow(workflow: WorkflowDefinition): Promise<{ isValid: boolean; errors: string[] }> {
    const res = await fetch(`${API_BASE_URL}/workflows/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(workflow)
    });
    if (!res.ok) throw new Error('Failed to validate workflow');
    return res.json();
  }

  async getWorkflowTemplates(): Promise<WorkflowDefinition[]> {
    const res = await fetch(`${API_BASE_URL}/workflows/templates`);
    if (!res.ok) throw new Error('Failed to fetch workflow templates');
    return res.json();
  }

  async saveAsTemplate(workflow: WorkflowDefinition, templateName: string): Promise<WorkflowDefinition> {
    const res = await fetch(`${API_BASE_URL}/workflows/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ workflow, templateName })
    });
    if (!res.ok) throw new Error('Failed to save workflow as template');
    return res.json();
  }
}

// Export singleton instance
export const workflowStudioService = new WorkflowStudioServiceImpl();

// Export default for convenience
export default workflowStudioService; 