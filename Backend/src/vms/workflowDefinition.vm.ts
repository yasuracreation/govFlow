export interface WorkflowStepDefinitionVM {
  id: string;
  name: string;
  description?: string;
  sectionId: string;
  officeId: string;
  formFields: any[];
  requiredDocuments: string[];
  approvalType: string;
  estimatedDuration?: number;
}

export interface WorkflowDefinitionVM {
  id: number;
  name: string;
  description: string;
  subjectId:string
  steps: WorkflowStepDefinitionVM[];
} 