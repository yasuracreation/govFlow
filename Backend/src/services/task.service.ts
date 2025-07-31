import tasks from '../data/mockTasks.json';
import { TaskVM } from '../vms/task.vm';

let taskData: TaskVM[] = Array.isArray(tasks) ? [...tasks] : [];

export const taskService = {
  getAll: (): TaskVM[] => taskData,
  getById: (id: number): TaskVM | undefined => taskData.find(t => t.id === id),
  create: (task: any): TaskVM => {
    const newTask = { ...task, id: Date.now() };
    taskData.push(newTask);
    return newTask;
  },
  update: (id: number, updates: any): TaskVM | null => {
    const idx = taskData.findIndex(t => t.id === id);
    if (idx === -1) return null;
    taskData[idx] = { ...taskData[idx], ...updates };
    return taskData[idx];
  },
  delete: (id: number): boolean => {
    const idx = taskData.findIndex(t => t.id === id);
    if (idx === -1) return false;
    taskData.splice(idx, 1);
    return true;
  },
  getByUserId: (userId: number): TaskVM[] => {
    return taskData.filter(task => task.assignedTo === userId);
  }
};
