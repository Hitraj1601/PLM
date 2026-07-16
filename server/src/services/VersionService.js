const pool = require('../config/db');

class VersionService {
  static async cloneProduct(productId, changes) {
    // Acquire a specific DB client to manage transaction safety
    const client = await pool.connect();
    try {
      await client.query('BEGIN'); // Start atomic version increment transaction

      // 1. Retrieve the existing base product record intended to be superseded
      const { rows: [original] } = await client.query(
        'SELECT * FROM products WHERE id = $1', [productId]
      );
      if (!original) throw new Error('Product not found');

      // 2. Compute the new semantic version (e.g., 'v1' -> 'v2')
      const currentVersion = parseInt(original.version.replace('v', ''));
      const newVersion = `v${currentVersion + 1}`;

      // 3. Base the updated data off the original's values
      let newName = original.name;
      let newSalePrice = original.sale_price;
      let newCostPrice = original.cost_price;
      let newAttachments = original.attachments;

      // 4. Overwrite fields specifically dictated by the ECO payload
      for (const change of changes) {
        if (change.field_name === 'sale_price') newSalePrice = parseFloat(change.new_value);
        if (change.field_name === 'cost_price') newCostPrice = parseFloat(change.new_value);
        if (change.field_name === 'name') newName = change.new_value;
        if (change.field_name === 'attachments') {
          newAttachments = JSON.parse(change.new_value);
        }
      }

      // 5. Lock down the legacy product iteration by marking it 'archived'
      await client.query(
        "UPDATE products SET status = 'archived', updated_at = NOW() WHERE id = $1",
        [productId]
      );

      // 6. Spin up the freshly computed new generation set to 'active'
      const { rows: [newProduct] } = await client.query(
        `INSERT INTO products (name, version, sale_price, cost_price, status, attachments)
         VALUES ($1, $2, $3, $4, 'active', $5) RETURNING *`,
        [newName, newVersion, newSalePrice, newCostPrice, JSON.stringify(newAttachments)]
      );

      await client.query('COMMIT');
      return { oldProduct: original, newProduct };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  static async cloneBOM(bomId, changes) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows: [originalBom] } = await client.query(
        'SELECT * FROM bom WHERE id = $1', [bomId]
      );
      if (!originalBom) throw new Error('BoM not found');

      const currentVersion = parseInt(originalBom.version.replace('v', ''));
      const newVersion = `v${currentVersion + 1}`;

      let newName = originalBom.name;
      for (const change of changes) {
        if (change.field_name === 'name') newName = change.new_value;
      }

      // 3. Retire old BOM from active querying scope
      await client.query(
        "UPDATE bom SET status = 'archived' WHERE id = $1", [bomId]
      );

      // 4. Deploy the next-gen BOM tracking schema mapped to same product ID
      const { rows: [newBom] } = await client.query(
        `INSERT INTO bom (product_id, name, version, status)
         VALUES ($1, $2, $3, 'active') RETURNING *`,
        [originalBom.product_id, newName || '', newVersion]
      );

      // 5. Gather existing tracking data from the database to map changes onto
      const { rows: existingComponents } = await client.query(
        'SELECT * FROM bom_components WHERE bom_id = $1', [bomId]
      );

      const componentsToRemove = new Set();
      const componentsToAdd = [];
      const qtyChanges = {};

      // Parse and aggregate individual ECO directives into actionable collections
      for (const change of changes) {
        if (change.change_type === 'component_remove') {
          componentsToRemove.add(change.component_name);
        } else if (change.change_type === 'component_add') {
          const parts = (change.new_value || '').split(' - ');
          const name = change.component_name || parts[0];
          let qty = 1, unit = 'pcs';
          if (parts[1]) {
            const qtyParts = parts[1].trim().split(' ');
            qty = parseFloat(qtyParts[0]) || 1;
            unit = qtyParts[1] || 'pcs';
          }
          componentsToAdd.push({ name, qty, unit });
        } else if (change.change_type === 'component_qty') {
          qtyChanges[change.component_name] = parseFloat(change.new_value);
        }
      }

      // 6. Carry-over logic: Re-insert components dynamically reflecting modifications or removals
      for (const comp of existingComponents) {
        if (componentsToRemove.has(comp.component_name)) continue; // Drop deleted elements
        
        // Use updated qty if available, otherwise clone the legacy qty
        const qty = qtyChanges[comp.component_name] !== undefined
          ? qtyChanges[comp.component_name]
          : comp.quantity;
          
        await client.query(
          `INSERT INTO bom_components (bom_id, component_name, quantity, unit)
           VALUES ($1, $2, $3, $4)`,
          [newBom.id, comp.component_name, qty, comp.unit]
        );
      }

      // Add new components
      for (const comp of componentsToAdd) {
        await client.query(
          `INSERT INTO bom_components (bom_id, component_name, quantity, unit)
           VALUES ($1, $2, $3, $4)`,
          [newBom.id, comp.name, comp.qty, comp.unit]
        );
      }

      // Clone operations
      const { rows: existingOps } = await client.query(
        'SELECT * FROM bom_operations WHERE bom_id = $1', [bomId]
      );

      const opsToRemove = new Set();
      const opsToAdd = [];

      for (const change of changes) {
        if (change.change_type === 'operation_remove') {
          opsToRemove.add(change.component_name);
        } else if (change.change_type === 'operation_add') {
          const parts = (change.new_value || '').split(' - ');
          const name = change.component_name || parts[0];
          let duration = 0, workCenter = '';
          if (parts[1]) {
            const match = parts[1].match(/(\d+)\s*mins?\s*@?\s*(.*)/);
            if (match) {
              duration = parseInt(match[1]);
              workCenter = match[2]?.trim() || '';
            }
          }
          opsToAdd.push({ name, duration, workCenter });
        }
      }

      for (const op of existingOps) {
        if (opsToRemove.has(op.name)) continue;
        await client.query(
          `INSERT INTO bom_operations (bom_id, name, duration_mins, work_center)
           VALUES ($1, $2, $3, $4)`,
          [newBom.id, op.name, op.duration_mins, op.work_center]
        );
      }

      for (const op of opsToAdd) {
        await client.query(
          `INSERT INTO bom_operations (bom_id, name, duration_mins, work_center)
           VALUES ($1, $2, $3, $4)`,
          [newBom.id, op.name, op.duration, op.workCenter]
        );
      }

      await client.query('COMMIT');
      return { oldBom: originalBom, newBom };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = VersionService;
