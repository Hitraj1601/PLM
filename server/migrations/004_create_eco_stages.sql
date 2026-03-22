CREATE TABLE IF NOT EXISTS eco_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  order_index INTEGER NOT NULL,
  requires_approval BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
