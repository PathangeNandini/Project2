import { Router } from 'express';
import { getSummary } from '../controllers/dashboardController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);
router.get('/summary', getSummary);

export default router;
