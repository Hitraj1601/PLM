const pool = require('../config/db');
const ECOService = require('../services/ECOService');
const AuditService = require('../services/AuditService');
const { getPagination } = require('../utils/paginate.util');

const getAll = async (req, res) => {
  try {
    const { offset, limit, page } = getPagination(req.query);
    const search = req.query.search || '';
    const ecoTypeFilter = req.query.eco_type || '';
    const statusFilter = req.query.status || '';
    const stageFilter = req.query.stage || '';

    const conditions = [];
    const params = [];
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(e.title ILIKE $${params.length} OR p.name ILIKE $${params.length} OR u.name ILIKE $${params.length} OR es.name ILIKE $${params.length})`);
    }
    if (ecoTypeFilter) {
      params.push(ecoTypeFilter);
      conditions.push(`e.eco_type = $${params.length}`);
    }
    if (statusFilter) {
      params.push(statusFilter);
      conditions.push(`e.status = $${params.length}`);
    }
    if (stageFilter) {
      params.push(stageFilter);
      conditions.push(`es.name = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total records
    const countQuery = `SELECT COUNT(*) FROM ecos e
      LEFT JOIN eco_stages es ON e.stage_id = es.id
      LEFT JOIN products p ON e.product_id = p.id
      LEFT JOIN users u ON e.created_by = u.id
      ${whereClause}`;
    const { rows: [{ count }] } = await pool.query(countQuery, params);
    const total = parseInt(count);

    // Fetch paginated data
    const dataParams = [...params, limit, offset];
    const { rows } = await pool.query(
      `SELECT e.*, es.name as stage_name, es.order_index, es.requires_approval,
              p.name as product_name, p.version as product_version,
              u.name as creator_name
       FROM ecos e
       LEFT JOIN eco_stages es ON e.stage_id = es.id
       LEFT JOIN products p ON e.product_id = p.id
       LEFT JOIN users u ON e.created_by = u.id
       ${whereClause}
       ORDER BY e.created_at DESC
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
    console.error('Get ECOs error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getById = async (req, res) => {
  try {
    const eco = await ECOService.getECOWithDiff(req.params.id);
    if (!eco) return res.status(404).json({ error: 'ECO not found' });
    res.json(eco);
  } catch (err) {
    console.error('Get ECO error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getSummary = async (req, res) => {
  try {
    const eco = await ECOService.getECOSummary(req.params.id);
    if (!eco) return res.status(404).json({ error: 'ECO not found' });
    res.json(eco);
  } catch (err) {
    console.error('Get ECO summary error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const create = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // Start transaction context to ensure atomic ECO creation
    const { title, eco_type, product_id, bom_id, effective_date, version_update, changes } = req.body;

    // 1. Fetch the "Approval" stage (order_index = 2) to auto-advance new ECOs
    const { rows: stageRows } = await client.query(
      'SELECT * FROM eco_stages ORDER BY order_index ASC'
    );
    const reviewStage = stageRows.find(s => s.order_index === 2) || stageRows[0];

    const initialStatus = reviewStage.requires_approval ? 'pending_approval' : 'open';

    // 2. Perform insert of the core Engineering Change Order object
    const { rows: [eco] } = await client.query(
      `INSERT INTO ecos (title, eco_type, product_id, bom_id, created_by, effective_date, version_update, stage_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [title, eco_type, product_id, bom_id || null, req.user.id, effective_date || null,
       version_update !== undefined ? version_update : true, reviewStage.id, initialStatus]
    );

    // Insert changes
    if (changes && changes.length > 0) {
      for (const change of changes) {
        await client.query(
          `INSERT INTO eco_changes (eco_id, change_type, field_name, old_value, new_value, component_name)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [eco.id, change.change_type, change.field_name, change.old_value, change.new_value, change.component_name || null]
        );
      }
    }

    await client.query('COMMIT');

    await AuditService.log({
      action: 'eco_created', recordType: 'eco', recordId: eco.id,
      oldValue: null, newValue: { title, eco_type },
      userId: req.user.id, userName: req.user.name
    });

    const fullEco = await ECOService.getECOWithDiff(eco.id);

    res.status(201).json(fullEco);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create ECO error:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

const update = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { title, effective_date, version_update, changes, lastKnownUpdatedAt } = req.body;

    const { rows: [existing] } = await client.query('SELECT * FROM ecos WHERE id = $1', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'ECO not found' });
    if (existing.status === 'applied' || existing.status === 'rejected') return res.status(400).json({ error: 'Cannot edit a finalized ECO' });

    if (lastKnownUpdatedAt) {
      const existingTime = new Date(existing.updated_at).getTime();
      const knownTime = new Date(lastKnownUpdatedAt).getTime();
      if (Math.abs(existingTime - knownTime) > 1000) {
        await client.query('ROLLBACK');
        return res.status(409).json({ error: 'The ECO was modified by another user. Please refresh to see the latest changes.' });
      }
    }

    await client.query(
      `UPDATE ecos SET title = COALESCE($1, title), effective_date = COALESCE($2, effective_date),
       version_update = COALESCE($3, version_update), updated_at = NOW() WHERE id = $4`,
      [title, effective_date, version_update, req.params.id]
    );

    if (changes) {
      await client.query('DELETE FROM eco_changes WHERE eco_id = $1', [req.params.id]);
      for (const change of changes) {
        await client.query(
          `INSERT INTO eco_changes (eco_id, change_type, field_name, old_value, new_value, component_name)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [req.params.id, change.change_type, change.field_name, change.old_value, change.new_value, change.component_name || null]
        );
      }
    }

    await client.query('COMMIT');

    const fullEco = await ECOService.getECOWithDiff(req.params.id);
    res.json(fullEco);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Update ECO error:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

const nextStage = async (req, res) => {
  try {
    const { lastKnownUpdatedAt } = req.body || {};
    const { rows: [eco] } = await pool.query(
      `SELECT e.*, es.order_index, es.name as stage_name
       FROM ecos e JOIN eco_stages es ON e.stage_id = es.id WHERE e.id = $1`,
      [req.params.id]
    );
    if (!eco) return res.status(404).json({ error: 'ECO not found' });
    if (eco.status !== 'open') return res.status(400).json({ error: 'ECO is not open' });

    if (lastKnownUpdatedAt) {
      const existingTime = new Date(eco.updated_at).getTime();
      const knownTime = new Date(lastKnownUpdatedAt).getTime();
      if (Math.abs(existingTime - knownTime) > 1000) {
        return res.status(409).json({ error: 'The ECO was modified by another user. Please refresh to see the latest changes.' });
      }
    }

    const { rows: [nextStageRow] } = await pool.query(
      'SELECT * FROM eco_stages WHERE order_index > $1 ORDER BY order_index ASC LIMIT 1',
      [eco.order_index]
    );
    if (!nextStageRow) return res.status(400).json({ error: 'Already at final stage' });

    const oldStageName = eco.stage_name;

    // Optional Check: If the desired target stage is 'Done', fully apply the ECO logic 
    // against BOMs/Products rather than just shuffling statuses around
    if (nextStageRow.name === 'Done') {
      const result = await ECOService.applyECO(req.params.id, req.user.id, req.user.name);
      return res.json(result);
    }

    // Not 'Done': Move to the next stage workflow step
    const nextStatus = nextStageRow.requires_approval ? 'pending_approval' : 'open';
    await pool.query(
      'UPDATE ecos SET stage_id = $1, status = $2, updated_at = NOW() WHERE id = $3',
      [nextStageRow.id, nextStatus, req.params.id]
    );

    await AuditService.log({
      action: 'stage_moved', recordType: 'eco', recordId: req.params.id,
      oldValue: { stage: oldStageName },
      newValue: { stage: nextStageRow.name },
      userId: req.user.id, userName: req.user.name
    });

    const fullEco = await ECOService.getECOWithDiff(req.params.id);
    res.json(fullEco);
  } catch (err) {
    console.error('Next stage error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
};

const patchStage = async (req, res) => {
  try {
    const { stageId, lastKnownUpdatedAt } = req.body;
    if (!stageId) return res.status(400).json({ error: 'stageId is required' });

    const { rows: [eco] } = await pool.query('SELECT * FROM ecos WHERE id = $1', [req.params.id]);
    if (!eco) return res.status(404).json({ error: 'ECO not found' });
    if (eco.status !== 'open') return res.status(400).json({ error: 'ECO is not open' });

    if (lastKnownUpdatedAt) {
      const existingTime = new Date(eco.updated_at).getTime();
      const knownTime = new Date(lastKnownUpdatedAt).getTime();
      if (Math.abs(existingTime - knownTime) > 1000) {
        return res.status(409).json({ error: 'The ECO was modified by another user. Please refresh to see the latest changes.' });
      }
    }

    const { rows: [newStage] } = await pool.query('SELECT * FROM eco_stages WHERE id = $1', [stageId]);
    if (!newStage) return res.status(404).json({ error: 'Stage not found' });

    // Move to the requested stage
    const patchStatus = newStage.requires_approval ? 'pending_approval' : 'open';
    await pool.query(
      'UPDATE ecos SET stage_id = $1, status = $2, updated_at = NOW() WHERE id = $3',
      [newStage.id, patchStatus, req.params.id]
    );

    await AuditService.log({
      action: 'stage_moved', recordType: 'eco', recordId: req.params.id,
      oldValue: { stage_id: eco.stage_id },
      newValue: { stage: newStage.name, stage_id: newStage.id },
      userId: req.user.id, userName: req.user.name
    });

    res.json({ success: true, stage_id: newStage.id, stage_name: newStage.name });
  } catch (err) {
    console.error('Patch stage error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Look up dynamic dependencies (impact analysis)
const getImpacts = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Get the ECO and the product it affects
    const { rows: [eco] } = await pool.query(
      `SELECT e.eco_type, p.name as product_name
       FROM ecos e
       LEFT JOIN products p ON e.product_id = p.id
       WHERE e.id = $1`,
      [id]
    );

    if (!eco) return res.status(404).json({ error: 'ECO not found' });
    if (!eco.product_name) return res.json([]); // No product linked, so no upstream BOMs to find

    // 2. Query bom_components to see if this product name is used as a component
    // and join with products to get the parent product details.
    const { rows: impacts } = await pool.query(
      `SELECT DISTINCT p.id, p.name as parent_product_name, p.version as product_version,
             b.version as bom_version, b.status as bom_status
       FROM bom_components bc
       JOIN bom b ON bc.bom_id = b.id
       JOIN products p ON b.product_id = p.id
       WHERE bc.component_name = $1 AND b.status = 'active'`,
      [eco.product_name]
    );

    res.json(impacts);
  } catch (err) {
    console.error('Get impacts error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getAll, getById, getSummary, create, update, nextStage, patchStage, getImpacts };
