const { Webhook } = require('svix');
const User = require('../models/User');

const handleClerkWebhook = async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
    return res.status(500).json({ error: 'Webhook secret missing' });
  }

  // Get the headers
  const headers = req.headers;
  const svix_id = headers['svix-id'];
  const svix_timestamp = headers['svix-timestamp'];
  const svix_signature = headers['svix-signature'];

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Missing svix headers' });
  }

  // Get the body
  const payload = req.body;
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // Handle the webhooks
  const eventType = evt.type;
  console.log(`Webhook received: ${eventType}`);

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, public_metadata } = evt.data;
    const email = email_addresses[0]?.email_address;

    try {
      await User.upsert({
        id,
        email,
        firstName: first_name,
        lastName: last_name,
        role: public_metadata?.role || 'user'
      });
      console.log(`User ${id} synchronized successfully.`);
    } catch (err) {
      console.error('Database Sync Error:', err.message);
      return res.status(500).json({ error: 'Internal Server Error during sync' });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    try {
      await User.destroy({ where: { id } });
      console.log(`User ${id} deleted successfully.`);
    } catch (err) {
      console.error('Database Delete Error:', err.message);
    }
  }

  return res.status(200).json({ success: true });
};

module.exports = {
  handleClerkWebhook
};
