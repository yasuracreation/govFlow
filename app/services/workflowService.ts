import { 
  ServiceRequest, 
  ServiceRequestData, 
  WorkflowDefinition, 
  WorkflowStepDefinition, 
  TaskSummary, 
  Office,
  User,
  UploadedDocument,
  WorkflowHistoryEvent,
  CorrectionRequest,
  ServiceRequestCreationData, // Added for createServiceRequest
  UserRole // Added import for UserRole
} from '../types.ts';
import { MOCK_WORKFLOW_DEFINITIONS, MOCK_OFFICES, MOCK_SERVICE_CATEGORIES } from '../constants.ts';
import { getMockUserById } from './authService.ts';
import { API_BASE_URL } from '../apiConfig';

let mockServiceRequests: ServiceRequest[] = [];
let nextServiceRequestId = 1;

const findWorkflow = (workflowDefinitionId: string): WorkflowDefinition | undefined => MOCK_WORKFLOW_DEFINITIONS.find(wf => wf.id === workflowDefinitionId);
const findWorkflowByServiceCategory = (serviceCategoryId: string): WorkflowDefinition | undefined =>
  MOCK_WORKFLOW_DEFINITIONS.find(wf => wf.subjectId === serviceCategoryId);
const findStep = (workflow: WorkflowDefinition, stepId: string): WorkflowStepDefinition | undefined => workflow.steps.find(s => s.id === stepId);

const WORKFLOWS_URL = `${API_BASE_URL}/workflows`;

export async function getWorkflows(): Promise<WorkflowDefinition[]> {
  const res = await fetch(WORKFLOWS_URL, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  if (!res.ok) throw new Error('Failed to fetch workflows');
  return res.json();
}

export async function getWorkflowById(id: string): Promise<WorkflowDefinition> {
  const res = await fetch(`${WORKFLOWS_URL}/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  if (!res.ok) throw new Error('Failed to fetch workflow');
  return res.json();
}

export async function createWorkflow(workflow: Omit<WorkflowDefinition, 'id'>): Promise<WorkflowDefinition> {
  const res = await fetch(WORKFLOWS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(workflow)
  });
  if (!res.ok) throw new Error('Failed to create workflow');
  return res.json();
}

export async function updateWorkflow(id: string, workflow: Partial<WorkflowDefinition>): Promise<WorkflowDefinition> {
  const res = await fetch(`${WORKFLOWS_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(workflow)
  });
  if (!res.ok) throw new Error('Failed to update workflow');
  return res.json();
}

export async function deleteWorkflow(id: string): Promise<void> {
  const res = await fetch(`${WORKFLOWS_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  if (!res.ok) throw new Error('Failed to delete workflow');
}

export const createServiceRequest = async (data: ServiceRequestCreationData, initialAssignToOfficeId: string, currentUser: User): Promise<ServiceRequest> => {
  return new Promise((resolve, reject) => { // Added reject for clarity
    setTimeout(async () => {
      const workflow = findWorkflowByServiceCategory(data.serviceCategoryId);
      if (!workflow || workflow.steps.length === 0) {
        // Use reject for unrecoverable errors
        reject(new Error("Workflow not found for this service category or workflow has no steps."));
        return;
      }
      const firstStep = workflow.steps[0];
      
      const assignedOfficeObject = MOCK_OFFICES.find(o => o.id === initialAssignToOfficeId);
      const officeNameForComment = assignedOfficeObject?.name || 'Unknown Office';

      const newRequest: ServiceRequest = {
        id: `SR${String(nextServiceRequestId++).padStart(5, '0')}`,
        serviceRequestData: data as ServiceRequestData, // data is compatible with ServiceRequestData
        status: 'New',
        currentStepId: firstStep.id,
        assignedToOfficeId: initialAssignToOfficeId, // Initially assigned to the office chosen by Front Desk
        workflowDefinitionId: workflow.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [{
          stepId: 'INTAKE',
          stepName: 'Intake',
          userId: currentUser.id,
          userName: currentUser.name,
          timestamp: new Date().toISOString(),
          action: 'Service Request Created & Assigned',
          comment: `Assigned to ${officeNameForComment}`,
          data: data, // Log the initial creation data
        }],
      };
      mockServiceRequests.push(newRequest);
      resolve(newRequest);
    }, 500);
  });
};

export const getServiceRequestById = async (id: string): Promise<ServiceRequest | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockServiceRequests.find(sr => sr.id === id));
    }, 200);
  });
};

export const getTasksForOffice = async (officeId: string): Promise<TaskSummary[]> => {
  const res = await fetch(`${API_BASE_URL}/tasks/office/${officeId}`);
  if (!res.ok) throw new Error('Failed to fetch tasks for office');
  return res.json();
};

export const getTasksForUser = async (userId: string): Promise<TaskSummary[]> => {
  const res = await fetch(`${API_BASE_URL}/tasks/user/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch tasks for user');
  return res.json();
};

export const claimTask = async (serviceRequestId: string, userId: string): Promise<ServiceRequest> => {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const srIndex = mockServiceRequests.findIndex(sr => sr.id === serviceRequestId);
      if (srIndex === -1) {
        reject(new Error('Service Request not found'));
        return;
      }
      
      const serviceRequest = mockServiceRequests[srIndex];
      if (serviceRequest.assignedToUserId && serviceRequest.assignedToUserId !== userId) {
        reject(new Error('Task already claimed by another user.'));
        return;
      }
      // A task can be claimed if it's 'New' or 'CorrectionRequested'.
      if (serviceRequest.status !== 'New' && serviceRequest.status !== 'CorrectionRequested') {
         reject(new Error('Task cannot be claimed in its current state. Only "New" or "CorrectionRequested" tasks are claimable.'));
         return;
      }

      serviceRequest.assignedToUserId = userId;
      serviceRequest.status = 'InProgress';
      serviceRequest.updatedAt = new Date().toISOString();
      const currentUser = await getMockUserById(userId);
      serviceRequest.history.push({
        stepId: serviceRequest.currentStepId,
        stepName: findWorkflow(serviceRequest.workflowDefinitionId)?.steps.find(s=>s.id === serviceRequest.currentStepId)?.name || 'Unknown Step',
        userId: userId,
        userName: currentUser?.name || 'Unknown User',
        timestamp: serviceRequest.updatedAt,
        action: 'Task Claimed',
      });
      mockServiceRequests[srIndex] = serviceRequest;
      resolve(serviceRequest);
    }, 200);
  });
};

