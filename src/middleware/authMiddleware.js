
const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (req, res, next)=>{
  const token = req.header('Authorization');
  if(!token) return res.status(401).send({error:'Access denied. No token provided.'});
  try{
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decode;
    next();
  }catch(err){
    res.status(400).send({ error: 'Invalid token.' });
  }
};

module.exports = auth;

