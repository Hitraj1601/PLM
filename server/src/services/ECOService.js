const pool = require('../config/db');
const VersionService = require('./VersionService');
const AuditService = require('./AuditService');

class ECOService {
  static async applyECO(ecoId, userId, userName) {
    // Acquire a specific DB client for managing an atomic transaction across tables
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Fetch ECO ensuring it exists and hasn't been redundantly applied already
      const { rows: [eco] } = await client.query(
        'SELECT * FROM ecos WHERE id = $1', [ecoId]
      );
      if (!eco) throw new Error('ECO not found');
      if (eco.status === 'applied') throw new Error('ECO already applied');

      // 2. Fetch the specific granular changes requested by this ECO
      const { rows: changes } = await client.query(
        'SELECT * FROM eco_changes WHERE eco_id = $1', [ecoId]
      );

      // 3. Obtain the reference to the designated final workflow stage 'Done'
      const { rows: [doneStage] } = await client.query(
        "SELECT id FROM eco_stages WHERE name = 'Done' OR order_index = (SELECT MAX(order_index) FROM eco_stages) LIMIT 1"
      );

      // 4. Branch logic based on whether the ECO demands a new version or an in-place edit
      const isArchiving = changes.some(c => c.field_name === 'status' && c.new_value === 'archived');

      if (eco.version_update && !isArchiving) {
        if (eco.eco_type === 'product') {
          const { oldProduct, newProduct } = await VersionService.cloneProduct(eco.product_id, changes);
          await AuditService.log({
            action: 'version_created', recordType: 'product', recordId: newProduct.id,
            oldValue: null, newValue: { name: newProduct.name, version: newProduct.version },
            userId, userName
          });
          await AuditService.log({
            action: 'version_archived', recordType: 'product', recordId: oldProduct.id,
            oldValue: { status: 'active' }, newValue: { status: 'archived' },
            userId, userName
          });
        } else if (eco.eco_type === 'bom') {
          const { oldBom, newBom } = await VersionService.cloneBOM(eco.bom_id, changes);
          await AuditService.log({
            action: 'version_created', recordType: 'bom', recordId: newBom.id,
            oldValue: null, newValue: { version: newBom.version },
            userId, userName
          });
          await AuditService.log({
            action: 'version_archived', recordType: 'bom', recordId: oldBom.id,
            oldValue: { status: 'active' }, newValue: { status: 'archived' },
            userId, userName
          });
        }
      } else {
        // 5. In-place Update Route: Patch existing record directly without incrementing version
        if (eco.eco_type === 'product') {
          for (const change of changes) {
            if (change.field_name === 'sale_price' || change.field_name === 'cost_price') {
              await client.query(
                `UPDATE products SET ${change.field_name} = $1, updated_at = NOW() WHERE id = $2`,
                [parseFloat(change.new_value), eco.product_id]
              );
            } else if (change.field_name === 'name') {
              await client.query(
                `UPDATE products SET name = $1, updated_at = NOW() WHERE id = $2`,
                [change.new_value, eco.product_id]
              );
            } else if (change.field_name === 'status' && change.new_value === 'archived') {
              await client.query(
                `UPDATE products SET status = 'archived', updated_at = NOW() WHERE id = $1`,
                [eco.product_id]
              );
              await AuditService.log({
                action: 'product_archived', recordType: 'product', recordId: eco.product_id,
                oldValue: { status: 'active' }, newValue: { status: 'archived' },
                userId, userName
              });
            }
          }
        } else if (eco.eco_type === 'bom') {
          for (const change of changes) {
            if (change.field_name === 'status' && change.new_value === 'archived') {
              await client.query(
                `UPDATE bom SET status = 'archived', updated_at = NOW() WHERE id = $1`,
                [eco.bom_id]
              );
              await AuditService.log({
                action: 'bom_archived', recordType: 'bom', recordId: eco.bom_id,
                oldValue: { status: 'active' }, newValue: { status: 'archived' },
                userId, userName
              });
            }
          }
        }
      }

      // 6. Set ECO execution status as completed and move its stage explicitly to Done
      await client.query(
        `UPDATE ecos SET status = 'applied', stage_id = $1, updated_at = NOW() WHERE id = $2`,
        [doneStage.id, ecoId]
      );

      // 7. Push a generalized log that this ECO was successfully executed
      await AuditService.log({
        action: 'eco_applied', recordType: 'eco', recordId: ecoId,
        oldValue: { status: 'open' }, newValue: { status: 'applied' },
        userId, userName
      });

      await client.query('COMMIT');

      // Return updated ECO
      const { rows: [updatedEco] } = await pool.query(
        `SELECT e.*, es.name as stage_name, es.order_index, p.name as product_name, u.name as creator_name
         FROM ecos e
         LEFT JOIN eco_stages es ON e.stage_id = es.id
         LEFT JOIN products p ON e.product_id = p.id
         LEFT JOIN users u ON e.created_by = u.id
         WHERE e.id = $1`,
        [ecoId]
      );
      return updatedEco;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  static async getECOWithDiff(ecoId) {
    const { rows: [eco] } = await pool.query(
      `SELECT e.*, es.name as stage_name, es.order_index, es.requires_approval,
              p.name as product_name, p.version as product_version,
              p.sale_price, p.cost_price,
              u.name as creator_name
       FROM ecos e
       LEFT JOIN eco_stages es ON e.stage_id = es.id
       LEFT JOIN products p ON e.product_id = p.id
       LEFT JOIN users u ON e.created_by = u.id
       WHERE e.id = $1`,
      [ecoId]
    );
    if (!eco) return null;

    const { rows: changes } = await pool.query(
      'SELECT * FROM eco_changes WHERE eco_id = $1', [ecoId]
    );

    const { rows: stages } = await pool.query(
      'SELECT * FROM eco_stages ORDER BY order_index ASC'
    );

    const auditLogs = await AuditService.getLogsForECO(ecoId);

    // 5. If this ECO modifies a BoM structure specifically, deeply fetch current nested 
    // components and routing operations for full comparison in frontend screens
    let bomData = null;
    if (eco.bom_id) {
      const { rows: components } = await pool.query(
        'SELECT * FROM bom_components WHERE bom_id = $1', [eco.bom_id]
      );
      const { rows: operations } = await pool.query(
        'SELECT * FROM bom_operations WHERE bom_id = $1', [eco.bom_id]
      );
      bomData = { components, operations };
    }

    // Combine into monolithic nested JSON response
    return { ...eco, changes, stages, auditLogs, bomData };
  }

  static async getECOSummary(ecoId) {
    const { rows: [eco] } = await pool.query(
      `SELECT e.*, es.name as stage_name, es.order_index, es.requires_approval,
              p.name as product_name, p.version as product_version,
              p.sale_price, p.cost_price,
              u.name as creator_name
       FROM ecos e
       LEFT JOIN eco_stages es ON e.stage_id = es.id
       LEFT JOIN products p ON e.product_id = p.id
       LEFT JOIN users u ON e.created_by = u.id
       WHERE e.id = $1`,
      [ecoId]
    );
    if (!eco) return null;

    const { rows: stages } = await pool.query(
      'SELECT * FROM eco_stages ORDER BY order_index ASC'
    );

    return { ...eco, stages };
  }

  static async validateECO(eco) {
    const errors = [];
    if (!eco.title) errors.push('Title is required');
    if (!eco.eco_type) errors.push('ECO type is required');
    if (!eco.product_id) errors.push('Product is required');
    if (eco.eco_type === 'bom' && !eco.bom_id) errors.push('BoM is required for BoM-type ECO');
    return errors;
  }
}

module.exports = ECOService;
