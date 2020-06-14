const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function (req, res, next) {
  // get the token from the header if present
  let token = req.headers['x-access-token'];
  const bearerHeader = req.headers.authorization;

  if (bearerHeader !== undefined) {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    token = bearerToken;
  } else {
    res.sendStatus(401);
  }
  // if no token found, return response (without going to the next middelware)
  if (!token) return res.status(401).send('Access denied. No token provided.');

  try {
    // if can verify the token, set req.user and pass to next middleware
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log(req.originalUrl);
    if (!decoded.authedTOTP && (req.originalUrl != '/login/2fa')) {
      throw new Error('No 2FA!');
    }
    req.user = decoded;
    next();
  } catch (ex) {
    // if invalid token
    console.log(ex.message);
    res.status(401).send(ex.message);
  }
};
