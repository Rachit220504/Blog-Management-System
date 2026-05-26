const jwt = require('jsonwebtoken');

const accessExpiresIn = process.env.JWT_EXPIRES_IN || '15m';
const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const getCookieOptions = () => ({
  httpOnly: true,
  secure: String(process.env.COOKIE_SECURE || process.env.NODE_ENV === 'production') === 'true',
  sameSite: process.env.COOKIE_SAME_SITE || 'lax',
  path: '/',
});

const generateAccessToken = (payload, expiresIn = accessExpiresIn) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn,
  });
};

const generateRefreshToken = (payload, expiresIn = refreshExpiresIn) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn,
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

const setAuthCookies = (res, accessToken, refreshToken) => {
  const cookieOptions = getCookieOptions();
  const refreshOptions = {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, refreshOptions);
};

const clearAuthCookies = (res) => {
  const cookieOptions = getCookieOptions();

  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  setAuthCookies,
  clearAuthCookies,
  getCookieOptions,
};