const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/tokens');
const User = require('../models/User');

/*
 * Protects a route: requires a valid Bearer access token.
 * Attaches the authenticated user to req.user (without password).
 */
const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Not authorized. Please log in.');
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    throw new ApiError(401, 'Session expired or invalid. Please log in again.');
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    throw new ApiError(401, 'Account not found or deactivated.');
  }

  req.user = user;
  next();
});

module.exports = { protect };
