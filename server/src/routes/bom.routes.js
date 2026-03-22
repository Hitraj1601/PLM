const express = require('express');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { getAll, getById, create, update } = require('../controllers/bom.controller');
const router = express.Router();

// Read endpoints: Allowed for any authenticated user
router.get('/', auth, getAll);
router.get('/:id', auth, getById);

// Write endpoints: Restricted only to users with 'engineering' or 'admin' roles
// Engineers construct and change BoMs mapping components to products
router.post('/', auth, roleGuard('engineering', 'admin'), create);
router.put('/:id', auth, roleGuard('engineering', 'admin'), update);

module.exports = router;
