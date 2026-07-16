export function computeComponentDiff(oldComponents, changes) {
  const diff = [];

  const qtyChanges = {};
  const removedComponents = new Set();
  const addedComponents = [];

  for (const change of changes) {
    if (change.change_type === 'component_qty') {
      qtyChanges[change.component_name] = {
        oldQty: parseFloat(change.old_value),
        newQty: parseFloat(change.new_value),
      };
    } else if (change.change_type === 'component_remove') {
      removedComponents.add(change.component_name);
    } else if (change.change_type === 'component_add') {
      const parts = (change.new_value || '').split(' - ');
      const name = change.component_name;
      let qty = 1;
      let unit = 'pcs';
      if (parts[1]) {
        const qtyParts = parts[1].trim().split(' ');
        qty = parseFloat(qtyParts[0]) || 1;
        unit = qtyParts[1] || 'pcs';
      }
      addedComponents.push({ name, qty, unit });
    }
  }

  // Process existing components
  if (oldComponents) {
    for (const comp of oldComponents) {
      if (removedComponents.has(comp.component_name)) {
        diff.push({
          component: comp.component_name,
          oldQty: parseFloat(comp.quantity),
          newQty: null,
          unit: comp.unit,
          type: 'removed',
          delta: -parseFloat(comp.quantity),
        });
      } else if (qtyChanges[comp.component_name]) {
        const change = qtyChanges[comp.component_name];
        diff.push({
          component: comp.component_name,
          oldQty: change.oldQty,
          newQty: change.newQty,
          unit: comp.unit,
          type: 'modified',
          delta: change.newQty - change.oldQty,
        });
      } else {
        diff.push({
          component: comp.component_name,
          oldQty: parseFloat(comp.quantity),
          newQty: parseFloat(comp.quantity),
          unit: comp.unit,
          type: 'unchanged',
          delta: 0,
        });
      }
    }
  }

  // Process added components
  for (const comp of addedComponents) {
    diff.push({
      component: comp.name,
      oldQty: null,
      newQty: comp.qty,
      unit: comp.unit,
      type: 'added',
      delta: comp.qty,
    });
  }

  return diff;
}

export function computeOperationDiff(oldOperations, changes) {
  const diff = [];
  const removedOps = new Set();
  const addedOps = [];

  for (const change of changes) {
    if (change.change_type === 'operation_remove') {
      removedOps.add(change.component_name);
    } else if (change.change_type === 'operation_add') {
      const parts = (change.new_value || '').split(' - ');
      const name = change.component_name;
      let duration = 0;
      let workCenter = '';
      if (parts[1]) {
        const match = parts[1].match(/(\d+)\s*mins?\s*@?\s*(.*)/);
        if (match) {
          duration = parseInt(match[1]);
          workCenter = match[2]?.trim() || '';
        }
      }
      addedOps.push({ name, duration, workCenter });
    }
  }

  if (oldOperations) {
    for (const op of oldOperations) {
      if (removedOps.has(op.name)) {
        diff.push({ ...op, type: 'removed' });
      } else {
        diff.push({ ...op, type: 'unchanged' });
      }
    }
  }

  for (const op of addedOps) {
    diff.push({
      name: op.name,
      duration_mins: op.duration,
      work_center: op.workCenter,
      type: 'added',
    });
  }

  return diff;
}

export function computeProductDiff(product, changes) {
  const before = {
    sale_price: product?.sale_price,
    cost_price: product?.cost_price,
    name: product?.name,
  };

  const after = { ...before };

  for (const change of changes) {
    if (change.field_name === 'sale_price') after.sale_price = parseFloat(change.new_value);
    if (change.field_name === 'cost_price') after.cost_price = parseFloat(change.new_value);
    if (change.field_name === 'name') after.name = change.new_value;
  }

  return { before, after };
}
