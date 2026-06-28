import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/userController';
import { protect, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.get('/', authorizeRoles('admin', 'manager'), getAllUsers);
router.get('/:id', authorizeRoles('admin', 'manager'), getUserById);
router.put('/:id', authorizeRoles('admin'), updateUser);
router.delete('/:id', authorizeRoles('admin'), deleteUser);

export default router;