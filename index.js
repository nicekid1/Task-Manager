
//requires
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Task = require('./src/models/task');
const User = require('./src/models/user');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const auth = require('./src/middleware/authMiddleware')
const errorHandler = require('./src/middleware/errorHandler')
const setupSwagger = require('./swagger')

require('dotenv').config();



//Middlewares
app.use(express.json());
app.use(errorHandler);

//Swagger Setting
setupSwagger(app);

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
/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Add a new task
 *     description: Create a new task by providing title and description
 *     tags:
 *       - Tasks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "New Task"
 *               description:
 *                 type: string
 *                 example: "Description of the new task"
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Bad request
 */
app.post('/tasks',auth,async(req,res)=>{
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
/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks
 *     description: Retrieve a list of tasks with pagination
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of tasks per page
 *     responses:
 *       200:
 *         description: A list of tasks
 *       500:
 *         description: Internal server error
 */
app.get('/tasks',auth,async(req,res)=>{
  const{page=1, limit=10} = req.query;
  try{
    const tasks = await Task.find()
      .limit(limit * 1)
      // also can use => .limit(Number(limit))
      .skip((page - 1)* limit)
      .exec();
    const count = await Task.countDocuments();
    res.status(200).send({
      tasks,
      current : page,
      total_page:Math.ceil(count/limit) 
    });
  }catch(err){
    res.status(500).send(err)
  }
});

//receive a specific task 
/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get a specific task by ID
 *     description: Retrieve a task by its ID
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the task
 *         schema:
 *           type: string
 *           example: "60c72b2f9b1e8d3b8f25b6f9"
 *     responses:
 *       200:
 *         description: Task found
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
app.get('/tasks/:id',auth,async(req,res)=>{
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
/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update a specific task
 *     description: Update a task by its ID with new title, description, and status
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the task to update
 *         schema:
 *           type: string
 *           example: "60c72b2f9b1e8d3b8f25b6f9"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Task"
 *               description:
 *                 type: string
 *                 example: "Updated description of the task"
 *               completed:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
app.put('/tasks/:id',auth,async(req,res)=>{
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
});

//delete a task
/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     description: Delete a task by its ID
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the task to delete
 *         schema:
 *           type: string
 *           example: "60c72b2f9b1e8d3b8f25b6f9"
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
app.delete('/tasks/:id',auth,async(req,res)=>{
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
});

//register
/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user by providing a username and password
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "john_doe"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request, invalid input
 */
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
    const token = jwt.sign({id:user._id}, process.env.SECRET_KEY, {expiresIn: '1h'});
    res.status(200).send(token);

  }catch(err){
    console.log(err);
    res.status(500).send(err);
  }
});



//port setting
/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login user and generate JWT token
 *     description: Authenticate user by username and password, and return a JWT token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "john_doe"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful, token generated
 *       404:
 *         description: Username or password not found
 *       500:
 *         description: Internal server error
 */
const port = process.env.Port || 3000;

app.listen(port,()=>{
  console.log(`Server is running on http://localhost:${port}`);
});

