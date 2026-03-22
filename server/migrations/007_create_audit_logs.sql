CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(100) NOT NULL,
  record_type VARCHAR(50),
  record_id UUID,
  old_value JSONB,
  new_value JSONB,
  user_id UUID REFERENCES users(id),
  user_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);
