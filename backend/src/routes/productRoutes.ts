import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  getProductByBarcode,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { protect, authorizeRoles } from '../middleware/authMiddleware';
import { cacheResponse } from '../middleware/cacheMiddleware';

const router = Router();

router.use(protect);

router.get('/', cacheResponse(300), getAllProducts);
router.get('/barcode/:barcode', cacheResponse(60), getProductByBarcode);
router.get('/:id', cacheResponse(300), getProductById);
router.post('/', authorizeRoles('admin', 'manager'), createProduct);
router.put('/:id', authorizeRoles('admin', 'manager'), updateProduct);
router.delete('/:id', authorizeRoles('admin'), deleteProduct);

export default router;