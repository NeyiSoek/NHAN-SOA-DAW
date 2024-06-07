import { pool } from '../index.js';

export const renderCart = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT cart.id, products.name, products.price, products.image_url, cart.quantity FROM cart INNER JOIN products ON cart.product_id = products.id WHERE cart.user_id = ?',
            [req.user.id]
        );

        let total = 0;
        rows.forEach(item => {
            total += item.price * item.quantity;
        });

        res.render('cart/cart', { cartItems: rows, total });
    } catch (error) {
        console.error('Error fetching cart items:', error);
        req.flash('error_msg', 'Error fetching cart items');
        res.redirect('/client/products');
    }
};

export const addToCart = async (req, res) => {
    const { productId } = req.body;
    try {
        await pool.query(
            'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE quantity = quantity + 1',
            [req.user.id, productId]
        );
        req.flash('success_msg', 'Product added to cart');
        res.redirect('/client/products');
    } catch (error) {
        console.error('Error adding to cart:', error);
        req.flash('error_msg', 'Error adding to cart');
        res.redirect('/client/products');
    }
};

export const removeFromCart = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM cart WHERE id = ?', [id]);
        req.flash('success_msg', 'Product removed from cart');
        res.redirect('/cart');
    } catch (error) {
        console.error('Error removing from cart:', error);
        req.flash('error_msg', 'Error removing from cart');
        res.redirect('/cart');
    }
};

export const renderCheckoutForm = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT cart.id, products.name, products.price, products.image_url, cart.quantity FROM cart INNER JOIN products ON cart.product_id = products.id WHERE cart.user_id = ?',
            [req.user.id]
        );

        let total = 0;
        rows.forEach(item => {
            total += item.price * item.quantity;
        });

        res.render('cart/checkout', { cartItems: rows, total });
    } catch (error) {
        console.error('Error fetching cart items:', error);
        req.flash('error_msg', 'Error fetching cart items');
        res.redirect('/cart');
    }
};

export const handleCheckout = async (req, res) => {
    const { name, address, zip, country, phone, cardNumber, cardName, expiryDate, securityCode } = req.body;

    try {
        const [cartItems] = await pool.query(
            'SELECT cart.id, products.id as product_id, products.name, products.price, cart.quantity FROM cart INNER JOIN products ON cart.product_id = products.id WHERE cart.user_id = ?',
            [req.user.id]
        );

        let total = 0;
        cartItems.forEach(item => {
            total += item.price * item.quantity;
        });

        const [orderResult] = await pool.query(
            'INSERT INTO orders (user_id, total, address, payment_info, status) VALUES (?, ?, ?, ?, "completado")',
            [req.user.id, total, `${name}, ${address}, ${zip}, ${country}, ${phone}`, `${cardNumber.slice(-4)}, ${cardName}, ${expiryDate}, ${securityCode}`]
        );

        const orderId = orderResult.insertId;

        for (let item of cartItems) {
            await pool.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price]
            );
        }

        await pool.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);

        res.render('cart/ticket', {
            name,
            address,
            zip,
            country,
            phone,
            last4Digits: cardNumber.slice(-4),
            products: cartItems,
            total
        });
    } catch (error) {
        console.error('Error processing checkout:', error);
        req.flash('error_msg', 'Error processing checkout');
        res.redirect('/cart');
    }
};
