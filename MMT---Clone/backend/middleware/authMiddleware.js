const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

// This middleware protects the route and extracts the user ID
const requireAuth = ClerkExpressRequireAuth({
  // Optional configuration can be passed here
});

// Middleware to attach clerk userId to req.user for consistency
const attachUser = (req, res, next) => {
  if (req.auth && req.auth.userId) {
    req.user = { id: req.auth.userId };
  }
  next();
};

module.exports = { requireAuth, attachUser };
