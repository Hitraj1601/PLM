CREATE TABLE IF NOT EXISTS bom (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  name VARCHAR(200),
  version VARCHAR(20) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('active','archived')) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bom_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bom_id UUID REFERENCES bom(id) ON DELETE CASCADE,
  component_name VARCHAR(200) NOT NULL,
  quantity DECIMAL(10,3) NOT NULL,
  unit VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS bom_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bom_id UUID REFERENCES bom(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  duration_mins INTEGER NOT NULL,
  work_center VARCHAR(100)
);
