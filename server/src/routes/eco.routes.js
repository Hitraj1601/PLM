const express = require('express');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { getAll, getById, getSummary, create, update, nextStage, patchStage, getImpacts } = require('../controllers/eco.controller');
const router = express.Router();

// Read endpoints: Retrieve ECO lists or single ECOs, available to all authenticated users
router.get('/', auth, getAll);
router.get('/:id/summary', auth, getSummary);
router.get('/:id', auth, getById);
router.get('/:id/impacts', auth, getImpacts); // Fetch impact relations

// Write/Execution endpoints: Restricted to engineering or admins
router.post('/', auth, roleGuard('engineering', 'admin'), create);  // Create new Engineering Change Order
router.put('/:id', auth, roleGuard('engineering', 'admin'), update); // Edit an open ECO details
router.post('/:id/next-stage', auth, roleGuard('engineering', 'admin'), nextStage); // Manually push an ECO to next workflow phase (if not requiring standalone approval)
router.patch('/:id/stage', auth, roleGuard('engineering', 'admin'), patchStage); // Optimistic kanban update

module.exports = router;
