const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).send({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1]; 
  if (!token) {
    return res.status(401).send({ error: 'Access denied. Invalid token format.' });
  }

  try {
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decode; 
    next();
  } catch (err) {
    return res.status(400).send({ error: 'Invalid token.' });
  }
};

module.exports = auth;