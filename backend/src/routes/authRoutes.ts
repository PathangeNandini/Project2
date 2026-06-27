import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import { protect, authorizeRoles } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.post('/register',
  validateRequest(['name', 'email', 'password']),
  register
);

router.post('/login',
  validateRequest(['email', 'password']),
  login
);

router.get('/me', protect, getMe);

export default router;