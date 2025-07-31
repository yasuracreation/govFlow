import { SubjectVM } from '../vms/subject.vm';

export function toSubjectVM(subject: any): SubjectVM {
  return {
    id: subject.id,
    name: subject.name,
    sectionId: subject.sectionId,
    description: subject.description,
  };
} 