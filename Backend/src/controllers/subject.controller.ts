import { Request, Response } from 'express';
import { subjectService } from '../services/subject.service';
import { toSubjectVM } from '../mappers/subject.mapper';
import { UserService } from '../services/user.service';

const userService = new UserService();

export const subjectController = {
  getAll: (req: Request, res: Response) => {
    const userId = req.query.userId as string | undefined;
    if (userId) {
      const user = userService.getById(userId);
      if (user && user.subjectIds) {
        const allSubjects = subjectService.getAll();
        const userSubjects = allSubjects.filter(subject =>
          Array.isArray(user.subjectIds) && user.subjectIds.includes(subject.id.toString())
        );
        return res.json(userSubjects.map(toSubjectVM));
      }
      return res.json([]); // Return empty array if user or subjects not found
    }

    const subjects = subjectService.getAll().map(toSubjectVM);
    res.json(subjects);
  },
  getById: (req: Request, res: Response) => {
    const subject = subjectService.getById(Number(req.params.id));
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json(toSubjectVM(subject));
  },
  create: (req: Request, res: Response) => {
    const newSubject = subjectService.create(req.body);
    res.status(201).json(toSubjectVM(newSubject));
  },
  update: (req: Request, res: Response) => {
    const updated = subjectService.update(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ message: 'Subject not found' });
    res.json(toSubjectVM(updated));
  },
  delete: (req: Request, res: Response) => {
    const deleted = subjectService.delete(Number(req.params.id));
    if (!deleted) return res.status(404).json({ message: 'Subject not found' });
    res.status(204).send();
  },
}; 