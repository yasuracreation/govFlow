import { WorkflowDefinitionVM } from '../vms/workflowDefinition.vm';

export function toWorkflowDefinitionVM(wd: any): WorkflowDefinitionVM {
  return {
    id: wd.id,
    name: wd.name,
    subjectId: wd.subjectId,
    description: wd.description,
    steps: wd.steps,
  };
} 