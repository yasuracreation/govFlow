import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.put('/:id/role', authMiddleware(['ADMIN']), userController.updateRole);
router.put('/:id', authMiddleware(['ADMIN']), userController.update);

export default router; 