import { pool } from '../index.js';

// Renderizar la vista de productos para los clientes
export const renderClientProducts = async (req, res) => {
  try {
    if (req.user.role === 'cliente') {
      const [products] = await pool.query('SELECT * FROM products');
      res.render('client/products', { user: req.user, products });
    } else {
      res.redirect('/auth/profile');
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    res.redirect('/auth/profile');
  }
};
