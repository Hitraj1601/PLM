const express = require('express');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { getAll, getById, create, update, remove } = require('../controllers/product.controller');
const router = express.Router();

// Read operations available to all authenticated stakeholders
router.get('/', auth, getAll);
router.get('/:id', auth, getById);

// Creation and modification are limited to engineers and admins
router.post('/', auth, roleGuard('engineering', 'admin'), create);
router.put('/:id', auth, roleGuard('engineering', 'admin'), update);

// Destruction of products is strictly an admin-level privilege
router.delete('/:id', auth, roleGuard('admin'), remove);

module.exports = router;