export const submitTaskData = async (
  serviceRequestId: string, 
  userId: string, 
  formData: Record<string, any>, 
  uploadedDocuments: UploadedDocument[]
): Promise<ServiceRequest> => {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const srIndex = mockServiceRequests.findIndex(sr => sr.id === serviceRequestId);
      if (srIndex === -1) {
         reject(new Error('Service Request not found'));
         return;
      }
      
      const serviceRequest = mockServiceRequests[srIndex];
      if (serviceRequest.assignedToUserId !== userId || serviceRequest.status !== 'InProgress') {
        reject(new Error('Task not assigned to user or not in progress.'));
        return;
      }

      // Merge new form data with existing
      serviceRequest.serviceRequestData = { ...serviceRequest.serviceRequestData, ...formData };
      
      // Determine next status based on who needs to approve current step
      const workflow = findWorkflow(serviceRequest.workflowDefinitionId);
      const currentStepDef = workflow?.steps.find(s => s.id === serviceRequest.currentStepId);

      if (currentStepDef?.approvalType === 'DepartmentHead') {
        serviceRequest.status = 'PendingApproval'; // For Department Head
      } else {
        serviceRequest.status = 'PendingReview'; // For Section Head by default
      }
      
      serviceRequest.updatedAt = new Date().toISOString();
      const currentUser = await getMockUserById(userId);
      serviceRequest.history.push({
        stepId: serviceRequest.currentStepId,
        stepName: currentStepDef?.name || 'Unknown Step',
        userId: userId,
        userName: currentUser?.name || 'Unknown User',
        timestamp: serviceRequest.updatedAt,
        action: 'Data Submitted for Review/Approval',
        data: formData,
        documents: uploadedDocuments
      });
      mockServiceRequests[srIndex] = serviceRequest;
      resolve(serviceRequest);
    }, 400);
  });
};

