import { Request, Response } from 'express';
import { serviceRequestService } from '../services/serviceRequest.service';
import { toServiceRequestVM } from '../mappers/serviceRequest.mapper';

export const serviceRequestController = {
  getAll: (req: Request, res: Response) => {
    const srs = serviceRequestService.getAll().map(toServiceRequestVM);
    res.json(srs);
  },
  getById: (req: Request, res: Response) => {
    const sr = serviceRequestService.getById(Number(req.params.id));
    if (!sr) return res.status(404).json({ message: 'Service request not found' });
    res.json(toServiceRequestVM(sr));
  },
  create: (req: Request, res: Response) => {
    const newSR = serviceRequestService.create(req.body);
    res.status(201).json(toServiceRequestVM(newSR));
  },
  update: (req: Request, res: Response) => {
    const updated = serviceRequestService.update(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ message: 'Service request not found' });
    res.json(toServiceRequestVM(updated));
  },
  delete: (req: Request, res: Response) => {
    const deleted = serviceRequestService.delete(Number(req.params.id));
    if (!deleted) return res.status(404).json({ message: 'Service request not found' });
    res.status(204).send();
  },
}; 