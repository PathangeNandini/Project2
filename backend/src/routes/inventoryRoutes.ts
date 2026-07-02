import { Router } from 'express';
import {
  getAllInventory,
  getLowStockItems,
  getInventoryByProduct,
  createInventory,
  updateStock,
  transferStock,
} from '../controllers/inventoryController';
import { protect, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.get('/', getAllInventory);
router.get('/low-stock', getLowStockItems);
router.get('/:productId/:storeId', getInventoryByProduct);
router.post('/', authorizeRoles('admin', 'manager'), createInventory);
router.put('/update-stock', authorizeRoles('admin', 'manager'), updateStock);
router.post('/transfer', authorizeRoles('admin', 'manager'), transferStock);

export default router;