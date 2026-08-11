-- ============================================================================
-- VoiceOps Enterprise PostgreSQL & Supabase Database Migration Schema
-- Enable PgVector, Customer CRM, Orders, Conversations, RAG Chunks, Escalations
-- ============================================================================

-- 1. Enable pgvector Extension for RAG Vector Embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    customer_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    tier VARCHAR(50) DEFAULT 'Standard',
    open_tickets INT DEFAULT 0,
    recent_order_ids JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    order_id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) REFERENCES customers(customer_id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    items JSONB DEFAULT '[]'::jsonb,
    tracking_number VARCHAR(100),
    estimated_delivery VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
    conversation_id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) REFERENCES customers(customer_id) ON DELETE CASCADE,
    sentiment_score NUMERIC(3, 2) DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Messages Table
CREATE TABLE IF NOT EXISTS messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id VARCHAR(50) REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    agent_type VARCHAR(50) DEFAULT 'voice_operations_agent',
    tool_calls JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Knowledge Documents Table
CREATE TABLE IF NOT EXISTS documents (
    document_id VARCHAR(50) PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(20) NOT NULL,
    title VARCHAR(255),
    file_size_bytes INT DEFAULT 0,
    total_chunks INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Document Chunks Table with PgVector Similarity Index
CREATE TABLE IF NOT EXISTS document_chunks (
    chunk_id VARCHAR(100) PRIMARY KEY,
    document_id VARCHAR(50) REFERENCES documents(document_id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    embedding vector(1536), -- 1536-dim embeddings for OpenAI / PgVector similarity
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create HNSW Vector Index for Fast Cosine Similarity Search
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx 
ON document_chunks 
USING hnsw (embedding vector_cosine_ops);

-- 8. Support Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
    ticket_id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) REFERENCES customers(customer_id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'normal',
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Human Escalations Table
CREATE TABLE IF NOT EXISTS escalations (
    escalation_id VARCHAR(50) PRIMARY KEY,
    conversation_id VARCHAR(50) REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    customer_id VARCHAR(50) REFERENCES customers(customer_id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    intent VARCHAR(50) NOT NULL,
    urgency VARCHAR(20) DEFAULT 'normal',
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'resolved'
    customer_profile JSONB DEFAULT '{}'::jsonb,
    full_transcript JSONB DEFAULT '[]'::jsonb,
    actions_performed JSONB DEFAULT '[]'::jsonb,
    retrieved_knowledge_sources JSONB DEFAULT '[]'::jsonb,
    human_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 10. Evaluations Table
CREATE TABLE IF NOT EXISTS evaluations (
    eval_id VARCHAR(50) PRIMARY KEY,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_cases INT DEFAULT 0,
    passed_cases INT DEFAULT 0,
    failed_cases INT DEFAULT 0,
    asr_metrics JSONB DEFAULT '{}'::jsonb,
    rag_metrics JSONB DEFAULT '{}'::jsonb,
    agent_metrics JSONB DEFAULT '{}'::jsonb,
    voice_metrics JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- Seed Sample Mock Data (Customers & Orders)
-- ============================================================================

INSERT INTO customers (customer_id, name, email, tier, open_tickets, recent_order_ids)
VALUES 
    ('cust_1001', 'Alex Mercer', 'alex.mercer@example.com', 'VIP Gold', 0, '["ORD-8842", "ORD-9921"]'::jsonb),
    ('cust_1002', 'Sarah Connor', 'sarah.connor@example.com', 'Standard', 1, '["ORD-3310"]'::jsonb)
ON CONFLICT (customer_id) DO NOTHING;

INSERT INTO orders (order_id, customer_id, status, total_amount, items, tracking_number, estimated_delivery)
VALUES 
    ('ORD-8842', 'cust_1001', 'Processing', 149.99, '["Wireless Noise-Canceling Headphones"]'::jsonb, 'TRK-9081234', 'Tomorrow by 5 PM'),
    ('ORD-9921', 'cust_1001', 'Delivered', 89.50, '["Smart Ergonomic Mouse Pad", "USB-C Fast Charger"]'::jsonb, 'TRK-4410982', 'Delivered yesterday'),
    ('ORD-3310', 'cust_1002', 'In Transit', 299.00, '["4K Ultra HD Monitor Arm"]'::jsonb, 'TRK-7712390', 'Friday, Aug 14')
ON CONFLICT (order_id) DO NOTHING;
