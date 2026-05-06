const express = require('express');
const router = express.Router();
const { handleClerkWebhook } = require('../controllers/webhookController');

// Clerk sends webhooks as raw JSON
router.post('/clerk', express.raw({ type: 'application/json' }), handleClerkWebhook);

module.exports = router;
