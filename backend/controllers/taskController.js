// backend/controllers/taskController.js
const pool = require('../db');
const { sendTaskCreationEmail } = require('../services/emailService');

exports.getTasks = async (req, res) => {
    try {
        const [tasks] = await pool.query(
            'SELECT * FROM tasks WHERE user_id = ? ORDER BY deadline ASC',
            [req.session.user.id]
        );
        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

exports.createTask = async (req, res) => {
    const { description, status, priority, deadline } = req.body;
    if (!deadline) {
        return res.status(400).send('Deadline is a required field.');
    }
    try {
        const [result] = await pool.query(
            'INSERT INTO tasks (user_id, description, status, priority, deadline) VALUES (?, ?, ?, ?, ?)',
            [req.session.user.id, description, status, priority, deadline]
        );
        const [newTaskArr] = await pool.query('SELECT * FROM tasks WHERE task_id = ?', [result.insertId]);
        const newTask = newTaskArr[0];

        sendTaskCreationEmail(
            req.session.user.email,
            newTask.description,
            newTask.deadline
        );

        res.status(201).json(newTask);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

exports.updateTask = async (req, res) => {
    const { id } = req.params;
    const { description, status, priority, deadline } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE tasks SET description = ?, status = ?, priority = ?, deadline = ? WHERE task_id = ? AND user_id = ?',
            [description, status, priority, deadline, id, req.session.user.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).send('Task not found or user not authorized.');
        }
        const [updatedTask] = await pool.query('SELECT * FROM tasks WHERE task_id = ?', [id]);
        res.json(updatedTask[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

exports.deleteTask = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query(
            'DELETE FROM tasks WHERE task_id = ? AND user_id = ?',
            [id, req.session.user.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).send('Task not found or user not authorized.');
        }
        res.status(200).send('Task deleted successfully.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};