const express = require('express');
const auth = require('../middleware/auth');
const pool = require('../config/db');
const router = express.Router();

// ECO History
// ECO History
router.get('/eco-history', auth, async (req, res) => {
  try {
    // Select the full list of ECOs along with stage info, parent product, and creator details
    // It also constructs a JSON array of all specific field-level changes tied to each ECO
    const { rows } = await pool.query(
      `SELECT e.*, es.name as stage_name, p.name as product_name, u.name as creator_name,
       (SELECT json_agg(json_build_object(
         'change_type', ec.change_type, 'field_name', ec.field_name,
         'old_value', ec.old_value, 'new_value', ec.new_value, 'component_name', ec.component_name
       )) FROM eco_changes ec WHERE ec.eco_id = e.id) as changes
       FROM ecos e
       LEFT JOIN eco_stages es ON e.stage_id = es.id
       LEFT JOIN products p ON e.product_id = p.id
       LEFT JOIN users u ON e.created_by = u.id
       ORDER BY e.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('ECO history error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Version Matrix — Active products with their versions and BoMs
router.get('/version-matrix', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.id as product_id, p.name, p.version, p.status as product_status,
              b.id as bom_id, b.version as bom_version, b.status as bom_status
       FROM products p
       LEFT JOIN bom b ON b.product_id = p.id
       ORDER BY p.name, p.version DESC, b.version DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Version matrix error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Product Versions timeline
// Product Versions timeline
router.get('/product-versions/:productName', auth, async (req, res) => {
  try {
    // Retrieve historical audit logs specifying all changes to a specific product
    // by mapping JSON aggregates correlated by the audit log table
    const { rows } = await pool.query(
      `SELECT p.*,
       (SELECT json_agg(json_build_object(
         'action', al.action, 'old_value', al.old_value, 'new_value', al.new_value,
         'user_name', al.user_name, 'created_at', al.created_at
       ) ORDER BY al.created_at ASC)
       FROM audit_logs al WHERE al.record_type = 'product' AND al.record_id = p.id) as history
       FROM products p
       WHERE p.name = $1
       ORDER BY p.version DESC`,
      [req.params.productName]
    );
    res.json(rows);
  } catch (err) {
    console.error('Product versions error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dashboard stats
// Dashboard stats
router.get('/dashboard-stats', auth, async (req, res) => {
  try {
    // Execute multiple statistical COUNT queries in parallel spanning open ECOs,
    // pending approvals, and active products / BOM counts.
    const [ecos, pendingApprovals, activeProducts, activeBoms] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM ecos WHERE status = 'open'"),
      pool.query(`SELECT COUNT(*) FROM ecos e JOIN eco_stages es ON e.stage_id = es.id
                  WHERE e.status = 'open' AND es.requires_approval = true`),
      pool.query("SELECT COUNT(*) FROM products WHERE status = 'active'"),
      pool.query("SELECT COUNT(*) FROM bom WHERE status = 'active'"),
    ]);

    // Return the aggregated summary
    res.json({
      openEcos: parseInt(ecos.rows[0].count),
      pendingApprovals: parseInt(pendingApprovals.rows[0].count),
      activeProducts: parseInt(activeProducts.rows[0].count),
      activeBoms: parseInt(activeBoms.rows[0].count),
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Recent ECOs for dashboard
router.get('/recent-ecos', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT e.*, es.name as stage_name, p.name as product_name, u.name as creator_name
       FROM ecos e
       LEFT JOIN eco_stages es ON e.stage_id = es.id
       LEFT JOIN products p ON e.product_id = p.id
       LEFT JOIN users u ON e.created_by = u.id
       ORDER BY e.created_at DESC LIMIT 5`
    );
    res.json(rows);
  } catch (err) {
    console.error('Recent ECOs error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
