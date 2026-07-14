const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  REFRESH_COOKIE_NAME,
  getRefreshCookieOptions,
} = require('../utils/tokens');
const { sendEmail, otpEmailTemplate, resetPasswordEmailTemplate } = require('../utils/email');

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Issues both tokens, stores refresh token on the user, sets the refresh cookie.
const issueSession = async (res, user, rememberMe = false) => {
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshTokens = [...(user.refreshTokens || []), refreshToken].slice(-5); // cap sessions/devices
  await user.save({ validateBeforeSave: false });

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions(rememberMe));
  return accessToken;
};

// @route   POST /api/auth/register/customer
const registerCustomer = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'An account with this email already exists');

  const otp = generateOtp();
  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: 'customer',
    emailVerificationToken: otp,
    emailVerificationExpires: Date.now() + 10 * 60 * 1000,
  });

  await sendEmail({
    to: email,
    subject: 'Verify your PharmaCare account',
    html: otpEmailTemplate(name, otp),
  });

  res.status(201).json({
    success: true,
    message: 'Account created. Check your email for the verification code.',
    data: { userId: user._id, email: user.email },
  });
});

// @route   POST /api/auth/register/chemist
const registerChemist = asyncHandler(async (req, res) => {
  const { name, email, phone, password, shopName, licenseNumber, gstNumber, shopAddress, openingHours } =
    req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'An account with this email already exists');

  const otp = generateOtp();
  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: 'chemist',
    emailVerificationToken: otp,
    emailVerificationExpires: Date.now() + 10 * 60 * 1000,
    shopDetails: {
      shopName,
      licenseNumber,
      gstNumber,
      shopAddress,
      openingHours,
    },
  });

  await sendEmail({
    to: email,
    subject: 'Verify your PharmaCare chemist account',
    html: otpEmailTemplate(name, otp),
  });

  res.status(201).json({
    success: true,
    message: 'Account created. Check your email for the verification code.',
    data: { userId: user._id, email: user.email },
  });
});

// @route   POST /api/auth/verify email
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({
    email,
    emailVerificationToken: otp,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) throw new ApiError(400, 'Invalid or expired verification code');

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;

  const accessToken = await issueSession(res, user);

  res.status(200).json({
    success: true,
    message: 'Email verified successfully',
    data: { user: user.toSafeObject(), accessToken },
  });
});

// @route   POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) throw new ApiError(403, 'This account has been deactivated');

  const accessToken = await issueSession(res, user, Boolean(rememberMe));

  res.status(200).json({
    success: true,
    message: 'Logged in successfully',
    data: { user: user.toSafeObject(), accessToken },
  });
});

// @route   POST /api/auth/refresh
const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) throw new ApiError(401, 'No refresh token provided');

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (err) {
    throw new ApiError(401, 'Refresh token expired or invalid. Please log in again.');
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.refreshTokens.includes(token)) {
    throw new ApiError(401, 'Refresh token is no longer valid');
  }

  // rotate: remove used token, issue a new pair
  user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
  const accessToken = await issueSession(res, user);

  res.status(200).json({ success: true, data: { accessToken } });
});

// @route   POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];

  if (token) {
    await User.updateOne({ refreshTokens: token }, { $pull: { refreshTokens: token } });
  }

  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// @route   POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Always respond the same way to avoid leaking which emails are registered
  if (!user) {
    return res.status(200).json({
      success: true,
      message: 'If that email is registered, a reset link has been sent.',
    });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = Date.now() + 30 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  await sendEmail({
    to: email,
    subject: 'Reset your PharmaCare password',
    html: resetPasswordEmailTemplate(user.name, resetUrl),
  });

  res.status(200).json({
    success: true,
    message: 'If that email is registered, a reset link has been sent.',
  });
});

// @route   POST /api/auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) throw new ApiError(400, 'Reset link is invalid or has expired');

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokens = []; // force re-login on all devices
  await user.save();

  res.status(200).json({ success: true, message: 'Password reset successfully. Please log in.' });
});

// @route   GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: { user: req.user.toSafeObject() } });
});

module.exports = {
  registerCustomer,
  registerChemist,
  verifyEmail,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
};
