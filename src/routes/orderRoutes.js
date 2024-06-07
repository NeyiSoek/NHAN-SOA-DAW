import { Router } from 'express';
import { renderOrders } from '../controllers/orderController.js';
import { isAuthenticated, isSeller } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/orders', isAuthenticated, isSeller, renderOrders);

export default router;
