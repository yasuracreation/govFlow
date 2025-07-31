import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';

const router = Router();

router.get('/', notificationController.getAll);
router.get('/:id', notificationController.getById);
router.post('/', notificationController.create);
router.put('/:id', notificationController.update);
router.delete('/:id', notificationController.delete);

export default router; 