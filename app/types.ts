export enum UserRole {
  FRONT_DESK = 'FrontDesk',
  OFFICER = 'Officer',
  SECTION_HEAD = 'SectionHead',
  DEPARTMENT_HEAD = 'DepartmentHead',
  ADMIN = 'Admin',
}

export interface User {
  id: string;
  nic: string; // This will now primarily be for the citizen data, but users might have one too.
  employeeId: string; // New field for login
  password?: string; // New field for login (mocked)
  name: string;
  role: UserRole;
  officeId?: string;
  officeName?: string;
  subjectIds?: string[]; // New: Assigned subjects
  // UI/compatibility fields
  email?: string;
  status?: 'active' | 'inactive';
  lastLogin?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export interface Office {
  id: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
}

export interface FieldDefinition {
  id: string;
  label: string;
  name: string; // for form data key
  type: 'text' | 'number' | 'date' | 'textarea' | 'checkbox' | 'radio' | 'select' | 'email' | 'phone' | 'file';
  placeholder?: string;
  required?: boolean;
  validationRules?: { required?: boolean; minLength?: number; maxLength?: number; pattern?: string; min?: number; max?: number };
  options?: { value: string; label: string }[]; // For select type
  defaultValue?: any;
  helpText?: string;
}

export interface WorkflowStepDefinition {
  id: string;
  name: string;
  description?: string;
  sectionId: string; // Section responsible for this step
  officeId: string; // Office responsible for this step
  formFields: FieldDefinition[];
  requiredDocuments: string[]; // List of document names
  approvalType: 'None' | 'SectionHead' | 'DepartmentHead';
  assignableToOfficeIds?: string[]; // Which offices this step can be assigned to
  estimatedDuration?: number; // in hours
  isParallel?: boolean; // Can this step run in parallel with others?
  conditions?: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
  }[];
  actions?: {
    type: 'send_email' | 'send_sms' | 'create_task' | 'update_field';
    config: Record<string, any>;
  }[];
  nextStepId?: string; // ID of the next step in the workflow
  previousStepId?: string; // ID of the previous step in the workflow
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  subjectId: string; // Service category/subject
  steps: WorkflowStepDefinition[]; // Ordered steps
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string; // Admin user ID
  version: string;
}

export interface UploadedDocument {
  id: string;
  name: string;
  url: string; // mock URL or identifier
  uploadedAt: string;
  uploadedBy: string; // User ID
}

// Specific type for data captured at intake by Front Desk
export interface ServiceRequestCreationData {
  nicNumber: string;
  citizenName: string;
  citizenAddress: string;
  citizenContact: string;
  subjectId: string; // Formerly serviceCategoryId
  preferredDateTime: string;
  initialDocumentsPresent: boolean;
  // Allow other dynamic fields if any are captured at intake via a more dynamic form builder (future)
  [key: string]: any;
}

export interface ServiceRequestData extends ServiceRequestCreationData {
  // Data accumulated through workflow steps beyond initial intake
  // This already has an index signature from ServiceRequestCreationData
  // Specific, known accumulated fields could be added here if necessary
}

export interface WorkflowHistoryEvent {
  stepId: string;
  stepName: string;
  userId: string;
  userName: string;
  timestamp: string;
  action: string; // e.g., "Submitted", "Approved", "Rejected", "CorrectionRequested"
  comment?: string;
  data?: Record<string, any>;
  documents?: UploadedDocument[];
}

export interface ServiceRequest {
  id: string;
  serviceRequestData: ServiceRequestData;
  status: 'New' | 'InProgress' | 'PendingReview' | 'PendingApproval' | 'CorrectionRequested' | 'Completed' | 'Rejected';
  currentStepId: string;
  assignedToOfficeId?: string;
  assignedToUserId?: string; // Officer who claimed the task within the office
  workflowDefinitionId: string;
  createdAt: string;
  updatedAt: string;
  history: WorkflowHistoryEvent[];
}

// Simplified Task for UI representation
export interface TaskSummary {
  id: string; // This could be the ServiceRequest ID or a specific task ID
  serviceRequestId: string;
  serviceRequestNic: string;
  subjectName: string; // Formerly serviceCategoryName
  currentStepName: string;
  assignedOfficeName?: string;
  status: ServiceRequest['status'];
  lastUpdate: string;
}

export interface CorrectionRequest {
  targetStepId: string;
  comment: string;
  requestedBy: string; // Department Head User ID
  requestedAt: string;
}

// New types for Workflow Studio functionality
export interface FormField {
  id: string;
  label: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'textarea' | 'checkbox' | 'radio' | 'select' | 'email' | 'phone' | 'file';
  placeholder?: string;
  required: boolean;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
  options?: { value: string; label: string }[];
  defaultValue?: any;
  helpText?: string;
}

export interface TemplateVariable {
  id: string;
  name: string;
  type: 'text' | 'email' | 'phone' | 'date' | 'number';
  description: string;
  required: boolean;
  isCustom?: boolean;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  content?: string; // Rich text content for the template
  variables?: TemplateVariable[]; // Template variables
  fileUrl?: string;
  fileType: 'pdf' | 'docx' | 'doc';
  version: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface CustomFieldDefinition {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'textarea' | 'checkbox' | 'radio' | 'select' | 'email' | 'phone' | 'file';
  category: string;
  description?: string;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
  options?: { value: string; label: string }[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface WorkflowStepForm {
  id: string;
  stepId: string;
  fields: FormField[];
  layout: 'single-column' | 'two-column' | 'three-column';
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStepDocuments {
  id: string;
  stepId: string;
  requiredDocuments: {
    id: string;
    name: string;
    description: string;
    isRequired: boolean;
    acceptedFormats: string[];
    maxFileSize: number; // in MB
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowOutputTemplate {
  id: string;
  workflowId: string;
  name: string;
  description: string;
  templateType: 'pdf' | 'docx' | 'html';
  templateContent: string;
  variables: string[]; // List of variables that can be used in the template
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface Section {
  id: string;
  name: string;
  description?: string;
  officeId: string; // Which office this section belongs to
  permissions: {
    canApprove: boolean;
    canFillData: boolean;
    canUploadDocuments: boolean;
    canAssign: boolean;
  };
  services: string[]; // List of service types this section handles
  users: string[]; // List of user IDs (officers, section heads)
}

export interface WorkflowNode {
  id: string;
  stepId: string;
  stepName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'correction_requested';
  assignedToOfficeId?: string;
  assignedToUserId?: string;
  completedAt?: string;
  data?: Record<string, any>;
  documents?: UploadedDocument[];
  comments?: string[];
  position: { x: number; y: number }; // For graph visualization
  connections: string[]; // IDs of connected nodes
}

export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: Array<{
    from: string;
    to: string;
    label?: string;
  }>;
}

export interface WorkflowExecution {
  id: string;
  serviceRequestId: string;
  workflowDefinitionId: string;
  currentStepId: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  nodes: WorkflowNode[];
  startedAt: string;
  completedAt?: string;
  totalDuration?: number; // in minutes
}