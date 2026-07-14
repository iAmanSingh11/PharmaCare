const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/*
 * Runs after express validator chains. Collects errors into a single
 * consistent 400 response instead of scattering checks across controllers.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return next(new ApiError(400, 'Validation failed', messages));
  }
  next();
};

module.exports = { validate };
