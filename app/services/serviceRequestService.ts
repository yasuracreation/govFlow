import { ServiceRequest, ServiceRequestData, WorkflowHistoryEvent, UploadedDocument } from '../types';
import { API_BASE_URL } from '../apiConfig';

const SERVICE_REQUESTS_URL = `${API_BASE_URL}/service-requests`;

class ServiceRequestService {
  private serviceRequests: ServiceRequest[] = [];

  // Get all service requests with optional filtering
  async getServiceRequests(filters?: {
    status?: ServiceRequest['status'];
    serviceCategoryId?: string;
    assignedToOfficeId?: string;
    assignedToUserId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ServiceRequest[]> {
    const res = await fetch(SERVICE_REQUESTS_URL, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.ok) throw new Error('Failed to fetch service requests');
    this.serviceRequests = await res.json();

    let filteredRequests = [...this.serviceRequests];

    if (filters) {
      if (filters.status) {
        filteredRequests = filteredRequests.filter(req => req.status === filters.status);
      }
      if (filters.serviceCategoryId) {
        filteredRequests = filteredRequests.filter(req => req.serviceRequestData.serviceCategoryId === filters.serviceCategoryId);
      }
      if (filters.assignedToOfficeId) {
        filteredRequests = filteredRequests.filter(req => req.assignedToOfficeId === filters.assignedToOfficeId);
      }
      if (filters.assignedToUserId) {
        filteredRequests = filteredRequests.filter(req => req.assignedToUserId === filters.assignedToUserId);
      }
      if (filters.dateFrom) {
        filteredRequests = filteredRequests.filter(req => req.createdAt >= filters.dateFrom!);
      }
      if (filters.dateTo) {
        filteredRequests = filteredRequests.filter(req => req.createdAt <= filters.dateTo!);
      }
    }

    return filteredRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Get a single service request by ID
  async getServiceRequest(id: string): Promise<ServiceRequest | null> {
    const res = await fetch(`${SERVICE_REQUESTS_URL}/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.ok) throw new Error('Failed to fetch service request');
    return res.json();
  }

  // Create a new service request
  async createServiceRequest(requestData: Omit<ServiceRequest, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'history'>): Promise<ServiceRequest> {
    const res = await fetch(SERVICE_REQUESTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(requestData)
    });
    if (!res.ok) throw new Error('Failed to create service request');
    return res.json();
  }

  // Update a service request
  async updateServiceRequest(id: string, updates: Partial<ServiceRequest>): Promise<ServiceRequest | null> {
    const res = await fetch(`${SERVICE_REQUESTS_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update service request');
    return res.json();
  }

  // Update service request status
  async updateStatus(id: string, status: ServiceRequest['status'], comment?: string): Promise<ServiceRequest | null> {
    const request = await this.getServiceRequest(id);
    if (!request) return null;

    const historyEvent: WorkflowHistoryEvent = {
      stepId: request.currentStepId,
      stepName: `Step ${request.currentStepId}`,
      userId: 'SYSTEM',
      userName: 'System',
      timestamp: new Date().toISOString(),
      action: status === 'Completed' ? 'Completed' : status === 'Rejected' ? 'Rejected' : 'Updated',
      comment
    };

    return this.updateServiceRequest(id, { 
      status, 
      history: [...request.history, historyEvent]
    });
  }

  // Assign service request to a user
  async assignRequest(id: string, assignedToUserId: string, assignedToOfficeId?: string): Promise<ServiceRequest | null> {
    return this.updateServiceRequest(id, { assignedToUserId, assignedToOfficeId });
  }

  // Add document to service request
  async addDocument(id: string, document: {
    name: string;
    url: string;
    uploadedBy: string;
  }): Promise<ServiceRequest | null> {
    const request = await this.getServiceRequest(id);
    if (!request) return null;

    const newDocument: UploadedDocument = {
      id: `DOC${String(Math.random()).slice(2, 8)}`,
      ...document,
      uploadedAt: new Date().toISOString()
    };

    // Add document to history
    const historyEvent: WorkflowHistoryEvent = {
      stepId: request.currentStepId,
      stepName: `Step ${request.currentStepId}`,
      userId: document.uploadedBy,
      userName: 'User',
      timestamp: new Date().toISOString(),
      action: 'DocumentUploaded',
      comment: `Document uploaded: ${document.name}`,
      documents: [newDocument]
    };

    return this.updateServiceRequest(id, {
      history: [...request.history, historyEvent]
    });
  }

  // Update workflow step
  async updateWorkflowStep(id: string, stepId: string): Promise<ServiceRequest | null> {
    return this.updateServiceRequest(id, { currentStepId: stepId });
  }

  // Get service request statistics
  async getStatistics(): Promise<{
    total: number;
    new: number;
    inProgress: number;
    pendingReview: number;
    pendingApproval: number;
    completed: number;
    rejected: number;
    byCategory: Record<string, number>;
  }> {
    const res = await fetch(SERVICE_REQUESTS_URL, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.ok) throw new Error('Failed to fetch service requests');
    this.serviceRequests = await res.json();

    const stats = {
      total: this.serviceRequests.length,
      new: this.serviceRequests.filter(req => req.status === 'New').length,
      inProgress: this.serviceRequests.filter(req => req.status === 'InProgress').length,
      pendingReview: this.serviceRequests.filter(req => req.status === 'PendingReview').length,
      pendingApproval: this.serviceRequests.filter(req => req.status === 'PendingApproval').length,
      completed: this.serviceRequests.filter(req => req.status === 'Completed').length,
      rejected: this.serviceRequests.filter(req => req.status === 'Rejected').length,
      byCategory: {} as Record<string, number>
    };

    // Count by category
    this.serviceRequests.forEach(req => {
      const category = req.serviceRequestData.serviceCategoryId;
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
    });

    return stats;
  }

  // Search service requests
  async searchServiceRequests(query: string): Promise<ServiceRequest[]> {
    const res = await fetch(SERVICE_REQUESTS_URL, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.ok) throw new Error('Failed to fetch service requests');
    this.serviceRequests = await res.json();

    const searchTerm = query.toLowerCase();
    return this.serviceRequests.filter(req =>
      req.serviceRequestData.citizenName.toLowerCase().includes(searchTerm) ||
      req.serviceRequestData.nicNumber.toLowerCase().includes(searchTerm) ||
      req.id.toLowerCase().includes(searchTerm) ||
      req.history.some(event => event.comment?.toLowerCase().includes(searchTerm))
    );
  }

  // Get service requests by user
  async getServiceRequestsByUser(userId: string): Promise<ServiceRequest[]> {
    return this.getServiceRequests({ assignedToUserId: userId });
  }

  // Get service requests by office
  async getServiceRequestsByOffice(officeId: string): Promise<ServiceRequest[]> {
    return this.getServiceRequests({ assignedToOfficeId: officeId });
  }

  // Delete service request (soft delete)
  async deleteServiceRequest(id: string): Promise<boolean> {
    const res = await fetch(`${SERVICE_REQUESTS_URL}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.ok) throw new Error('Failed to delete service request');
    return true;
  }
}

export default new ServiceRequestService(); 