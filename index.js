
//requires
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const errorHandler = require('./src/middleware/errorHandler');
const setupSwagger = require('./swagger');
const taskRoutes = require('./src/routes/tasks');
const authRoutes = require('./src/routes/auth');

require('dotenv').config();



//Middlewares
app.use(express.json());
app.use(errorHandler);

//Swagger Setting
setupSwagger(app);

//Database
mongoose.connect('mongodb://localhost:27017/task-manager')
.then(()=>console.log('Connected to MongoDB'))
.catch((err)=>console.error('Could not connect to MongoDB:',err));

//primary routes
app.get('/',(req,res)=>{
  res.send('Hello, Task Manager!');
});

//routes
app.use('/api/tasks', taskRoutes); 
app.use('/api/auth', authRoutes);

//port setting

const port = process.env.Port || 3000;

app.listen(port,()=>{
  console.log(`Server is running on http://localhost:${port}`);
});

