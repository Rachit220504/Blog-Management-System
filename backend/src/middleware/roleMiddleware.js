/**
 * Restricts access to specified roles.
 * @param {...string} roles - The roles authorized to access the route.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, please authenticate first',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' is not authorized to access this resource`,
      });
    }

    next();
  };
};

const permissionsByRole = {
  super_admin: ['*'],
  editor: ['posts:read', 'posts:create', 'posts:update', 'posts:delete', 'users:read'],
  author: ['posts:read', 'posts:create', 'posts:update:own', 'posts:delete:own'],
  user: ['posts:read:published'],
};

const requirePermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, please authenticate first',
      });
    }

    const granted = permissionsByRole[req.user.role] || [];

    const hasPermission = (requiredPermission) => {
      return granted.some((permission) => {
        if (permission === '*') {
          return true;
        }

        return permission === requiredPermission || permission.startsWith(`${requiredPermission}:`);
      });
    };

    if (permissions.every((permission) => hasPermission(permission))) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Forbidden: insufficient permissions',
    });
  };
};

const validateRoleInput = (roles = ['super_admin', 'editor', 'author', 'user']) => {
  return (req, res, next) => {
    const role = req.body.role;

    if (role && !roles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed roles: ${roles.join(', ')}`,
      });
    }

    next();
  };
};

module.exports = { authorize, requirePermission, validateRoleInput };
