const express = require('express');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { approve, reject } = require('../controllers/approval.controller');
const router = express.Router();

// Map HTTP POST methods for ECO approvals and rejections
// Routes require a valid JWT token via the 'auth' middleware
// Routes are restricted solely to users with 'approver' or 'admin' roles
router.post('/:id/approve', auth, roleGuard('approver', 'admin'), approve);
router.post('/:id/reject', auth, roleGuard('approver', 'admin'), reject);

module.exports = router;
