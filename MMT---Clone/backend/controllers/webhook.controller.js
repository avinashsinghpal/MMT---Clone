const { Webhook } = require('svix');
const User = require('../models/user.model');

const clerkWebhook = async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET in .env');
    return res.status(500).json({ success: false, message: 'Server configuration error' });
  }

  // Get headers
  const svix_id = req.headers['svix-id'];
  const svix_timestamp = req.headers['svix-timestamp'];
  const svix_signature = req.headers['svix-signature'];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ success: false, message: 'Missing svix headers' });
  }

  const payload = req.body;
  const body = payload.toString('utf8');

  // Verify signature
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err.message);
    return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
  }

  // Sync Data
  const { id } = evt.data;
  const eventType = evt.type;

  try {
    if (eventType === 'user.created' || eventType === 'user.updated') {
      const email = evt.data.email_addresses?.[0]?.email_address || '';
      const firstName = evt.data.first_name || '';
      const lastName = evt.data.last_name || '';
      const profileImageUrl = evt.data.profile_image_url || '';

      await User.findOneAndUpdate(
        { clerkUserId: id },
        { email, firstName, lastName, profileImageUrl },
        { upsert: true, new: true }
      );
      
      console.log(`Clerk user ${id} synced to MongoDB successfully.`);
    }

    if (eventType === 'user.deleted') {
      await User.findOneAndDelete({ clerkUserId: id });
      console.log(`Clerk user ${id} deleted from MongoDB.`);
    }

    res.status(200).json({ success: true, message: 'Webhook received and processed' });
  } catch (error) {
    console.error('Error syncing user to MongoDB:', error);
    res.status(500).json({ success: false, message: 'Error processing webhook' });
  }
};

module.exports = { clerkWebhook };