export const approveStep = async (
  serviceRequestId: string, 
  userId: string, // Section Head or Dept Head
  comment?: string,
  nextAssignToOfficeId?: string // Only if SectionHead is forwarding, or if Dept Head step implicitly defines next
): Promise<ServiceRequest> => {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const srIndex = mockServiceRequests.findIndex(sr => sr.id === serviceRequestId);
      if (srIndex === -1) { reject(new Error('Service Request not found')); return; }
      
      let serviceRequest = mockServiceRequests[srIndex];
      const workflow = findWorkflow(serviceRequest.workflowDefinitionId);
      if (!workflow) { reject(new Error('Workflow definition not found.')); return; }
      
      const currentStepIndex = workflow.steps.findIndex(s => s.id === serviceRequest.currentStepId);
      if (currentStepIndex === -1) { reject(new Error('Current step not found in workflow.')); return; }
      
      const currentStepDef = workflow.steps[currentStepIndex];
      const currentUser = await getMockUserById(userId);
      if (!currentUser) { reject(new Error('Approver user not found.')); return; }

      // Authorization check
      if (currentStepDef.approvalType === 'SectionHead') {
        if (currentUser.role !== UserRole.SECTION_HEAD || currentUser.officeId !== serviceRequest.assignedToOfficeId) {
           reject(new Error('User not authorized as Section Head for this office to approve this step.')); return;
        }
        if (serviceRequest.status !== 'PendingReview') {
           reject(new Error('Service request not in "PendingReview" state for Section Head approval.')); return;
        }
      } else if (currentStepDef.approvalType === 'DepartmentHead') {
         if (currentUser.role !== UserRole.DEPARTMENT_HEAD) {
            reject(new Error('User not authorized as Department Head for final approval.')); return;
         }
         // Department Head approves steps that are 'PendingApproval' OR 'PendingReview' if it's their direct step.
         if (serviceRequest.status !== 'PendingApproval' && serviceRequest.status !== 'PendingReview') {
            reject(new Error('Service request not in "PendingApproval" or "PendingReview" state for Department Head approval.')); return;
         }
      } else { // 'None' approval type, should not reach here through this function ideally
         reject(new Error('This step does not require approval through this function.')); return;
      }
      
      serviceRequest.updatedAt = new Date().toISOString();
      serviceRequest.history.push({
        stepId: currentStepDef.id,
        stepName: currentStepDef.name,
        userId: userId,
        userName: currentUser.name,
        timestamp: serviceRequest.updatedAt,
        action: 'Step Approved',
        comment: comment,
      });

      if (currentStepIndex + 1 < workflow.steps.length) {
        const nextStep = workflow.steps[currentStepIndex + 1];
        serviceRequest.currentStepId = nextStep.id;
        serviceRequest.status = 'New'; // Ready for claim in the next office/step
        // Determine assignment for the next step
        let assignedOffice = nextAssignToOfficeId || nextStep.assignableToOfficeIds?.[0];
        if(!assignedOffice && nextStep.assignableToOfficeIds && nextStep.assignableToOfficeIds.length > 0){
             assignedOffice = nextStep.assignableToOfficeIds[0];
        } else if (!assignedOffice) {
            // Fallback: If no specific office assignableToOfficeIds, it might stay in the same office or a default one for that step type
            // This logic might need more complex rules based on workflow design. For now, try current office if no specific assignable.
            // Or it implies an error in workflow definition if no office is specified for an assignable step.
            console.warn(`No assignable office ID found for next step ${nextStep.name}. Check workflow definition. Defaulting to current office or undefined.`);
            // assignedOffice = serviceRequest.assignedToOfficeId; // This could be problematic if next step is different type of office
        }

        serviceRequest.assignedToOfficeId = assignedOffice;
        serviceRequest.assignedToUserId = undefined; // Unassign specific user for next step
        
        serviceRequest.history.push({
            stepId: nextStep.id,
            stepName: nextStep.name,
            userId: userId, // Person who approved and forwarded
            userName: currentUser.name,
            timestamp: serviceRequest.updatedAt,
            action: 'Forwarded to Next Step',
            comment: `Assigned to ${MOCK_OFFICES.find(o => o.id === serviceRequest.assignedToOfficeId)?.name || 'Office for next step'}`,
        });

      } else { // This was the last step
        serviceRequest.status = 'Completed';
        serviceRequest.assignedToOfficeId = undefined;
        serviceRequest.assignedToUserId = undefined;
      }
      
      mockServiceRequests[srIndex] = serviceRequest;
      resolve(serviceRequest);
    }, 400);
  });
};

