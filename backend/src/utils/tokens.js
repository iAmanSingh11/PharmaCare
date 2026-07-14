const jwt = require('jsonwebtoken');

const generateAccessToken = (userId, role) =>
  jwt.sign({ id: userId, role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  });

const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '30d',
  });

const verifyAccessToken = (token) => jwt.verify(token, process.env.JWT_ACCESS_SECRET);
const verifyRefreshToken = (token) => jwt.verify(token, process.env.JWT_REFRESH_SECRET);

const REFRESH_COOKIE_NAME = 'pharmacare_refresh';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/*
 * `rememberMe: true` -> persistent 30day cookie.
 * `rememberMe: false` (default) -> session length cookie (cleared when the
 * browser closes) backed by a short lived refresh token server side.
 */
const getRefreshCookieOptions = (rememberMe = false) => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: 'lax',
  path: '/api/auth',
  ...(rememberMe ? { maxAge: THIRTY_DAYS_MS } : {}), // omit maxAge => browser session cookie
});

const refreshCookieOptions = getRefreshCookieOptions(true); // default export kept for /refresh rotation

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  REFRESH_COOKIE_NAME,
  refreshCookieOptions,
  getRefreshCookieOptions,
};
