CREATE TABLE IF NOT EXISTS eco_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  eco_id UUID NOT NULL REFERENCES ecos(id) ON DELETE CASCADE,
  risk_level VARCHAR(20) NOT NULL DEFAULT 'medium',
  estimated_time VARCHAR(100),
  impact_areas TEXT,
  recommendations TEXT,
  summary TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eco_predictions_eco ON eco_predictions(eco_id);
