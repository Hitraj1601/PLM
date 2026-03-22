const pool = require('../config/db');
const AuditService = require('../services/AuditService');
const { getPagination } = require('../utils/paginate.util');

const getAll = async (req, res) => {
  try {
    const { offset, limit, page } = getPagination(req.query);
    const search = req.query.search || '';
    const statusFilter = req.query.status || '';

    const conditions = [];
    const params = [];
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(p.name ILIKE $${params.length} OR b.version ILIKE $${params.length})`);
    }
    if (statusFilter) {
      params.push(statusFilter);
      conditions.push(`b.status = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) FROM bom b LEFT JOIN products p ON b.product_id = p.id ${whereClause}`;
    const { rows: [{ count }] } = await pool.query(countQuery, params);
    const total = parseInt(count);

    const dataParams = [...params, limit, offset];
    const { rows } = await pool.query(
      `SELECT b.*, p.name as product_name, p.version as product_version,
       (SELECT json_agg(json_build_object('id', bc.id, 'component_name', bc.component_name, 'quantity', bc.quantity, 'unit', bc.unit))
        FROM bom_components bc WHERE bc.bom_id = b.id) as components,
       (SELECT json_agg(json_build_object('id', bo.id, 'name', bo.name, 'duration_mins', bo.duration_mins, 'work_center', bo.work_center))
        FROM bom_operations bo WHERE bo.bom_id = b.id) as operations
       FROM bom b
       LEFT JOIN products p ON b.product_id = p.id
       ${whereClause}
       ORDER BY p.name ASC, b.version DESC
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
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
    console.error('Get BoMs error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getById = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT b.*, p.name as product_name, p.version as product_version
       FROM bom b
       LEFT JOIN products p ON b.product_id = p.id
       WHERE b.id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'BoM not found' });

    const { rows: components } = await pool.query(
      'SELECT * FROM bom_components WHERE bom_id = $1', [req.params.id]
    );
    const { rows: operations } = await pool.query(
      'SELECT * FROM bom_operations WHERE bom_id = $1', [req.params.id]
    );

    res.json({ ...rows[0], components, operations });
  } catch (err) {
    console.error('Get BoM error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const create = async (req, res) => {
  // Obtain a dedicated DB client from the pool to run a multi-step Transaction
  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // Start SQL Transaction block
    const { product_id, name, version, components, operations } = req.body;
    if (!product_id) return res.status(400).json({ error: 'Product ID is required' });

    // Step 1: Create the parent Bill of Materials record linking it to a product
    const { rows: [bom] } = await client.query(
      `INSERT INTO bom (product_id, name, version) VALUES ($1, $2, $3) RETURNING *`,
      [product_id, name || '', version || 'v1']
    );

    // Step 2: In loop, insert all provided physical components mapped to this BOM
    if (components && components.length > 0) {
      for (const comp of components) {
        await client.query(
          `INSERT INTO bom_components (bom_id, component_name, quantity, unit)
           VALUES ($1, $2, $3, $4)`,
          [bom.id, comp.component_name, comp.quantity, comp.unit || 'pcs']
        );
      }
    }

    // Step 3: In loop, insert all provided manufacturing operations routing steps
    if (operations && operations.length > 0) {
      for (const op of operations) {
        await client.query(
          `INSERT INTO bom_operations (bom_id, name, duration_mins, work_center)
           VALUES ($1, $2, $3, $4)`,
          [bom.id, op.name, op.duration_mins, op.work_center || '']
        );
      }
    }

    await client.query('COMMIT'); // Finalize transaction logic successfully

    // Step 4: Record this significant activity on the system Audit Trail
    await AuditService.log({
      action: 'bom_created', recordType: 'bom', recordId: bom.id,
      oldValue: null, newValue: { product_id, version: bom.version },
      userId: req.user.id, userName: req.user.name
    });

    // Fetch complete BOM
    const { rows: [completeBom] } = await pool.query(
      `SELECT b.*, p.name as product_name FROM bom b
       LEFT JOIN products p ON b.product_id = p.id WHERE b.id = $1`,
      [bom.id]
    );
    const { rows: comps } = await pool.query('SELECT * FROM bom_components WHERE bom_id = $1', [bom.id]);
    const { rows: ops } = await pool.query('SELECT * FROM bom_operations WHERE bom_id = $1', [bom.id]);

    res.status(201).json({ ...completeBom, components: comps, operations: ops });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create BoM error:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

const update = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { components, operations, name } = req.body;

    const { rows: existing } = await client.query('SELECT * FROM bom WHERE id = $1', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'BoM not found' });
    if (existing[0].status === 'archived') return res.status(400).json({ error: 'Cannot edit archived BoM' });

    if (name !== undefined) {
      await client.query('UPDATE bom SET name = $1 WHERE id = $2', [name, req.params.id]);
    }

    if (components) {
      await client.query('DELETE FROM bom_components WHERE bom_id = $1', [req.params.id]);
      for (const comp of components) {
        await client.query(
          `INSERT INTO bom_components (bom_id, component_name, quantity, unit)
           VALUES ($1, $2, $3, $4)`,
          [req.params.id, comp.component_name, comp.quantity, comp.unit || 'pcs']
        );
      }
    }

    // Wipe out operations completely and rebuild from scratch from updated JSON
    if (operations) {
      await client.query('DELETE FROM bom_operations WHERE bom_id = $1', [req.params.id]);
      for (const op of operations) {
        await client.query(
          `INSERT INTO bom_operations (bom_id, name, duration_mins, work_center)
           VALUES ($1, $2, $3, $4)`,
          [req.params.id, op.name, op.duration_mins, op.work_center || '']
        );
      }
    }

    // Persist changes and log them
    await client.query('COMMIT');

    await AuditService.log({
      action: 'bom_updated', recordType: 'bom', recordId: req.params.id,
      oldValue: null, newValue: { updated: true },
      userId: req.user.id, userName: req.user.name
    });

    const result = await pool.query(
      `SELECT b.*, p.name as product_name FROM bom b
       LEFT JOIN products p ON b.product_id = p.id WHERE b.id = $1`, [req.params.id]
    );
    const { rows: comps } = await pool.query('SELECT * FROM bom_components WHERE bom_id = $1', [req.params.id]);
    const { rows: ops } = await pool.query('SELECT * FROM bom_operations WHERE bom_id = $1', [req.params.id]);

    res.json({ ...result.rows[0], components: comps, operations: ops });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Update BoM error:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

module.exports = { getAll, getById, create, update };
