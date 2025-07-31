import { WorkflowDefinition, WorkflowStepDefinition, ServiceRequest, WorkflowHistoryEvent, User } from '../types';

export interface WorkflowExecutionContext {
  serviceRequestId: string;
  workflowDefinition: WorkflowDefinition;
  currentStepIndex: number;
  stepData: Record<string, any>;
  documents: Record<string, any[]>;
  history: WorkflowHistoryEvent[];
  status: 'running' | 'completed' | 'failed' | 'paused';
  startTime: string;
  lastUpdateTime: string;
  assignedUsers: Record<string, string>;
  parallelSteps: string[];
}

export interface StepExecutionResult {
  success: boolean;
  nextStepIndex?: number;
  data?: Record<string, any>;
  documents?: Record<string, any[]>;
  comments?: string;
  error?: string;
  requiresApproval?: boolean;
  approvalType?: 'SectionHead' | 'DepartmentHead';
}

export interface WorkflowExecutionService {
  // Execution Management
  startWorkflow(workflowId: string, initialData: any, userId: string): Promise<WorkflowExecutionContext>;
  executeStep(context: WorkflowExecutionContext, stepData: any, userId: string): Promise<StepExecutionResult>;
  pauseWorkflow(context: WorkflowExecutionContext, reason: string): Promise<void>;
  resumeWorkflow(context: WorkflowExecutionContext, userId: string): Promise<void>;
  cancelWorkflow(context: WorkflowExecutionContext, reason: string, userId: string): Promise<void>;
  
  // State Management
  getExecutionContext(serviceRequestId: string): Promise<WorkflowExecutionContext | null>;
  updateExecutionContext(context: WorkflowExecutionContext): Promise<void>;
  getWorkflowHistory(serviceRequestId: string): Promise<WorkflowHistoryEvent[]>;
  
  // Step Management
  getCurrentStep(context: WorkflowExecutionContext): WorkflowStepDefinition | null;
  getNextStep(context: WorkflowExecutionContext): WorkflowStepDefinition | null;
  canExecuteStep(context: WorkflowExecutionContext, stepIndex: number, userId: string): boolean;
  validateStepData(step: WorkflowStepDefinition, data: any): { isValid: boolean; errors: string[] };
  
  // Approval Management
  requestApproval(context: WorkflowExecutionContext, approvalType: 'SectionHead' | 'DepartmentHead'): Promise<void>;
  approveStep(context: WorkflowExecutionContext, approved: boolean, comments: string, approverId: string): Promise<void>;
  
  // Parallel Execution
  startParallelSteps(context: WorkflowExecutionContext, stepIds: string[]): Promise<void>;
  checkParallelStepCompletion(context: WorkflowExecutionContext): boolean;
}

class WorkflowExecutionServiceImpl implements WorkflowExecutionService {
  private executionContexts: Map<string, WorkflowExecutionContext> = new Map();
  private mockWorkflows: WorkflowDefinition[] = [];

  constructor() {
    // Initialize with mock workflows
    this.initializeMockWorkflows();
  }

  private initializeMockWorkflows() {
    this.mockWorkflows = [
      {
        id: 'wf-1',
        name: 'Certificate Request Workflow',
        steps: [
          {
            id: 'step-1',
            name: 'Initial Review',
            description: 'Review submitted documents and information',
            formFields: [
              {
                id: 'field-1',
                label: 'Document Completeness',
                name: 'documentCompleteness',
                type: 'checkbox',
                required: true
              },
              {
                id: 'field-2',
                label: 'Review Notes',
                name: 'reviewNotes',
                type: 'textarea',
                required: false
              }
            ],
            requiredDocuments: ['Identity Document', 'Application Form'],
            approvalType: 'None',
            estimatedDuration: 24,
            isParallel: false,
            conditions: [],
            actions: [],
            sectionId: ''
          },
          {
            id: 'step-2',
            name: 'Section Head Approval',
            description: 'Section head reviews and approves the request',
            formFields: [
              {
                id: 'field-3',
                label: 'Approval Decision',
                name: 'approvalDecision',
                type: 'select',
                required: true,
                options: [
                  { value: 'approved', label: 'Approved' },
                  { value: 'rejected', label: 'Rejected' },
                  { value: 'correction_required', label: 'Correction Required' }
                ]
              },
              {
                id: 'field-4',
                label: 'Comments',
                name: 'comments',
                type: 'textarea',
                required: false
              }
            ],
            requiredDocuments: [],
            approvalType: 'SectionHead',
            estimatedDuration: 48,
            isParallel: false,
            conditions: [],
            actions: [],
            sectionId: ''
          }
        ],
        subjectId: '',
        serviceCategoryId: undefined
      }
    ];
  }

