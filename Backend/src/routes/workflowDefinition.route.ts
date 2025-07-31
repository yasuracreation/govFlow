import { Router } from 'express';
import { workflowDefinitionController } from '../controllers/workflowDefinition.controller';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', workflowDefinitionController.getAll);
router.get('/:id', workflowDefinitionController.getById);
router.post('/', authorizeRoles('ADMIN'), workflowDefinitionController.create);
router.put('/:id', authorizeRoles('ADMIN'), workflowDefinitionController.update);
router.delete('/:id', authorizeRoles('ADMIN'), workflowDefinitionController.delete);

export default router; 