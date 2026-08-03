const ApprovalService = require('../services/ApprovalService');

/**
 * Controller for handling ECO approvals.
 * Expects the ECO ID in req.params.id and user details in req.user.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const approve = async (req, res) => {
  try {
    const result = await ApprovalService.approve(
      req.params.id, req.user.id, req.user.name, req.body.lastKnownUpdatedAt
    );
    req.app.get('io')?.emit('eco_event', { type: 'approved', eco: result });
    res.json(result);
  } catch (err) {
    console.error('Approve error:', err);
    const code = err.message && err.message.includes('modified by another') ? 409 : 400;
    res.status(code).json({ error: err.message || 'Approval failed' });
  }
};

const reject = async (req, res) => {
  try {
    const result = await ApprovalService.reject(
      req.params.id, req.user.id, req.user.name, req.body.reason
    );
    req.app.get('io')?.emit('eco_event', { type: 'rejected', eco: result });
    res.json(result);
  } catch (err) {
    console.error('Reject error:', err);
    const code = err.message && err.message.includes('modified by another') ? 409 : 400;
    res.status(code).json({ error: err.message || 'Rejection failed' });
  }
};

module.exports = { approve, reject };
