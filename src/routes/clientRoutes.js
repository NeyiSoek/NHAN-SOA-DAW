import { Router } from 'express';
import { renderClientProducts } from '../controllers/clientController.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/products', isAuthenticated, renderClientProducts);

export default router;
