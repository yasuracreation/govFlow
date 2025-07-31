import { ServiceRequestVM } from '../vms/serviceRequest.vm';

export function toServiceRequestVM(sr: any): ServiceRequestVM {
  return {
    id: sr.id,
    subjectId: sr.subjectId,
    userId: sr.userId,
    status: sr.status,
    createdAt: sr.createdAt,
  };
} 