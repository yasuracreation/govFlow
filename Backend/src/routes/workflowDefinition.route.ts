import { Router } from 'express';
import { workflowDefinitionController } from '../controllers/workflowDefinition.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Public GET
router.get('/', workflowDefinitionController.getAll);
router.get('/:id', workflowDefinitionController.getById);

// Admin-only
router.post('/', authMiddleware(['ADMIN']), workflowDefinitionController.create);
router.put('/:id', authMiddleware(['ADMIN']), workflowDefinitionController.update);
router.delete('/:id', authMiddleware(['ADMIN']), workflowDefinitionController.delete);

export default router; 