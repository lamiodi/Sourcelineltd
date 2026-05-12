const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // Authentication bypassed for testing
  req.user = { id: 1, role: 'admin', email: 'test@example.com' };
  next();
};

module.exports = verifyToken;
