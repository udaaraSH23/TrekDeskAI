
module.exports.shorthands = undefined;

module.exports.up = (pgm) => {
  pgm.sql(`
    -- 1. Tenants (For future scale, Kandy Treks is ID 1)
    CREATE TABLE IF NOT EXISTS tenants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        domain VARCHAR(255) UNIQUE,
        google_calendar_api_key_secret_id VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Users (Google OAuth)
    CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        google_id VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'ADMIN',
        last_login TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. AI Configuration
    CREATE TABLE IF NOT EXISTS ai_settings (
        tenant_id UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
        voice_name VARCHAR(50) DEFAULT 'Aoede',
        system_instruction TEXT NOT NULL,
        temperature FLOAT DEFAULT 0.7,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 4. Trek Inventory
    CREATE TABLE IF NOT EXISTS treks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        base_price_per_person DECIMAL(10, 2) NOT NULL,
        transport_fee DECIMAL(10, 2) DEFAULT 0,
        difficulty_level VARCHAR(50),
        is_active BOOLEAN DEFAULT TRUE
    );

    -- 5. Knowledge Base & RAG (pgvector)
    CREATE EXTENSION IF NOT EXISTS vector;
    
    CREATE TABLE IF NOT EXISTS document_chunks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        trek_id UUID REFERENCES treks(id) ON DELETE SET NULL,
        content TEXT NOT NULL,
        embedding vector(768),
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 6. Conversational Analytics (Call Logs)
    CREATE TABLE IF NOT EXISTS call_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        session_id VARCHAR(255) UNIQUE, 
        transcript JSONB, 
        summary TEXT,
        sentiment_score FLOAT, 
        duration_seconds INT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Seed Initial Tenant (Kandy Treks) for the MVP
    INSERT INTO tenants (id, name, domain) 
    VALUES ('00000000-0000-0000-0000-000000000001', 'GuideTours', 'guidetours.com')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO ai_settings (tenant_id, system_instruction) 
    VALUES ('00000000-0000-0000-0000-000000000001', 'You are a helpful trekking guide for GuideTours.')
    ON CONFLICT (tenant_id) DO NOTHING;
  `);
};

module.exports.down = (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS call_logs CASCADE;
    DROP TABLE IF EXISTS document_chunks CASCADE;
    DROP TABLE IF EXISTS treks CASCADE;
    DROP TABLE IF EXISTS ai_settings CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS tenants CASCADE;
    DROP EXTENSION IF EXISTS vector;
  `);
};
