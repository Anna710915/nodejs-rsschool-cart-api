CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    status VARCHAR(10) CHECK (status IN ('OPEN', 'ORDERED')) NOT NULL
);

CREATE TABLE products (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) CHECK (price >= 0)
);

CREATE TABLE cart_items (
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    count INTEGER NOT NULL CHECK (count > 0),
    PRIMARY KEY (cart_id, product_id)
);

INSERT INTO carts (id, user_id, created_at, updated_at, status) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', '123e4567-e89b-12d3-a456-426614174000', NOW(), NOW(), 'OPEN'),
    ('550e8400-e29b-41d4-a716-446655440001', '123e4567-e89b-12d3-a456-426614174001', NOW(), NOW(), 'ORDERED');

INSERT INTO cart_items (cart_id, product_id, count) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', '7acad0f6-fef8-412f-856b-d961bd1832d8', 2),
    ('550e8400-e29b-41d4-a716-446655440000', '5cb3e78f-f6cb-432b-b0fe-6861f17103c7', 1),
    ('550e8400-e29b-41d4-a716-446655440001', '2d18fc6c-4f5d-4e96-94a1-dfd75f1a93e8', 3);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    payment JSONB,      
    delivery JSONB,      
    comments TEXT,      
    status VARCHAR(20) CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED')) NOT NULL,
    total NUMERIC(10, 2) NOT NULL,   
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),  
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()   
);

INSERT INTO orders (id, user_id, cart_id, payment, delivery, comments, status, total) VALUES
    ('550e8400-e29b-41d4-a716-446655440002', '123e4567-e89b-12d3-a456-426614174002', '550e8400-e29b-41d4-a716-446655440000', 
     '{"method": "credit_card", "transaction_id": "txn_12345"}', 
     '{"address": "123 Street, City, Country", "delivery_method": "express"}', 
     'Please deliver between 10 AM and 12 PM.', 'PENDING', 100.50),
    ('550e8400-e29b-41d4-a716-446655440003', '123e4567-e89b-12d3-a456-426614174003', '550e8400-e29b-41d4-a716-446655440001', 
     '{"method": "paypal", "transaction_id": "txn_67890"}', 
     '{"address": "456 Avenue, City, Country", "delivery_method": "standard"}', 
     'Gift order for a friend.', 'COMPLETED', 75.25);
