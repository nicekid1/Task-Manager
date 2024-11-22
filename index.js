
//requires
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Task = require('./src/models/task');
const User = require('./src/models/user');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
require('dotenv').config();



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

//routes

//add a new task (post method)
app.post('/tasks',async(req,res)=>{
  const{title, description} = req.body;
  const task = new Task({
    title,
    description
  });
  try{
    await task.save();
    res.status(201).send(task);
  }catch(err){
    res.status(400).send(err);
  }
});

//receive all tasks (get method)
app.get('/tasks',async(req,res)=>{
  try{
    const tasks = await Task.find();
    res.status(200).send(tasks)
  }catch(err){
    res.status(500).send(err)
  }
});

//receive a specific task 
app.get('/tasks/:id',async(req,res)=>{
  const taskId = req.params.id;
  try{
    const task = await Task.findById(taskId);
    if(!task){
      res.status(404).send('Task not found');
    };
    res.status(200).send(task);
  }catch(err){
    res.status(500).send(err);
  }
});

//update a task
app.put('/tasks/:id',async(req,res)=>{
  const taskId = req.params.id;
  const updates = Object.keys(req.body);
  try{
    const task = await Task.findById(taskId);
    if(!task){
      return res.status(404).send('Task not found');
    }
    updates.forEach((update)=>(task[update]=req.body[update]));
    await task.save();
    //another way for task update
    // const task = await Task.findByIdAndUpdate(taskId,{
    //   title : req.body.title,
    //   description : req.body.description,
    //   completed : req.body.completed
    // },{ new: true } )
    // if(!task){
    //   res.status(400).send('Task not found')
    // }
    res.status(200).send(task);
  }catch(err){
    res.status(500).send(err);
  }
})

//delete a task
app.delete('/tasks/:id',async(req,res)=>{
  const taskId = req.params.id;
  try{
    const task = await Task.findByIdAndDelete(taskId);
    if(!task){
      res.status(404).send('Task not found');
    }
    res.status(200).send(task);
  }catch(err){
    res.status(500).send(err)
  }
})

//register
app.post('/register', async(req,res)=>{
  const{username, password} = req.body;
  try{
    const user = new User({username, password});
    await user.save();
    res.status(201).send('User registered successfully')
  }catch(err){
    res.status(400).send(err);
  }
});

//login
app.post('/login', async(req,res)=>{
  const{username, password} = req.body;
  try{
    const user = await User.findOne({username});
    if(!user){
      return res.status(404).send('Username or Password not found');
    };
    isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
      return res.status(404).send('Username or Password not found');
    };
    const token = jwt.sign({id:user._id}, process.env.SECRET_KEY, {expiresIn: '1h'})
    res.status(200).send(token)

  }catch(err){
    res.status(500).send(err)
  }
})



//port setting
const port = process.env.Port || 3000;

app.listen(port,()=>{
  console.log(`Server is running on http://localhost:${port}`);
});

