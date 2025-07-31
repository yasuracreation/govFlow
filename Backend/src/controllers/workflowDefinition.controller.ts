import { Request, Response } from 'express';
import { workflowDefinitionService } from '../services/workflowDefinition.service';
import { toWorkflowDefinitionVM } from '../mappers/workflowDefinition.mapper';

export const workflowDefinitionController = {
  getAll: (req: Request, res: Response) => {
    const wds = workflowDefinitionService.getAll().map(toWorkflowDefinitionVM);
    res.json(wds);
  },
  getById: (req: Request, res: Response) => {
    const wd = workflowDefinitionService.getById(Number(req.params.id));
    if (!wd) return res.status(404).json({ message: 'Workflow definition not found' });
    res.json(toWorkflowDefinitionVM(wd));
  },
  create: (req: Request, res: Response) => {
    const newWD = workflowDefinitionService.create(req.body);
    res.status(201).json(toWorkflowDefinitionVM(newWD));
  },
  update: (req: Request, res: Response) => {
    const updated = workflowDefinitionService.update(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ message: 'Workflow definition not found' });
    res.json(toWorkflowDefinitionVM(updated));
  },
  delete: (req: Request, res: Response) => {
    const deleted = workflowDefinitionService.delete(Number(req.params.id));
    if (!deleted) return res.status(404).json({ message: 'Workflow definition not found' });
    res.status(204).send();
  },
}; 