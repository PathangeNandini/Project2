import { Router } from 'express';
import {
  getSalesReport,
  getDailyReport,
  getInventorySummary,
} from '../controllers/reportController';
import { protect, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);
router.use(authorizeRoles('admin', 'manager'));

router.get('/sales', getSalesReport);
router.get('/daily', getDailyReport);
router.get('/inventory-summary', getInventorySummary);

export default router;