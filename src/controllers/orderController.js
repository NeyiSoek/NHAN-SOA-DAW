import { pool } from '../index.js';

export const renderOrders = async (req, res) => {
    try {
        const [orders] = await pool.query(`
            SELECT 
                products.name as product_name, 
                order_items.quantity, 
                order_items.price * order_items.quantity as total_price, 
                users.fullname as buyer, 
                orders.address, 
                orders.create_at 
            FROM 
                order_items 
            JOIN products ON order_items.product_id = products.id 
            JOIN orders ON order_items.order_id = orders.id 
            JOIN users ON orders.user_id = users.id 
            WHERE products.user_id = ?`, [req.user.id]);

        let totalEarnings = 0;
        orders.forEach(order => {
            totalEarnings += order.total_price;
        });

        res.render('orders/orders', { orders, totalEarnings });
    } catch (error) {
        console.error('Error fetching orders:', error);
        req.flash('error_msg', 'Error fetching orders');
        res.redirect('/products');
    }
};
