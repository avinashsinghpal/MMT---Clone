const express = require('express');
const router = express.Router();
const { clerkWebhook } = require('../controllers/webhook.controller');

// Clerk sends webhooks as raw body, so we need express.raw
router.post(
  '/clerk',
  express.raw({ type: 'application/json' }),
  clerkWebhook
);

module.exports = router;
