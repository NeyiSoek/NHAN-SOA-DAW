import { Router } from 'express';
import { renderProductForm, addProduct, renderProducts, renderEditForm, editProduct, deleteProduct } from '../controllers/productController.js';
import { isAuthenticated, isSeller } from '../middlewares/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Ruta para mostrar el formulario de agregar producto
router.get('/add', isAuthenticated, isSeller, renderProductForm);
// Ruta para agregar un producto
router.post('/add', isAuthenticated, isSeller, upload.single('image'), addProduct);

// Ruta para listar productos
router.get('/', isAuthenticated, isSeller, renderProducts);

// Ruta para mostrar el formulario de edición de producto
router.get('/edit/:id', isAuthenticated, isSeller, renderEditForm);
// Ruta para editar un producto
router.post('/edit/:id', isAuthenticated, isSeller, upload.single('image'), editProduct);

// Ruta para eliminar un producto
router.get('/delete/:id', isAuthenticated, isSeller, deleteProduct);

export default router;