  async startWorkflow(workflowId: string, initialData: any, userId: string): Promise<WorkflowExecutionContext> {
    const workflow = this.mockWorkflows.find(w => w.id === workflowId);
    if (!workflow) {
      throw new Error(`Workflow with id ${workflowId} not found`);
    }

    const serviceRequestId = `sr-${Date.now()}`;
    const now = new Date().toISOString();

    const context: WorkflowExecutionContext = {
      serviceRequestId,
      workflowDefinition: workflow,
      currentStepIndex: 0,
      stepData: { ...initialData },
      documents: {},
      history: [{
        stepId: 'start',
        stepName: 'Workflow Started',
        userId,
        userName: `User ${userId}`,
        timestamp: now,
        action: 'Started',
        data: initialData
      }],
      status: 'running',
      startTime: now,
      lastUpdateTime: now,
      assignedUsers: {},
      parallelSteps: []
    };

    this.executionContexts.set(serviceRequestId, context);
    return context;
  }

  async executeStep(context: WorkflowExecutionContext, stepData: any, userId: string): Promise<StepExecutionResult> {
    const currentStep = this.getCurrentStep(context);
    if (!currentStep) {
      throw new Error('No current step found');
    }

    // Validate step data
    const validation = this.validateStepData(currentStep, stepData);
    if (!validation.isValid) {
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join(', ')}`
      };
    }

    // Update context with step data
    context.stepData = { ...context.stepData, ...stepData };
    context.lastUpdateTime = new Date().toISOString();

    // Add to history
    const historyEvent: WorkflowHistoryEvent = {
      stepId: currentStep.id,
      stepName: currentStep.name,
      userId,
      userName: `User ${userId}`,
      timestamp: context.lastUpdateTime,
      action: 'Completed',
      data: stepData
    };
    context.history.push(historyEvent);

    // Check if approval is required
    if (currentStep.approvalType !== 'None') {
      return {
        success: true,
        requiresApproval: true,
        approvalType: currentStep.approvalType,
        comments: 'Step completed, awaiting approval'
      };
    }

    // Determine next step
    const nextStepIndex = this.determineNextStep(context);
    
    if (nextStepIndex === -1) {
      // Workflow completed
      context.status = 'completed';
      context.history.push({
        stepId: 'end',
        stepName: 'Workflow Completed',
        userId,
        userName: `User ${userId}`,
        timestamp: context.lastUpdateTime,
        action: 'Completed',
        data: { finalData: context.stepData }
      });
    } else {
      context.currentStepIndex = nextStepIndex;
    }

    this.executionContexts.set(context.serviceRequestId, context);

    return {
      success: true,
      nextStepIndex: nextStepIndex === -1 ? undefined : nextStepIndex,
      data: stepData
    };
  }

  private determineNextStep(context: WorkflowExecutionContext): number {
    const currentIndex = context.currentStepIndex;
    const nextIndex = currentIndex + 1;
    
    if (nextIndex >= context.workflowDefinition.steps.length) {
      return -1; // Workflow completed
    }

    return nextIndex;
  }

  async pauseWorkflow(context: WorkflowExecutionContext, reason: string): Promise<void> {
    context.status = 'paused';
    context.lastUpdateTime = new Date().toISOString();
    context.history.push({
      stepId: 'system',
      stepName: 'Workflow Paused',
      userId: 'system',
      userName: 'System',
      timestamp: context.lastUpdateTime,
      action: 'Paused',
      comment: reason
    });
    
    this.executionContexts.set(context.serviceRequestId, context);
  }

  async resumeWorkflow(context: WorkflowExecutionContext, userId: string): Promise<void> {
    context.status = 'running';
    context.lastUpdateTime = new Date().toISOString();
    context.history.push({
      stepId: 'system',
      stepName: 'Workflow Resumed',
      userId,
      userName: `User ${userId}`,
      timestamp: context.lastUpdateTime,
      action: 'Resumed'
    });
    
    this.executionContexts.set(context.serviceRequestId, context);
  }

  async cancelWorkflow(context: WorkflowExecutionContext, reason: string, userId: string): Promise<void> {
    context.status = 'failed';
    context.lastUpdateTime = new Date().toISOString();
    context.history.push({
      stepId: 'system',
      stepName: 'Workflow Cancelled',
      userId,
      userName: `User ${userId}`,
      timestamp: context.lastUpdateTime,
      action: 'Cancelled',
      comment: reason
    });
    
    this.executionContexts.set(context.serviceRequestId, context);
  }

  async getExecutionContext(serviceRequestId: string): Promise<WorkflowExecutionContext | null> {
    return this.executionContexts.get(serviceRequestId) || null;
  }

  async updateExecutionContext(context: WorkflowExecutionContext): Promise<void> {
    this.executionContexts.set(context.serviceRequestId, context);
  }

  async getWorkflowHistory(serviceRequestId: string): Promise<WorkflowHistoryEvent[]> {
    const context = await this.getExecutionContext(serviceRequestId);
    return context?.history || [];
  }

  getCurrentStep(context: WorkflowExecutionContext): WorkflowStepDefinition | null {
    if (context.currentStepIndex >= context.workflowDefinition.steps.length) {
      return null;
    }
    return context.workflowDefinition.steps[context.currentStepIndex];
  }

  getNextStep(context: WorkflowExecutionContext): WorkflowStepDefinition | null {
    const nextIndex = context.currentStepIndex + 1;
    if (nextIndex >= context.workflowDefinition.steps.length) {
      return null;
    }
    return context.workflowDefinition.steps[nextIndex];
  }

  canExecuteStep(context: WorkflowExecutionContext, stepIndex: number, userId: string): boolean {
    if (stepIndex !== context.currentStepIndex) {
      return false;
    }

    const step = context.workflowDefinition.steps[stepIndex];
    if (!step) {
      return false;
    }

    // Check if user has permission to execute this step
    // This is a simplified check - in a real system, you'd check user roles and permissions
    return true;
  }

  validateStepData(step: WorkflowStepDefinition, data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    step.formFields.forEach(field => {
      const value = data[field.name];
      
      if (field.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field.label} is required`);
      }

      if (value !== undefined && value !== null && value !== '') {
        switch (field.type) {
          case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              errors.push(`${field.label} must be a valid email address`);
            }
            break;
          case 'number':
            if (isNaN(Number(value))) {
              errors.push(`${field.label} must be a number`);
            }
            break;
          case 'phone':
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(value.replace(/\s/g, ''))) {
              errors.push(`${field.label} must be a valid phone number`);
            }
            break;
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async requestApproval(context: WorkflowExecutionContext, approvalType: 'SectionHead' | 'DepartmentHead'): Promise<void> {
    context.lastUpdateTime = new Date().toISOString();
    context.history.push({
      stepId: 'system',
      stepName: 'Approval Requested',
      userId: 'system',
      userName: 'System',
      timestamp: context.lastUpdateTime,
      action: 'Approval Requested',
      comment: `${approvalType} approval requested`
    });
    
    this.executionContexts.set(context.serviceRequestId, context);
  }

  async approveStep(context: WorkflowExecutionContext, approved: boolean, comments: string, approverId: string): Promise<void> {
    context.lastUpdateTime = new Date().toISOString();
    context.history.push({
      stepId: 'system',
      stepName: 'Approval Decision',
      userId: approverId,
      userName: `Approver ${approverId}`,
      timestamp: context.lastUpdateTime,
      action: approved ? 'Approved' : 'Rejected',
      comment: comments
    });

    if (approved) {
      // Continue to next step
      const nextStepIndex = this.determineNextStep(context);
      if (nextStepIndex === -1) {
        context.status = 'completed';
      } else {
        context.currentStepIndex = nextStepIndex;
      }
    } else {
      context.status = 'failed';
    }
    
    this.executionContexts.set(context.serviceRequestId, context);
  }

  async startParallelSteps(context: WorkflowExecutionContext, stepIds: string[]): Promise<void> {
    context.parallelSteps = [...context.parallelSteps, ...stepIds];
    context.lastUpdateTime = new Date().toISOString();
    
    this.executionContexts.set(context.serviceRequestId, context);
  }

  checkParallelStepCompletion(context: WorkflowExecutionContext): boolean {
    // Simplified check - in a real system, you'd track individual parallel step status
    return context.parallelSteps.length === 0;
  }

  // Additional utility methods
  getWorkflowProgress(context: WorkflowExecutionContext): number {
    return (context.currentStepIndex / context.workflowDefinition.steps.length) * 100;
  }

  getEstimatedCompletionTime(context: WorkflowExecutionContext): string | null {
    const currentStep = this.getCurrentStep(context);
    if (!currentStep) return null;

    const remainingSteps = context.workflowDefinition.steps.slice(context.currentStepIndex);
    const totalRemainingHours = remainingSteps.reduce((sum, step) => sum + (step.estimatedDuration || 24), 0);
    
    const completionTime = new Date();
    completionTime.setHours(completionTime.getHours() + totalRemainingHours);
    
    return completionTime.toISOString();
  }

  getStepAssignees(context: WorkflowExecutionContext, stepId: string): string[] {
    return Object.entries(context.assignedUsers)
      .filter(([step, userId]) => step === stepId)
      .map(([, userId]) => userId);
  }
}

// Export singleton instance
export const workflowExecutionService = new WorkflowExecutionServiceImpl();

// Export default for convenience
export default workflowExecutionService; 