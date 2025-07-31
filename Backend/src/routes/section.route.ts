import { Router } from 'express';
import { sectionController } from '../controllers/section.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Public GET (or use authMiddleware for all roles if needed)
router.get('/', sectionController.getAll);
router.get('/:id', sectionController.getById);

// Admin-only
router.post('/', authMiddleware(['ADMIN']), sectionController.create);
router.put('/:id', authMiddleware(['ADMIN']), sectionController.update);
router.delete('/:id', authMiddleware(['ADMIN']), sectionController.delete);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: List of users
 */

export default router; 