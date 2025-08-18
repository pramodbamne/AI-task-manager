// backend/Routes/taskRoutes.js
const express = require('express');
const { getTasks, createTask, updateTask, deleteTask, createTaskWithAI, handleChat } = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

// AI route
router.post('/ai', createTaskWithAI);
router.post('/chat', handleChat);

// Standard CRUD routes
router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
router.post('/chat', handleChat);