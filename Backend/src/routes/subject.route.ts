import { Router } from 'express';
import { subjectController } from '../controllers/subject.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Public GET
router.get('/', subjectController.getAll);
router.get('/:id', subjectController.getById);

// Admin-only
router.post('/', authMiddleware(['ADMIN']), subjectController.create);
router.put('/:id', authMiddleware(['ADMIN']), subjectController.update);
router.delete('/:id', authMiddleware(['ADMIN']), subjectController.delete);

export default router; 