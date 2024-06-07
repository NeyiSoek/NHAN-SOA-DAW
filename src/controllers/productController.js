import { pool } from '../index.js';

export const renderProductForm = (req, res) => {
  res.render('products/add');
};

export const addProduct = async (req, res) => {
  const { name, price, description, stock } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!name || !price || !description || !stock || !image) {
    req.flash('error_msg', 'All fields are required');
    return res.redirect('/products/add');
  }

  await pool.query('INSERT INTO products (name, price, description, stock, image_url, user_id) VALUES (?, ?, ?, ?, ?, ?)', [name, price, description, stock, image, req.user.id]);
  req.flash('success_msg', 'Product added successfully');
  res.redirect('/products');
};

export const renderProducts = async (req, res) => {
  const [products] = await pool.query('SELECT * FROM products WHERE user_id = ?', [req.user.id]);
  res.render('products/list', { products });
};

export const renderEditForm = async (req, res) => {
  const { id } = req.params;
  const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
  if (products.length > 0) {
    res.render('products/edit', { product: products[0] });
  } else {
    req.flash('error_msg', 'Product not found');
    res.redirect('/products');
  }
};

export const editProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price, description, stock } = req.body;
  const image = req.file ? req.file.filename : null;

  const updateFields = [];
  const updateValues = [];

  if (name) {
    updateFields.push('name = ?');
    updateValues.push(name);
  }
  if (price) {
    updateFields.push('price = ?');
    updateValues.push(price);
  }
  if (description) {
    updateFields.push('description = ?');
    updateValues.push(description);
  }
  if (stock) {
    updateFields.push('stock = ?');
    updateValues.push(stock);
  }
  if (image) {
    updateFields.push('image_url = ?');
    updateValues.push(image);
  }

  if (updateFields.length > 0) {
    const query = `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`;
    updateValues.push(id);

    try {
      await pool.query(query, updateValues);
      req.flash('success_msg', 'Product updated successfully');
      res.redirect('/products');
    } catch (error) {
      console.error('Error updating product:', error);
      req.flash('error_msg', 'Error updating product');
      res.redirect(`/products/edit/${id}`);
    }
  } else {
    req.flash('error_msg', 'No fields to update');
    res.redirect(`/products/edit/${id}`);
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM products WHERE id = ?', [id]);
  req.flash('success_msg', 'Product deleted successfully');
  res.redirect('/products');
};
