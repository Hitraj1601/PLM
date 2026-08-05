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

export function compareTwoBOMs(baseBOM, targetBOM) {
  const parseList = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  };

  const baseComps = parseList(baseBOM?.components);
  const targetComps = parseList(targetBOM?.components);

  const baseOps = parseList(baseBOM?.operations);
  const targetOps = parseList(targetBOM?.operations);

  const compDiff = [];
  const baseCompMap = new Map();
  baseComps.forEach((comp) => {
    const name = comp.component_name || comp.name || '';
    if (name) baseCompMap.set(name, comp);
  });

  const targetCompMap = new Map();
  targetComps.forEach((comp) => {
    const name = comp.component_name || comp.name || '';
    if (name) targetCompMap.set(name, comp);
  });

  let addedCount = 0;
  let removedCount = 0;
  let modifiedCount = 0;
  let unchangedCount = 0;
  let partsDelta = 0;

  baseCompMap.forEach((baseComp, name) => {
    const targetComp = targetCompMap.get(name);
    const oldQty = parseFloat(baseComp.quantity) || 0;
    const unit = baseComp.unit || targetComp?.unit || 'pcs';

    if (!targetComp) {
      compDiff.push({
        component: name,
        oldQty,
        newQty: null,
        unit,
        type: 'removed',
        delta: -oldQty,
      });
      removedCount++;
      partsDelta -= oldQty;
    } else {
      const newQty = parseFloat(targetComp.quantity) || 0;
      const delta = newQty - oldQty;

      if (delta === 0 && baseComp.unit === targetComp.unit) {
        compDiff.push({
          component: name,
          oldQty,
          newQty,
          unit,
          type: 'unchanged',
          delta: 0,
        });
        unchangedCount++;
      } else {
        compDiff.push({
          component: name,
          oldQty,
          newQty,
          unit,
          type: 'modified',
          delta,
        });
        modifiedCount++;
        partsDelta += delta;
      }
    }
  });

  targetCompMap.forEach((targetComp, name) => {
    if (!baseCompMap.has(name)) {
      const newQty = parseFloat(targetComp.quantity) || 0;
      const unit = targetComp.unit || 'pcs';
      compDiff.push({
        component: name,
        oldQty: null,
        newQty,
        unit,
        type: 'added',
        delta: newQty,
      });
      addedCount++;
      partsDelta += newQty;
    }
  });

  const opDiff = [];
  const baseOpMap = new Map();
  baseOps.forEach((op) => {
    if (op.name) baseOpMap.set(op.name, op);
  });

  const targetOpMap = new Map();
  targetOps.forEach((op) => {
    if (op.name) targetOpMap.set(op.name, op);
  });

  baseOpMap.forEach((baseOp, name) => {
    const targetOp = targetOpMap.get(name);
    const oldDur = parseInt(baseOp.duration_mins || 0);
    const oldWc = baseOp.work_center || '';

    if (!targetOp) {
      opDiff.push({
        name,
        oldDuration: oldDur,
        newDuration: null,
        oldWorkCenter: oldWc,
        newWorkCenter: '',
        type: 'removed',
      });
    } else {
      const newDur = parseInt(targetOp.duration_mins || 0);
      const newWc = targetOp.work_center || '';

      if (oldDur === newDur && oldWc === newWc) {
        opDiff.push({
          name,
          oldDuration: oldDur,
          newDuration: newDur,
          oldWorkCenter: oldWc,
          newWorkCenter: newWc,
          type: 'unchanged',
        });
      } else {
        opDiff.push({
          name,
          oldDuration: oldDur,
          newDuration: newDur,
          oldWorkCenter: oldWc,
          newWorkCenter: newWc,
          type: 'modified',
        });
      }
    }
  });

  targetOpMap.forEach((targetOp, name) => {
    if (!baseOpMap.has(name)) {
      opDiff.push({
        name,
        oldDuration: null,
        newDuration: parseInt(targetOp.duration_mins || 0),
        oldWorkCenter: '',
        newWorkCenter: targetOp.work_center || '',
        type: 'added',
      });
    }
  });

  return {
    componentDiff: compDiff,
    operationDiff: opDiff,
    summary: {
      addedCount,
      removedCount,
      modifiedCount,
      unchangedCount,
      totalChanges: addedCount + removedCount + modifiedCount,
      partsDelta,
    },
  };
}

