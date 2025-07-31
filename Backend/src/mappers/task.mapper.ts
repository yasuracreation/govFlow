import { TaskVM } from '../vms/task.vm';

export function toTaskVM(task: any): TaskVM {
  return {
    id: task.id,
    serviceRequestId: task.serviceRequestId,
    assignedTo: task.assignedTo,
    status: task.status,
    updatedAt: task.updatedAt,
  };
} 