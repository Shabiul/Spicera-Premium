-- Spicera Premium Database Setup
-- This file creates all necessary tables and inserts initial data for the spice e-commerce platform

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT NOT NULL,
    category TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    product_id VARCHAR NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    shipping_address TEXT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR NOT NULL,
    product_id VARCHAR NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);

-- Insert initial product data (4 premium masala products)
INSERT INTO products (name, description, price, image_url, category, stock, featured) VALUES
(
    'Biryani Masala',
    'Authentic blend of aromatic spices specially crafted for perfect biryani. Contains cardamom, cinnamon, bay leaves, and secret spices for that traditional flavor.',
    100.00,
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    'Masala Blends',
    50,
    true
),
(
    'Korma Masala',
    'Rich and creamy korma spice blend with cashews, almonds, and mild spices. Perfect for creating restaurant-style korma dishes at home.',
    100.00,
    'https://images.unsplash.com/photo-1596797038530-2c107229654b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    'Masala Blends',
    45,
    true
),
(
    'Garam Masala',
    'Classic whole spice blend with black pepper, cinnamon, black cardamom, and cloves. Essential for Indian cooking and adds warmth to any dish.',
    100.00,
    'https://images.unsplash.com/photo-1599040413866-6d57142835f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    'Masala Blends',
    60,
    true
),
(
    'Kitchen King Masala',
    'Versatile all-purpose spice blend perfect for vegetables, dal, and everyday cooking. Contains coriander, cumin, red chili, and aromatic spices.',
    100.00,
    'https://images.unsplash.com/photo-1506629905542-b5bb95ea0e19?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    'Masala Blends',
    55,
    true
)
ON CONFLICT (name) DO NOTHING;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at column
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify the setup
SELECT 'Database setup completed successfully!' AS status;
SELECT 'Total products inserted: ' || COUNT(*) AS product_count FROM products;