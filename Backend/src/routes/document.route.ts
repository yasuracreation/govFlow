import { Router } from 'express';
import { documentController } from '../controllers/document.controller';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', documentController.getAll);
router.get('/:id', documentController.getById);
router.post('/', authorizeRoles('OFFICER', 'SECTION_HEAD', 'ADMIN'), documentController.create);
router.put('/:id', authorizeRoles('OFFICER', 'SECTION_HEAD', 'ADMIN'), documentController.update);
router.delete('/:id', authorizeRoles('ADMIN'), documentController.delete);

export default router; 