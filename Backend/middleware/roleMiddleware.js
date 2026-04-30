/*
  Role Authorization Middleware

  Usage:
  authorize("admin")
  authorize(["admin", "agent"])
*/

const authorize = (roles = []) => {
  // Ensure roles is always an array
  if (!Array.isArray(roles)) {
    roles = [roles];
  }

  // Normalize roles to lowercase
  const allowedRoles = roles.map(r => r.toLowerCase());

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No user data found"
      });
    }

    const userRole = (req.user.role || "").toLowerCase();

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Access denied: Insufficient permissions"
      });
    }

    next();
  };
};

module.exports = authorize;