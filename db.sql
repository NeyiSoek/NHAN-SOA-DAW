CREATE DATABASE IF NOT EXISTS database_links;

USE database_links;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id INT(11) NOT NULL AUTO_INCREMENT,
    username VARCHAR(16) NOT NULL,
    password VARCHAR(60) NOT NULL,
    fullname VARCHAR(100) NOT NULL,
    role ENUM('vendedor', 'cliente') NOT NULL DEFAULT 'cliente',
    PRIMARY KEY (id)
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
    id INT(11) NOT NULL AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    stock INT NOT NULL,
    user_id INT(11),
    image_url VARCHAR(255),
    create_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabla de carrito
CREATE TABLE IF NOT EXISTS cart (
    id INT(11) NOT NULL AUTO_INCREMENT,
    user_id INT(11),
    product_id INT(11),
    quantity INT NOT NULL,
    create_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS orders (
    id INT(11) NOT NULL AUTO_INCREMENT,
    user_id INT(11),
    total DECIMAL(10, 2) NOT NULL,
    status ENUM('pendiente', 'completado') NOT NULL DEFAULT 'pendiente',
    address TEXT NOT NULL,
    payment_info TEXT NOT NULL,
    create_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabla de detalles de pedido
CREATE TABLE IF NOT EXISTS order_items (
    id INT(11) NOT NULL AUTO_INCREMENT,
    order_id INT(11),
    product_id INT(11),
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Trigger para disminuir el stock al hacer una compra
DELIMITER //
CREATE TRIGGER decrease_stock
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
    UPDATE products SET stock = stock - NEW.quantity WHERE id = NEW.product_id;
END//
DELIMITER ;
