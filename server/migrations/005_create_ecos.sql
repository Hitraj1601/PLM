CREATE TABLE IF NOT EXISTS ecos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(300) NOT NULL,
  eco_type VARCHAR(20) CHECK (eco_type IN ('product','bom')) NOT NULL,
  product_id UUID REFERENCES products(id),
  bom_id UUID REFERENCES bom(id),
  created_by UUID REFERENCES users(id),
  effective_date DATE,
  version_update BOOLEAN DEFAULT true,
  stage_id UUID REFERENCES eco_stages(id),
  status VARCHAR(20) CHECK (status IN ('open','applied','rejected','pending_approval')) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
