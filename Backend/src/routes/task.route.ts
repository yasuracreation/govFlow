import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', taskController.getAll);
router.get('/:id', taskController.getById);
router.post('/', authorizeRoles('OFFICER', 'SECTION_HEAD', 'ADMIN'), taskController.create);
router.put('/:id', authorizeRoles('OFFICER', 'SECTION_HEAD', 'ADMIN'), taskController.update);
router.delete('/:id', authorizeRoles('ADMIN'), taskController.delete);

export default router; 