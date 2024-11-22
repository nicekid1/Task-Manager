
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const userSchema = mongoose.Schema({
  username:{type:String, required:true, unique:true},
  password:{type:String, required:true, }
});

//hashing password
userSchema.pre('save', async function(next){ 
  if(!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();   
});

const user = new mongoose.model('user', userSchema);

module.exports = user;




