const express = require('express');
const router = express.Router();
const { requireAuth, attachUser } = require('../middleware/authMiddleware');
const { getProtectedData } = require('../controllers/protectedController');

// GET /api/protected
// Protected route using Clerk
router.get('/', requireAuth, attachUser, getProtectedData);

module.exports = router;
