
const errorHandler = (err, req, res, next)=>{
  console.log(err.stack);
  res.status(500).send({error:'Something went wrong!'});
};

module.exports = errorHandler;