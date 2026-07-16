const pool = require('../config/db');
const ECOService = require('./ECOService');
const AuditService = require('./AuditService');

/**
 * Service class for handling Engineering Change Order (ECO) approvals and rejections.
 */
class ApprovalService {
  /**
   * Retrieves the next stage in the ECO approval workflow based on the current stage ID.
   * @param {number|string} currentStageId - The ID of the current stage.
   * @returns {Promise<Object|null>} The next stage object, or null if there is no next stage.
   */
  static async getNextStage(currentStageId) {
    // 1. Fetch the current stage using its ID to find its order_index
    const { rows: [current] } = await pool.query(
      'SELECT * FROM eco_stages WHERE id = $1', [currentStageId]
    );
    // If the stage ID is invalid, abort the operation
    if (!current) throw new Error('Current stage not found');

    // 2. Fetch the next stage by finding the stage with the lowest order_index
    // that is still strictly greater than the current stage's order_index
    const { rows: [next] } = await pool.query(
      'SELECT * FROM eco_stages WHERE order_index > $1 ORDER BY order_index ASC LIMIT 1',
      [current.order_index]
    );
    // Return the next stage if found, otherwise return null (meaning it's the final stage)
    return next || null;
  }

  /**
   * Approves an ECO and advances it to the next stage, or finalizes it if it's the last stage.
   * @param {number|string} ecoId - The ID of the ECO to approve.
   * @param {number|string} approverId - The ID of the user approving the ECO.
   * @param {string} approverName - The name of the user approving the ECO.
   * @returns {Promise<Object>} The updated ECO record.
   * @throws {Error} If the ECO is not found, not open, or does not require approval.
   */
  static async approve(ecoId, approverId, approverName) {
    // 1. Fetch the ECO and join with its current stage to check if it requires approval
    const { rows: [eco] } = await pool.query(
      `SELECT e.*, es.requires_approval, es.name as stage_name
       FROM ecos e
       JOIN eco_stages es ON e.stage_id = es.id
       WHERE e.id = $1`,
      [ecoId]
    );
    
    // 2. Validate the state of the ECO before proceeding
    if (!eco) throw new Error('ECO not found');
    if (eco.status !== 'open' && eco.status !== 'pending_approval') throw new Error('ECO is not open for approval');
    if (!eco.requires_approval) throw new Error('Current stage does not require approval');

    // 3. Determine what the next stage should be
    const nextStage = await this.getNextStage(eco.stage_id);

    // 4. Log the approval action in the audit trail
    // Record the transition from the current stage to the next (or 'Done' if completing)
    await AuditService.log({
      action: 'eco_approved',
      recordType: 'eco',
      recordId: ecoId,
      oldValue: { stage: eco.stage_name },
      newValue: { stage: nextStage ? nextStage.name : 'Done' },
      userId: approverId,
      userName: approverName
    });

    // 5. Apply transitions based on whether a next stage exists
    if (!nextStage || nextStage.name === 'Done') {
      // Final stage reached: apply the ECO changes to the actual BOM/product
      return await ECOService.applyECO(ecoId, approverId, approverName);
    } else {
      // Not the final stage: update the ECO to the new stage ID
      const nextStatus = nextStage.requires_approval ? 'pending_approval' : 'open';
      await pool.query(
        'UPDATE ecos SET stage_id = $1, status = $2, updated_at = NOW() WHERE id = $3',
        [nextStage.id, nextStatus, ecoId]
      );
      
      // 6. Fetch the newly updated ECO to return to the caller, including relations
      const { rows: [updated] } = await pool.query(
        `SELECT e.*, es.name as stage_name, es.order_index, p.name as product_name, u.name as creator_name
         FROM ecos e
         LEFT JOIN eco_stages es ON e.stage_id = es.id
         LEFT JOIN products p ON e.product_id = p.id
         LEFT JOIN users u ON e.created_by = u.id
         WHERE e.id = $1`,
        [ecoId]
      );
      return updated;
    }
  }

  /**
   * Rejects an ECO and sets its status to 'rejected'.
   * @param {number|string} ecoId - The ID of the ECO to reject.
   * @param {number|string} approverId - The ID of the user rejecting the ECO.
   * @param {string} approverName - The name of the user rejecting the ECO.
   * @returns {Promise<Object>} The updated ECO record.
   * @throws {Error} If the ECO is not found or not open.
   */
  static async reject(ecoId, approverId, approverName) {
    // 1. Fetch the ECO and join with its current stage to get the stage name for logging
    const { rows: [eco] } = await pool.query(
      `SELECT e.*, es.name as stage_name FROM ecos e
       JOIN eco_stages es ON e.stage_id = es.id
       WHERE e.id = $1`,
      [ecoId]
    );

    // 2. Validate the ECO exists and is still active
    if (!eco) throw new Error('ECO not found');
    if (eco.status !== 'open' && eco.status !== 'pending_approval') throw new Error('ECO is not open');

    // 3. Update the ECO status to 'rejected'
    await pool.query(
      "UPDATE ecos SET status = 'rejected', updated_at = NOW() WHERE id = $1",
      [ecoId]
    );

    // 4. Log the rejection action in the audit trail
    await AuditService.log({
      action: 'eco_rejected',
      recordType: 'eco',
      recordId: ecoId,
      oldValue: { status: 'open', stage: eco.stage_name },
      newValue: { status: 'rejected' },
      userId: approverId,
      userName: approverName
    });

    // 5. Fetch and return the updated ECO record
    const { rows: [updated] } = await pool.query(
      `SELECT e.*, es.name as stage_name, es.order_index, p.name as product_name, u.name as creator_name
       FROM ecos e
       LEFT JOIN eco_stages es ON e.stage_id = es.id
       LEFT JOIN products p ON e.product_id = p.id
       LEFT JOIN users u ON e.created_by = u.id
       WHERE e.id = $1`,
      [ecoId]
    );
    return updated;
  }
}

module.exports = ApprovalService;
