-- POS System Database Schema Update for Inventory Management
-- Run these commands in your Supabase SQL editor to add inventory features

-- Add new columns to products table for enhanced stock management
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS image_public_id TEXT,
ADD COLUMN IF NOT EXISTS stock_type VARCHAR(20) DEFAULT 'tracked' CHECK (stock_type IN ('tracked', 'unlimited', 'recipe-based'));

-- Update existing products to have stock_type
UPDATE products SET stock_type = 'tracked' WHERE stock_type IS NULL;

-- Create recipe ingredients table (for recipe-based products)
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    ingredient_name VARCHAR(255) NOT NULL,
    quantity_needed DECIMAL(10, 3) NOT NULL CHECK (quantity_needed > 0),
    unit VARCHAR(50) NOT NULL, -- e.g., 'grams', 'ml', 'pieces'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ingredient inventory table (for tracking raw ingredients)
CREATE TABLE IF NOT EXISTS ingredient_inventory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    current_quantity DECIMAL(10, 3) DEFAULT 0 CHECK (current_quantity >= 0),
    unit VARCHAR(50) NOT NULL,
    cost_per_unit DECIMAL(10, 4) DEFAULT 0,
    supplier VARCHAR(255),
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ingredient transactions table (for tracking ingredient usage)
CREATE TABLE IF NOT EXISTS ingredient_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ingredient_id UUID NOT NULL REFERENCES ingredient_inventory(id),
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'adjustment', 'waste')),
    quantity_change DECIMAL(10, 3) NOT NULL,
    previous_quantity DECIMAL(10, 3) NOT NULL,
    new_quantity DECIMAL(10, 3) NOT NULL,
    reference_id UUID, -- Can reference order_id or other transaction references
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_product_id ON recipe_ingredients(product_id);
CREATE INDEX IF NOT EXISTS idx_ingredient_inventory_name ON ingredient_inventory(name);
CREATE INDEX IF NOT EXISTS idx_ingredient_transactions_ingredient_id ON ingredient_transactions(ingredient_id);

-- Create triggers for updated_at on new tables
DROP TRIGGER IF EXISTS update_recipe_ingredients_updated_at ON recipe_ingredients;
CREATE TRIGGER update_recipe_ingredients_updated_at BEFORE UPDATE ON recipe_ingredients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ingredient_inventory_updated_at ON ingredient_inventory;
CREATE TRIGGER update_ingredient_inventory_updated_at BEFORE UPDATE ON ingredient_inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate available quantity for recipe-based products
CREATE OR REPLACE FUNCTION get_recipe_product_availability(product_id UUID)
RETURNS INTEGER AS $$
DECLARE
    min_possible INTEGER := 999999;
    ingredient_record RECORD;
    available_quantity INTEGER;
BEGIN
    -- For recipe-based products, calculate how many can be made based on ingredients
    FOR ingredient_record IN 
        SELECT ri.ingredient_name, ri.quantity_needed, ii.current_quantity
        FROM recipe_ingredients ri
        JOIN ingredient_inventory ii ON ii.name = ri.ingredient_name
        WHERE ri.product_id = product_id
    LOOP
        -- Calculate how many products can be made with this ingredient
        available_quantity := FLOOR(ingredient_record.current_quantity / ingredient_record.quantity_needed);
        
        -- The minimum determines how many products can actually be made
        IF available_quantity < min_possible THEN
            min_possible := available_quantity;
        END IF;
    END LOOP;
    
    -- If no ingredients found, return 0
    IF min_possible = 999999 THEN
        RETURN 0;
    END IF;
    
    RETURN min_possible;
END;
$$ LANGUAGE plpgsql;

-- Function to update ingredient inventory when recipe-based product is sold
CREATE OR REPLACE FUNCTION consume_recipe_ingredients(
    product_id UUID,
    quantity_sold INTEGER
)
RETURNS VOID AS $$
DECLARE
    ingredient_record RECORD;
    total_needed DECIMAL(10, 3);
    current_stock DECIMAL(10, 3);
