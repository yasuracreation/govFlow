import { Router } from 'express';
import { serviceRequestController } from '../controllers/serviceRequest.controller';
// import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// router.use(authMiddleware);

router.get('/', serviceRequestController.getAll);
router.get('/:id', serviceRequestController.getById);
router.post('/', serviceRequestController.create);
router.put('/:id', serviceRequestController.update);
router.delete('/:id', serviceRequestController.delete);

export default router; 