const express = require('express');
const auth = require('../middleware/auth');
const pool = require('../config/db');
const router = express.Router();

// Aggregated analytics data for charts
router.get('/analytics', auth, async (req, res) => {
  try {
    // 1. ECO status distribution (pie chart)
    const statusDist = await pool.query(
      `SELECT status, COUNT(*)::int as count FROM ecos GROUP BY status`
    );

    // 2. ECOs created per month (bar chart — last 12 months)
    const monthlyTrend = await pool.query(
      `SELECT TO_CHAR(created_at, 'YYYY-MM') as month, COUNT(*)::int as count
       FROM ecos
       WHERE created_at >= NOW() - INTERVAL '12 months'
       GROUP BY month ORDER BY month ASC`
    );

    // 3. ECOs by type (product vs bom)
    const typeDist = await pool.query(
      `SELECT eco_type, COUNT(*)::int as count FROM ecos GROUP BY eco_type`
    );

    // 4. Stage throughput (how many ECOs passed through each stage)
    const stageStats = await pool.query(
      `SELECT es.name as stage, COUNT(e.id)::int as count
       FROM eco_stages es
       LEFT JOIN ecos e ON e.stage_id = es.id
       GROUP BY es.name, es.order_index
       ORDER BY es.order_index ASC`
    );

    // 5. Products by status
    const productStatus = await pool.query(
      `SELECT status, COUNT(*)::int as count FROM products GROUP BY status`
    );

    res.json({
      statusDistribution: statusDist.rows,
      monthlyTrend: monthlyTrend.rows,
      typeDistribution: typeDist.rows,
      stageStats: stageStats.rows,
      productStatus: productStatus.rows,
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
