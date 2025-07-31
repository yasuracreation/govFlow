import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', AuthController.login);
router.get('/me', authMiddleware(['FRONT_DESK', 'OFFICER', 'SECTION_HEAD', 'DEPARTMENT_HEAD', 'ADMIN']), AuthController.me);
router.post('/register', authMiddleware(['ADMIN']), AuthController.register);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.post('/logout', AuthController.logout);

export default router; 