export const rejectStep = async (
  serviceRequestId: string, 
  userId: string, // Section Head or Dept Head
  reason: string
): Promise<ServiceRequest> => {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const srIndex = mockServiceRequests.findIndex(sr => sr.id === serviceRequestId);
      if (srIndex === -1) { reject(new Error('Service Request not found')); return; }
      
      let serviceRequest = mockServiceRequests[srIndex];
      const currentUser = await getMockUserById(userId);
      if (!currentUser) { reject(new Error('User not found.')); return; }
      
      const workflow = findWorkflow(serviceRequest.workflowDefinitionId);
      const currentStepDef = workflow?.steps.find(s => s.id === serviceRequest.currentStepId);

      // Authorization check for rejection
      if (currentStepDef?.approvalType === 'SectionHead') {
        if (currentUser.role !== UserRole.SECTION_HEAD || currentUser.officeId !== serviceRequest.assignedToOfficeId) {
           reject(new Error('User not authorized to reject this step.')); return;
        }
      } else if (currentStepDef?.approvalType === 'DepartmentHead') {
         if (currentUser.role !== UserRole.DEPARTMENT_HEAD) {
            reject(new Error('User not authorized to reject this step.')); return;
         }
      } // 'None' approval steps might be rejected differently or not at all by this function.

      if (serviceRequest.status !== 'PendingReview' && serviceRequest.status !== 'PendingApproval') {
          reject(new Error('Service request not in a state to be rejected by an approver.')); return;
      }


      serviceRequest.status = 'Rejected';
      serviceRequest.updatedAt = new Date().toISOString();
      serviceRequest.history.push({
        stepId: serviceRequest.currentStepId,
        stepName: currentStepDef?.name || 'Unknown Step',
        userId: userId,
        userName: currentUser.name,
        timestamp: serviceRequest.updatedAt,
        action: 'Step/Application Rejected',
        comment: reason,
      });
      mockServiceRequests[srIndex] = serviceRequest;
      resolve(serviceRequest);
    }, 300);
  });
};


export const requestCorrection = async (
  serviceRequestId: string,
  departmentHeadUserId: string,
  targetStepId: string,
  comment: string
): Promise<ServiceRequest> => {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const srIndex = mockServiceRequests.findIndex(sr => sr.id === serviceRequestId);
      if (srIndex === -1) { reject(new Error('Service Request not found')); return; }

      let serviceRequest = mockServiceRequests[srIndex];
      const workflow = findWorkflow(serviceRequest.workflowDefinitionId);
      if (!workflow) { reject(new Error('Workflow definition not found.')); return; }

      const targetStep = workflow.steps.find(s => s.id === targetStepId);
      if (!targetStep) { reject(new Error('Target step for correction not found.')); return; }
      
      const departmentHeadUser = await getMockUserById(departmentHeadUserId);
      if (!departmentHeadUser || departmentHeadUser.role !== UserRole.DEPARTMENT_HEAD) {
        reject(new Error('Only Department Heads can request corrections.')); return;
      }
      
      // Determine the office for the targetStep.
      // This should be one of the offices listed in targetStep.assignableToOfficeIds.
      // We need a clear rule, e.g., first assignable office, or look in history for who handled it last.
      // For simplicity, take the first assignable office.
      const targetOfficeId = targetStep.assignableToOfficeIds?.[0];
      if (!targetOfficeId) {
          reject(new Error(`Target step "${targetStep.name}" has no assignable offices defined for correction.`)); return;
      }

      serviceRequest.status = 'CorrectionRequested';
      serviceRequest.currentStepId = targetStepId; // Revert to the step needing correction
      serviceRequest.assignedToOfficeId = targetOfficeId;
      serviceRequest.assignedToUserId = undefined; // Officer needs to claim it again in that section
      serviceRequest.updatedAt = new Date().toISOString();
      
      serviceRequest.history.push({
        stepId: targetStepId, // The step that needs correction
        stepName: targetStep.name,
        userId: departmentHeadUserId,
        userName: departmentHeadUser.name,
        timestamp: serviceRequest.updatedAt,
        action: 'Correction Requested',
        comment: `Correction requested by Department Head: ${comment}. Task sent back to ${targetStep.name} at ${MOCK_OFFICES.find(o=>o.id === targetOfficeId)?.name}.`,
      });

      mockServiceRequests[srIndex] = serviceRequest;
      resolve(serviceRequest);
    }, 400);
  });
};

export const getAllServiceRequests = async (): Promise<ServiceRequest[]> => {
  const res = await fetch(`${API_BASE_URL}/service-requests`);
  if (!res.ok) throw new Error('Failed to fetch service requests');
  return res.json();
};

export const getWorkflowDefinitions = async (): Promise<WorkflowDefinition[]> => {
  return new Promise(resolve => setTimeout(() => resolve(MOCK_WORKFLOW_DEFINITIONS), 100));
};

export const getOffices = async (): Promise<Office[]> => {
  return new Promise(resolve => setTimeout(() => resolve(MOCK_OFFICES), 100));
};

export const getServiceCategories = async (): Promise<any[]> => {
  const res = await fetch(`${API_BASE_URL}/service-categories`);
  if (!res.ok) throw new Error('Failed to fetch service categories');
  return res.json();
};
