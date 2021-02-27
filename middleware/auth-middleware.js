const HttpError = require('../models/http-error');
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      throw new HttpError('Unauthenticated', 401);
    }
    const decodedToken = jwt.verify(token, process.env.DB_JWT_PRIVATE_KEY);
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (error) {
    return next(new HttpError('Unauthenticated', 401));
  }
};
