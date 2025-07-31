import { TemplateVM } from '../vms/template.vm';

export interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  variables: any[];
  fileType: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export function toTemplateVM(template: Template): TemplateVM {
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    content: template.content,
    variables: template.variables,
    fileType: template.fileType,
    version: template.version,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
    isActive: template.isActive,
  };
} 