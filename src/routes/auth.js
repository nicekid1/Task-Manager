const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


//register
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account by providing a username and password.
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
 *                 description: Unique username for the user.
 *                 example: "john_doe"
 *               password:
 *                 type: string
 *                 description: Strong password for the user account.
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: User registered successfully.
 *       400:
 *         description: Bad request. Invalid input data.
 */
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = new User({ username, password });
    await user.save();
    res.status(201).send('User registered successfully');
  } catch (err) {
    res.status(400).send(err);
  }
});

// Login
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user and generate a JWT token
 *     description: Authenticate a user by their username and password, and return a JWT token for session management.
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
 *                 description: Username of the user.
 *                 example: "john_doe"
 *               password:
 *                 type: string
 *                 description: Password of the user.
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful. JWT token generated.
 *       404:
 *         description: Invalid username or password.
 *       500:
 *         description: Internal server error.
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send('Username or Password not found');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(404).send('Username or Password not found');
    }
    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' });
    res.status(200).send(token);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

module.exports = router;


