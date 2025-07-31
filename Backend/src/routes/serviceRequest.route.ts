import { Router } from 'express';
import { serviceRequestController } from '../controllers/serviceRequest.controller';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', serviceRequestController.getAll);
router.get('/:id', serviceRequestController.getById);
router.post('/', authorizeRoles('FRONT_DESK', 'OFFICER', 'ADMIN'), serviceRequestController.create);
router.put('/:id', authorizeRoles('ADMIN'), serviceRequestController.update);
router.delete('/:id', authorizeRoles('ADMIN'), serviceRequestController.delete);

export default router; 