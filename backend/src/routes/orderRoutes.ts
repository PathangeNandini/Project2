import { Router } from 'express';
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  refundOrder,
} from '../controllers/orderController';
import { protect, authorizeRoles } from '../middleware/authMiddleware';

console.log('DEBUG orderController exports:', {
  getAllOrders: typeof getAllOrders,
  getOrderById: typeof getOrderById,
  createOrder: typeof createOrder,
  updateOrderStatus: typeof updateOrderStatus,
  refundOrder: typeof refundOrder,
});
console.log('DEBUG middleware exports:', {
  protect: typeof protect,
  authorizeRoles: typeof authorizeRoles,
});

const router = Router();

router.use(protect);

router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.post('/', authorizeRoles('admin', 'manager', 'cashier'), createOrder);
router.put('/:id/status', authorizeRoles('admin', 'manager'), updateOrderStatus);
router.post('/:id/refund', authorizeRoles('admin', 'manager'), refundOrder);

export default router;