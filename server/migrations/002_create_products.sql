CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  version VARCHAR(20) NOT NULL,
  sale_price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  status VARCHAR(20) CHECK (status IN ('active','archived')) DEFAULT 'active',
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
