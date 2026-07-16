-- Performance Indexes for PLM System

-- ECOs Indexes
CREATE INDEX IF NOT EXISTS idx_ecos_stage_id ON ecos(stage_id);
CREATE INDEX IF NOT EXISTS idx_ecos_product_id ON ecos(product_id);
CREATE INDEX IF NOT EXISTS idx_ecos_created_by ON ecos(created_by);
CREATE INDEX IF NOT EXISTS idx_ecos_created_at ON ecos(created_at DESC);

-- ECO Changes Index
CREATE INDEX IF NOT EXISTS idx_eco_changes_eco_id ON eco_changes(eco_id);

-- BOM and BOM details Indexes
CREATE INDEX IF NOT EXISTS idx_bom_product_id ON bom(product_id);
CREATE INDEX IF NOT EXISTS idx_bom_components_bom_id ON bom_components(bom_id);
CREATE INDEX IF NOT EXISTS idx_bom_operations_bom_id ON bom_operations(bom_id);

-- Audit Logs Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON audit_logs(record_id);
