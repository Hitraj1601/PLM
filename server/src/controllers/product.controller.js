const pool = require('../config/db');
const AuditService = require('../services/AuditService');
const { getPagination } = require('../utils/paginate.util');

const getAll = async (req, res) => {
  try {
    const { offset, limit, page } = getPagination(req.query);
    const search = req.query.search || '';
    const statusFilter = req.query.status || '';
    const versionFilter = req.query.version || '';

    const conditions = [];
    const params = [];
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR version ILIKE $${params.length})`);
    }
    if (statusFilter) {
      params.push(statusFilter);
      conditions.push(`status = $${params.length}`);
    }
    if (versionFilter) {
      params.push(versionFilter);
      conditions.push(`version = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM products ${whereClause}`, params);
    const total = parseInt(count);

    const dataParams = [...params, limit, offset];
    const { rows } = await pool.query(
      `SELECT * FROM products ${whereClause} ORDER BY name ASC, version DESC LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams
    );

    res.json({
      data: rows,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: offset + limit < total,
        hasPrevPage: page > 1,
      }
    });
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getById = async (req, res) => {
  try {
    // Look up exactly the required product matching ID
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });

    // Look up historical / alternate versions of this same product name
    // This allows the frontend Product Page to show a version history selector
    const { rows: versions } = await pool.query(
      'SELECT * FROM products WHERE name = $1 ORDER BY version DESC',
      [rows[0].name]
    );

    res.json({ ...rows[0], versions });
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const create = async (req, res) => {
  try {
    const { name, version, sale_price, cost_price, attachments } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const { rows } = await pool.query(
      `INSERT INTO products (name, version, sale_price, cost_price, attachments)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, version || 'v1', sale_price || 0, cost_price || 0, JSON.stringify(attachments || [])]
    );

    await AuditService.log({
      action: 'product_created', recordType: 'product', recordId: rows[0].id,
      oldValue: null, newValue: { name, version: rows[0].version },
      userId: req.user.id, userName: req.user.name
    });

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const update = async (req, res) => {
  try {
    const { name, sale_price, cost_price, attachments } = req.body;
    
    // Check if modifying this product is legal based on archival safety
    const { rows: existing } = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Product not found' });
    if (existing[0].status === 'archived') return res.status(400).json({ error: 'Cannot edit archived product' });

    const { rows } = await pool.query(
      `UPDATE products SET name = COALESCE($1, name), sale_price = COALESCE($2, sale_price),
       cost_price = COALESCE($3, cost_price), attachments = COALESCE($4, attachments),
       updated_at = NOW() WHERE id = $5 RETURNING *`,
      [name, sale_price, cost_price, attachments ? JSON.stringify(attachments) : null, req.params.id]
    );

    await AuditService.log({
      action: 'product_updated', recordType: 'product', recordId: req.params.id,
      oldValue: { name: existing[0].name, sale_price: existing[0].sale_price, cost_price: existing[0].cost_price },
      newValue: { name: rows[0].name, sale_price: rows[0].sale_price, cost_price: rows[0].cost_price },
      userId: req.user.id, userName: req.user.name
    });

    res.json(rows[0]);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const remove = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });

    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);

    await AuditService.log({
      action: 'product_deleted', recordType: 'product', recordId: req.params.id,
      oldValue: { name: rows[0].name, version: rows[0].version }, newValue: null,
      userId: req.user.id, userName: req.user.name
    });

    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getAll, getById, create, update, remove };
