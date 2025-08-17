const pool = require('../db');
const { sendTaskCreationEmail } = require('../services/emailService');
const geminiService = require('../services/geminiService');

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

        sendTaskCreationEmail(req.session.user.email, newTask.description, newTask.deadline);

        res.status(201).json(newTask);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

exports.createTaskWithAI = async (req, res) => {
    const { command } = req.body;
    if (!command) {
        return res.status(400).send('Command is required.');
    }
    try {
        const taskDetails = await geminiService.analyzeTaskCommand(command);
        if (!taskDetails || !taskDetails.description) {
            return res.status(400).send('AI could not determine a task description.');
        }
        const [result] = await pool.query(
            'INSERT INTO tasks (user_id, description, status, priority, deadline) VALUES (?, ?, ?, ?, ?)',
            [req.session.user.id, taskDetails.description, 'Pending', taskDetails.priority, taskDetails.deadline]
        );
        const [newTaskArr] = await pool.query('SELECT * FROM tasks WHERE task_id = ?', [result.insertId]);
        const newTask = newTaskArr[0];

        sendTaskCreationEmail(req.session.user.email, newTask.description, newTask.deadline);

        res.status(201).json({
            message: "AI-powered task created successfully!",
            task: newTask
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error during AI task creation.');
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

exports.handleChat = async (req, res) => {
    const { message } = req.body;
    const userId = req.session.user.id;
    const userEmail = req.session.user.email;

    try {
        const [tasks] = await pool.query('SELECT task_id, description, priority, deadline FROM tasks WHERE user_id = ?', [userId]);
        const user = { email: userEmail };

        const result = await geminiService.analyzeChatIntent(message, tasks, user);
        const { intent, ...params } = result;

        let responseMessage = "I'm not sure how to help with that. Please try rephrasing.";

        switch (intent) {
            case 'addTask':
                const taskDetails = await geminiService.analyzeTaskCommand(params.command);
                if (taskDetails && taskDetails.description) {
                    const [newResult] = await pool.query(
                        'INSERT INTO tasks (user_id, description, status, priority, deadline) VALUES (?, ?, ?, ?, ?)',
                        [userId, taskDetails.description, 'Pending', taskDetails.priority, taskDetails.deadline]
                    );
                    const [newTaskArr] = await pool.query('SELECT * FROM tasks WHERE task_id = ?', [newResult.insertId]);
                    const newTask = newTaskArr[0];
                    sendTaskCreationEmail(userEmail, newTask.description, newTask.deadline);
                    return res.json({
                        reply: `✅ Task created: "${taskDetails.description}"`,
                        newTask: newTask
                    });
                }
                break;

            case 'deleteTask':
                if (params.task_id) {
                    const [deleteResult] = await pool.query('DELETE FROM tasks WHERE task_id = ? AND user_id = ?', [params.task_id, userId]);
                    if (deleteResult.affectedRows > 0) {
                        responseMessage = "✅ Task deleted successfully.";
                    } else {
                        responseMessage = "🤔 I couldn't find that task to delete.";
                    }
                }
                break;

            case 'queryAllTasks':
                if (tasks.length > 0) {
                    responseMessage = "Here are all your tasks:\n" + tasks.map(t => `- ${t.description} (Priority: ${t.priority})`).join('\n');
                } else {
                    responseMessage = "You have no tasks!";
                }
                break;

            case 'queryTasksByPriority':
                const [priorityTasks] = await pool.query('SELECT description, priority FROM tasks WHERE user_id = ? AND priority = ?', [userId, params.priority]);
                if (priorityTasks.length > 0) {
                    responseMessage = `Here are your ${params.priority} tasks:\n` + priorityTasks.map(t => `- ${t.description}`).join('\n');
                } else {
                    responseMessage = `You have no ${params.priority} tasks.`;
                }
                break;
            
            case 'queryUser':
                responseMessage = `Your user email is ${userEmail}. For security reasons, I cannot access or provide your password.`;
                break;
        }

        res.json({ reply: responseMessage });

    } catch (error) {
        console.error("Chat handler error:", error);
        res.status(500).json({ reply: "Sorry, a server error occurred." });
    }
};