BEGIN
    -- Consume ingredients for recipe-based products
    FOR ingredient_record IN 
        SELECT ri.ingredient_name, ri.quantity_needed, ii.id as ingredient_id, ii.current_quantity
        FROM recipe_ingredients ri
        JOIN ingredient_inventory ii ON ii.name = ri.ingredient_name
        WHERE ri.product_id = product_id
    LOOP
        total_needed := ingredient_record.quantity_needed * quantity_sold;
        current_stock := ingredient_record.current_quantity;
        
        -- Update ingredient inventory
        UPDATE ingredient_inventory
        SET current_quantity = GREATEST(0, current_quantity - total_needed)
        WHERE id = ingredient_record.ingredient_id;
        
        -- Log ingredient transaction
        INSERT INTO ingredient_transactions (
            ingredient_id,
            transaction_type,
            quantity_change,
            previous_quantity,
            new_quantity
        ) VALUES (
            ingredient_record.ingredient_id,
            'usage',
            -total_needed,
            current_stock,
            GREATEST(0, current_stock - total_needed)
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Enhanced function to update product stock (handles all stock types)
CREATE OR REPLACE FUNCTION update_product_stock_enhanced(
    product_id UUID,
    quantity_sold INTEGER
)
RETURNS VOID AS $$
DECLARE
    current_stock INTEGER;
    product_stock_type VARCHAR(20);
BEGIN
    -- Get current stock and stock type
    SELECT stock_quantity, stock_type INTO current_stock, product_stock_type
    FROM products
    WHERE id = product_id;
    
    -- Handle different stock types
    CASE product_stock_type
        WHEN 'tracked' THEN
            -- Traditional inventory tracking
            UPDATE products
            SET stock_quantity = GREATEST(0, stock_quantity - quantity_sold)
            WHERE id = product_id;
            
            -- Log inventory transaction
            INSERT INTO inventory_transactions (
                product_id,
                transaction_type,
                quantity_change,
                previous_quantity,
                new_quantity
            ) VALUES (
                product_id,
                'sale',
                -quantity_sold,
                current_stock,
                GREATEST(0, current_stock - quantity_sold)
            );
            
        WHEN 'recipe-based' THEN
            -- Consume ingredients instead of tracking finished product stock
            PERFORM consume_recipe_ingredients(product_id, quantity_sold);
            
        WHEN 'unlimited' THEN
            -- No stock tracking needed
            NULL;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Sample ingredient data for demonstration
INSERT INTO ingredient_inventory (name, current_quantity, unit, cost_per_unit) VALUES
('Flour', 5000.0, 'grams', 0.002),
('Sugar', 2000.0, 'grams', 0.003),
('Eggs', 50.0, 'pieces', 0.25),
('Milk', 3000.0, 'ml', 0.001),
('Butter', 1000.0, 'grams', 0.008),
('Coffee Beans', 2000.0, 'grams', 0.015),
('Vanilla Extract', 200.0, 'ml', 0.05)
ON CONFLICT (name) DO NOTHING;

-- Sample recipe for a muffin (recipe-based product)
-- First, let's add a recipe-based muffin product
INSERT INTO products (name, description, price, category, stock_type) VALUES
('Recipe Muffin', 'Freshly baked muffin made from ingredients', 3.99, 'Food', 'recipe-based')
ON CONFLICT DO NOTHING;

-- Add recipe ingredients for the muffin (this would need the actual product ID)
-- This is just an example - you'd need to get the actual product ID first
-- INSERT INTO recipe_ingredients (product_id, ingredient_name, quantity_needed, unit) VALUES
-- ('product-uuid-here', 'Flour', 100.0, 'grams'),
-- ('product-uuid-here', 'Sugar', 50.0, 'grams'),
-- ('product-uuid-here', 'Eggs', 0.5, 'pieces'),
-- ('product-uuid-here', 'Milk', 75.0, 'ml'),
-- ('product-uuid-here', 'Butter', 25.0, 'grams');

-- Add some unlimited stock products (services)
INSERT INTO products (name, description, price, category, stock_type, stock_quantity) VALUES
('Gift Card', 'Digital gift card', 25.00, 'Services', 'unlimited', NULL),
('Coffee Consultation', 'Personal coffee brewing consultation', 15.00, 'Services', 'unlimited', NULL)
ON CONFLICT DO NOTHING;
