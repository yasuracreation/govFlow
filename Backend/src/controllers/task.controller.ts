import { Request, Response } from 'express';
import { taskService } from '../services/task.service';
import { toTaskVM } from '../mappers/task.mapper';

export const taskController = {
  getAll: (req: Request, res: Response) => {
    const userId = req.query.userId as string | undefined;
    if (userId) {
      const tasks = taskService.getByUserId(Number(userId)).map(toTaskVM);
      return res.json(tasks);
    }
    const tasks = taskService.getAll().map(toTaskVM);
    res.json(tasks);
  },
  getById: (req: Request, res: Response) => {
    const task = taskService.getById(Number(req.params.id));
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(toTaskVM(task));
  },
  create: (req: Request, res: Response) => {
    const newTask = taskService.create(req.body);
    res.status(201).json(toTaskVM(newTask));
  },
  update: (req: Request, res: Response) => {
    const updated = taskService.update(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ message: 'Task not found' });
    res.json(toTaskVM(updated));
  },
  delete: (req: Request, res: Response) => {
    const deleted = taskService.delete(Number(req.params.id));
    if (!deleted) return res.status(404).json({ message: 'Task not found' });
    res.status(204).send();
  },
}; 