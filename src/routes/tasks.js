const express = require('express');
const router = express.Router();
const Task = require('./../models/task');
const auth = require('./../middleware/authMiddleware')


/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     description: Add a new task with title and description.
 *     tags:
 *       - Tasks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the task.
 *                 example: "New Task"
 *               description:
 *                 type: string
 *                 description: Description of the task.
 *                 example: "Description of the new task"
 *     responses:
 *       201:
 *         description: Task created successfully.
 *       400:
 *         description: Invalid input or validation error.
 */
router.post('',auth,async(req,res)=>{
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
 * /api/tasks:
 *   get:
 *     summary: Retrieve all tasks
 *     description: Get a list of tasks with pagination.
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           description: Number of tasks per page.
 *     responses:
 *       200:
 *         description: List of tasks retrieved successfully.
 *       500:
 *         description: Internal server error.
 */
router.get('',auth,async(req,res)=>{
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
 * /api/tasks/{id}:
 *   get:
 *     summary: Retrieve a task by ID
 *     description: Get details of a specific task by its unique ID.
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the task.
 *     responses:
 *       200:
 *         description: Task retrieved successfully.
 *       404:
 *         description: Task not found.
 *       500:
 *         description: Internal server error.
 */
router.get('/:id',auth,async(req,res)=>{
  const taskId = req.params.id;
  try{
    const task = await Task.findById(taskId);
    if(!task){
      return res.status(404).send('Task not found');
    };
    res.status(200).send(task);
  }catch(err){
    res.status(500).send(err);
  }
});

//update a task
/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a specific task
 *     description: Modify title, description, or status of a task by its ID.
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the task to be updated.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Updated title of the task.
 *                 example: "Updated Task"
 *               description:
 *                 type: string
 *                 description: Updated description of the task.
 *                 example: "Updated description."
 *               completed:
 *                 type: boolean
 *                 description: Task completion status.
 *                 example: true
 *     responses:
 *       200:
 *         description: Task updated successfully.
 *       400:
 *         description: Invalid input or validation error.
 *       404:
 *         description: Task not found.
 *       500:
 *         description: Internal server error.
 */
router.put('/:id',auth,async(req,res)=>{
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
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     description: Remove a task by its ID.
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the task to be deleted.
 *     responses:
 *       200:
 *         description: Task deleted successfully.
 *       404:
 *         description: Task not found.
 *       500:
 *         description: Internal server error.
 */
router.delete('/:id',auth,async(req,res)=>{
  const taskId = req.params.id;
  try{
    const task = await Task.findByIdAndDelete(taskId);
    if(!task){
      return res.status(404).send('Task not found');
    }
    res.status(200).send(task);
  }catch(err){
    return res.status(500).send(err)
  }
});

module.exports = router;
 