const express = require('express');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const { chat } = require('../controllers/aiController');
const { validate } = require('../middleware/validate');

const router = express.Router();

// Generous enough for a real conversation, tight enough to bound API cost
// from a single abusive client. Available to guests too (no auth here).
const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many messages sent. Please wait a few minutes and try again.' },
});

router.post(
  '/chat',
  aiLimiter,
  [body('message').isString().trim().notEmpty().withMessage('Message is required')],
  validate,
  chat
);

module.exports = router;
