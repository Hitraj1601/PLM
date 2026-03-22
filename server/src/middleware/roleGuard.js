// Middleware factory function that dynamically returns a specialized middleware instance
// based on an array of permitted role strings passed continuously to `roleGuard(...)`
const roleGuard = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if auth context was successfully loaded prior by the `auth` middleware
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    // Block endpoint engagement if the specific user role isn't universally authorized
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    // Advance control logic out of guards
    next();
  };
};

module.exports = roleGuard;
