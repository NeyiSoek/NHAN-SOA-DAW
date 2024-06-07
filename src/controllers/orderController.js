import { pool } from '../index.js';

export const renderOrders = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                products.name AS product_name, 
                order_items.quantity, 
                order_items.price, 
                users.fullname AS buyer_name, 
                orders.address, 
                orders.create_at AS order_date
            FROM 
                order_items 
                JOIN products ON order_items.product_id = products.id 
                JOIN orders ON order_items.order_id = orders.id 
                JOIN users ON orders.user_id = users.id
            WHERE 
                products.user_id = ?
            ORDER BY 
                orders.create_at DESC
        `, [req.user.id]);

        let totalEarnings = 0;
        rows.forEach(item => {
            totalEarnings += item.price * item.quantity;
        });

        res.render('orders/orders', { orders: rows, totalEarnings: totalEarnings.toFixed(2) });
    } catch (error) {
        console.error('Error fetching orders:', error);
        req.flash('error_msg', 'Error fetching orders');
        res.redirect('/products');
    }
};
