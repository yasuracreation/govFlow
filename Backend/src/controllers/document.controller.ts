import { Request, Response } from 'express';
import { documentService } from '../services/document.service';
import { toDocumentVM } from '../mappers/document.mapper';

export const documentController = {
  getAll: (req: Request, res: Response) => {
    const docs = documentService.getAll().map(toDocumentVM);
    res.json(docs);
  },
  getById: (req: Request, res: Response) => {
    const doc = documentService.getById(Number(req.params.id));
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.json(toDocumentVM(doc));
  },
  create: (req: Request, res: Response) => {
    const newDoc = documentService.create(req.body);
    res.status(201).json(toDocumentVM(newDoc));
  },
  update: (req: Request, res: Response) => {
    const updated = documentService.update(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ message: 'Document not found' });
    res.json(toDocumentVM(updated));
  },
  delete: (req: Request, res: Response) => {
    const deleted = documentService.delete(Number(req.params.id));
    if (!deleted) return res.status(404).json({ message: 'Document not found' });
    res.status(204).send();
  },
}; 