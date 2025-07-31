import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication and specific roles
router.use(authMiddleware(['OFFICER', 'SECTION_HEAD', 'ADMIN', 'DEPARTMENT_HEAD']));

router.get('/', taskController.getAll);
router.get('/:id', taskController.getById);
router.post('/', taskController.create);
router.put('/:id', taskController.update);
router.delete('/:id', authMiddleware(['ADMIN']), taskController.delete);

export default router; 