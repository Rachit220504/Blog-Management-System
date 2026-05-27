const User = require('../models/User');
const { verifyAccessToken } = require('../services/tokenService');

const protect = async (req, res, next) => {
  let token;

  // Check headers for authorization
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = verifyAccessToken(token);

      // Get user from the token, exclude password
      req.user = await User.findById(decoded.id).select('-password -refreshTokenVersion');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found',
        });
      }

      if (!req.user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Access denied, account is deactivated',
        });
      }

      return next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Access token expired',
          code: 'ACCESS_TOKEN_EXPIRED',
        });
      }

      next(error);
    }
  }

  if (!token && req.cookies && req.cookies.accessToken) {
    try {
      const decoded = verifyAccessToken(req.cookies.accessToken);
      req.user = await User.findById(decoded.id).select('-password -refreshTokenVersion');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found',
        });
      }

      if (!req.user.isActive || req.user.status !== 'active') {
        return res.status(403).json({
          success: false,
          message: 'Access denied, account is deactivated',
        });
      }

      return next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Access token expired',
          code: 'ACCESS_TOKEN_EXPIRED',
        });
      }

      return next(error);
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }
};

module.exports = { protect };
