-- USERS
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),   -- hashed
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PRODUCTS
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150),
  rating FLOAT DEFAULT 0,
  number_of_ratings INT DEFAULT 0,
  category ENUM(
    'Supermarket', 'Home & Office', 'Appliances', 'Electronics', 
    'Health and Beauty', 'Fashion', 'Computing', 'Sporting Goods', 
    'Baby Products', 'Gaming'
  ),
  type VARCHAR(100), -- e.g. "men's clothing"
  price DECIMAL(10,2),
  discount FLOAT DEFAULT 0, -- 0 - 1
  image VARCHAR(255)
);

-- CART
CREATE TABLE cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  product_id INT,
  quantity INT DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- WISHLIST
CREATE TABLE wishlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  product_id INT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ORDERS
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  total DECIMAL(10,2),
  sub_total DECIMAL(10,2),
  shipping DECIMAL(10,2),
  tax DECIMAL(10,2),
  applied_coupon VARCHAR(50),
  status ENUM('pending','completed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ORDER ITEMS
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  product_id INT,
  quantity INT DEFAULT 1,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- PAYMENTS
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  order_id INT,
  total DECIMAL(10,2),
  status ENUM('pending','paid','failed') DEFAULT 'pending',
  merchant_ref VARCHAR(50), -- reference for payment gateway
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
