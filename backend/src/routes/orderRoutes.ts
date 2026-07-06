import { Router } from 'express';
import {
  checkout,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/orderController';
import { protect, authorizeRoles } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.use(protect);

router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.post('/checkout', validateRequest(['storeId', 'items', 'paymentMethod']), checkout);
router.put('/:id/status', authorizeRoles('admin', 'manager'), updateOrderStatus);

export default router;
