import { SectionVM } from '../vms/section.vm';

export function toSectionVM(section: any): SectionVM {
  return {
    id: section.id,
    name: section.name,
    officeId: section.officeId,
    description: section.description,
  };
} 