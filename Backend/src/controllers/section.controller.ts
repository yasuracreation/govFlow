import { Request, Response } from 'express';
import { sectionService } from '../services/section.service';
import { toSectionVM } from '../mappers/section.mapper';

export const sectionController = {
  getAll: (req: Request, res: Response) => {
    const sections = sectionService.getAll().map(toSectionVM);
    res.json(sections);
  },
  getById: (req: Request, res: Response) => {
    const section = sectionService.getById(Number(req.params.id));
    if (!section) return res.status(404).json({ message: 'Section not found' });
    res.json(toSectionVM(section));
  },
  create: (req: Request, res: Response) => {
    const newSection = sectionService.create(req.body);
    res.status(201).json(toSectionVM(newSection));
  },
  update: (req: Request, res: Response) => {
    const updated = sectionService.update(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ message: 'Section not found' });
    res.json(toSectionVM(updated));
  },
  delete: (req: Request, res: Response) => {
    const deleted = sectionService.delete(Number(req.params.id));
    if (!deleted) return res.status(404).json({ message: 'Section not found' });
    res.status(204).send();
  },
}; 