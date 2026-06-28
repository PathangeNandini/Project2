import { Router } from 'express';
import {
  getAllStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
} from '../controllers/storeController';
import { protect, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.get('/', getAllStores);
router.get('/:id', getStoreById);
router.post('/', authorizeRoles('admin'), createStore);
router.put('/:id', authorizeRoles('admin', 'manager'), updateStore);
router.delete('/:id', authorizeRoles('admin'), deleteStore);

export default router;