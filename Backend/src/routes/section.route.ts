import { Router } from 'express';
import { sectionController } from '../controllers/section.controller';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', sectionController.getAll);
router.get('/:id', sectionController.getById);
router.post('/', authorizeRoles('ADMIN'), sectionController.create);
router.put('/:id', authorizeRoles('ADMIN'), sectionController.update);
router.delete('/:id', authorizeRoles('ADMIN'), sectionController.delete);

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