
//requires
const express = require('express');
const app = express();
const mongoose = require('mongoose');

//Middlewares
app.use(express.json());


//Database
mongoose.connect('mongodb://localhost:27017/task-manager',{useNewUrlParser:true, useUnifiedTopology:true})
.then(()=>console.log('Connected to MongoDB'))
.catch((err)=>console.error('Could not connect to MongoDB:',err));

//primary routes
app.get('/',(req,res)=>{
  res.send('Hello, Task Manager!');
});


//port setting
const port = process.env.Port || 3000;

app.listen(port,()=>{
  console.log(`Server is running on http://localhost:${port}`);
});

