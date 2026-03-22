CREATE TABLE IF NOT EXISTS eco_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  eco_id UUID REFERENCES ecos(id) ON DELETE CASCADE,
  change_type VARCHAR(30) CHECK (change_type IN ('component_qty','component_add','component_remove','operation_add','operation_remove','price','name','attachment')),
  field_name VARCHAR(100),
  old_value TEXT,
  new_value TEXT,
  component_name VARCHAR(200)
);
