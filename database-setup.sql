-- Spicera Premium Database Setup
-- This file creates all necessary tables and inserts initial data for the spice e-commerce platform

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    createdat TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    createdat TIMESTAMP DEFAULT NOW() NOT NULL,
    updatedat TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT NOT NULL,
    category TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    createdat TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedat TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sessionid TEXT,
    userid UUID,
    productid UUID NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    createdat TIMESTAMP DEFAULT NOW() NOT NULL,
    updatedat TIMESTAMP DEFAULT NOW() NOT NULL,
    FOREIGN KEY (productid) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT cart_items_session_or_user CHECK (
        (sessionid IS NOT NULL AND userid IS NULL) OR 
        (sessionid IS NULL AND userid IS NOT NULL)
    )
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userid UUID,
    customername TEXT NOT NULL,
    customeremail TEXT NOT NULL,
    customerphone TEXT,
    shippingaddress TEXT NOT NULL,
    totalamount DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    createdat TIMESTAMP DEFAULT NOW() NOT NULL,
    updatedat TIMESTAMP DEFAULT NOW() NOT NULL,
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE SET NULL
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orderid UUID NOT NULL,
    productid UUID NOT NULL,
    quantity INTEGER NOT NULL,
    unitprice DECIMAL(10, 2) NOT NULL,
    totalprice DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (orderid) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (productid) REFERENCES products(id) ON DELETE RESTRICT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON cart_items(sessionid);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(userid);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(productid);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(orderid);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customeremail);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(userid);

-- Insert initial product data (4 premium masala products)
-- Only insert if products don't already exist
INSERT INTO products (name, description, price, image_url, category, stock, featured) 
SELECT * FROM (VALUES
(
    'Biryani Masala',
    'Authentic blend of aromatic spices specially crafted for perfect biryani. Contains cardamom, cinnamon, bay leaves, and secret spices for that traditional flavor.',
    100.00,
    '/src/assets/images/spices/biryani-masala.jpg',
    'Masala Blends',
    50,
    true
),
(
    'Korma Masala',
    'Rich and creamy korma spice blend with cashews, almonds, and mild spices. Perfect for creating restaurant-style korma dishes at home.',
    100.00,
    '/src/assets/images/spices/korma-masala.jpg',
    'Masala Blends',
    45,
    true
),
(
    'Garam Masala',
    'Classic whole spice blend with black pepper, cinnamon, black cardamom, and cloves. Essential for Indian cooking and adds warmth to any dish.',
    100.00,
    '/src/assets/images/spices/GARAM-MASALA.jpeg',
    'Masala Blends',
    60,
    true
),
(
    'Kitchen King Masala',
    'Versatile all-purpose spice blend perfect for vegetables, dal, and everyday cooking. Contains coriander, cumin, red chili, and aromatic spices.',
    100.00,
    '/src/assets/images/spices/KITCHEN-KING.jpeg',
    'Masala Blends',
    55,
    true
)
) AS new_products(name, description, price, image_url, category, stock, featured)
WHERE NOT EXISTS (
    SELECT 1 FROM products WHERE products.name = new_products.name
);

-- Create function to automatically update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updatedat_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedat = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updatedAt column
DROP TRIGGER IF EXISTS update_products_updatedAt ON products;
CREATE TRIGGER update_products_updatedAt BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updatedat_column();

DROP TRIGGER IF EXISTS update_cart_items_updatedAt ON cart_items;
CREATE TRIGGER update_cart_items_updatedAt BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updatedat_column();

DROP TRIGGER IF EXISTS update_orders_updatedAt ON orders;
CREATE TRIGGER update_orders_updatedAt BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updatedat_column();

DROP TRIGGER IF EXISTS update_users_updatedAt ON users;
CREATE TRIGGER update_users_updatedAt BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updatedat_column();

-- Verify the setup
SELECT 'Database setup completed successfully!' AS status;
SELECT 'Total products inserted: ' || COUNT(*) AS product_count FROM products;