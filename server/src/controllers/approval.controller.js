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
    // Call the ApprovalService to process the approval for the given ECO ID
    // We pass req.params.id (the ECO identifier from the URL)
    // and req.user.id/req.user.name (extracted from the JWT token in auth middleware)
    const result = await ApprovalService.approve(
      req.params.id, req.user.id, req.user.name, req.body.lastKnownUpdatedAt
    );
    // Send the updated ECO record back to the client as JSON
    res.json(result);
  } catch (err) {
    // Log the error to the server console for debugging
    console.error('Approve error:', err);
    // Respond with a status and include the error message
    const code = err.message && err.message.includes('modified by another') ? 409 : 400;
    res.status(code).json({ error: err.message || 'Approval failed' });
  }
};

/**
 * Controller for handling ECO rejections.
 * Expects the ECO ID in req.params.id and user details in req.user.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const reject = async (req, res) => {
  try {
    // Call the ApprovalService to process the rejection for the given ECO
    const result = await ApprovalService.reject(
      req.params.id, req.user.id, req.user.name, req.body.lastKnownUpdatedAt
    );
    // Send the updated ECO record back pointing to the new state
    res.json(result);
  } catch (err) {
    // Log the error for diagnosing server-side issues
    console.error('Reject error:', err);
    // Return the failure message to the client
    const code = err.message && err.message.includes('modified by another') ? 409 : 400;
    res.status(code).json({ error: err.message || 'Rejection failed' });
  }
};

module.exports = { approve, reject };
