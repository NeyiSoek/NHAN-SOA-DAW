import { Router } from 'express';
import { renderCart, addToCart, removeFromCart, renderCheckoutForm, handleCheckout } from '../controllers/cartController.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';

const router = Router();

// Mostrar carrito
router.get('/', isAuthenticated, renderCart);

// Añadir producto al carrito
router.post('/add', isAuthenticated, addToCart);

// Eliminar producto del carrito
router.post('/remove/:id', isAuthenticated, removeFromCart);

// Renderizar formularios de dirección y pago
router.get('/checkout', isAuthenticated, renderCheckoutForm);

// Manejar el proceso de checkout
router.post('/checkout', isAuthenticated, handleCheckout);

export default router;
