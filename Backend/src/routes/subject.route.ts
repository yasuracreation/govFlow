import { Router } from 'express';
import { subjectController } from '../controllers/subject.controller';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', subjectController.getAll);
router.get('/:id', subjectController.getById);
router.post('/', authorizeRoles('ADMIN'), subjectController.create);
router.put('/:id', authorizeRoles('ADMIN'), subjectController.update);
router.delete('/:id', authorizeRoles('ADMIN'), subjectController.delete);

export default router; 