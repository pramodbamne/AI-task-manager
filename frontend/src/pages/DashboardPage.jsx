// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Logo from '../components/Logo';
import { useNavigate } from 'react-router-dom';

const DashboardPage = ({ setAuth }) => {
    const [tasks, setTasks] = useState([]);
    const [user, setUser] = useState(null);
    const [newTask, setNewTask] = useState({ description: '', status: 'Pending', priority: 'Normal', deadline: '' });
    
    // State for inline editing
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editFormData, setEditFormData] = useState({ description: '', status: '', priority: '', deadline: '' });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await api.get('/auth/me');
                setUser(userRes.data);
                const tasksRes = await api.get('/tasks');
                setTasks(tasksRes.data);
            } catch (error) {
                console.error("Failed to fetch data", error);
                setAuth(false);
                navigate('/login');
            }
        };
        fetchData();
    }, [navigate, setAuth]);
    
    const handleNewTaskChange = (e) => {
        setNewTask({ ...newTask, [e.target.name]: e.target.value });
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/tasks', newTask);
            setTasks([...tasks, res.data]);
            setNewTask({ description: '', status: 'Pending', priority: 'Normal', deadline: '' });
            alert('Task added successfully!');
        } catch (error) {
            console.error('Failed to add task', error);
        }
    };

    // --- NEW FUNCTIONS FOR EDIT AND DELETE ---

    const handleDelete = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await api.delete(`/tasks/${taskId}`);
                setTasks(tasks.filter(task => task.task_id !== taskId));
            } catch (error) {
                console.error('Failed to delete task', error);
            }
        }
    };

    const handleEditClick = (task) => {
        setEditingTaskId(task.task_id);
        // Format date for the input[type=date]
        const formattedDeadline = new Date(task.deadline).toISOString().split('T')[0];
        setEditFormData({ ...task, deadline: formattedDeadline });
    };

    const handleCancelClick = () => {
        setEditingTaskId(null);
    };

    const handleEditFormChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`/tasks/${editingTaskId}`, editFormData);
            const updatedTasks = tasks.map(task => 
                task.task_id === editingTaskId ? res.data : task
            );
            setTasks(updatedTasks);
            setEditingTaskId(null);
        } catch (error) {
            console.error('Failed to update task', error);
        }
    };

    // REPLACE IT WITH THIS:
const handleLogout = async () => {
    try {
        await api.post('/auth/logout');
        setAuth(false);
        navigate('/login');
    } catch (error) {
        console.error('Logout failed', error);
    }
};
    
    if (!user) return <div>Loading...</div>;

    return (
    <div className="dashboard-container">
     <Logo />
            <div className="dashboard-content">
                <header className="dashboard-header">
                    <h1>Welcome, {user.name}!</h1>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </header>

                {/* Add New Task Form */}
<div className="task-form-container">
    <h2>Add New Task</h2>
    <form onSubmit={handleAddTask} className="task-form">
        {/* Ensure these lines are correct */}
        <input type="text" name="description" placeholder="Task Description" value={newTask.description} onChange={handleNewTaskChange} required />
        <input type="date" name="deadline" value={newTask.deadline} onChange={handleNewTaskChange} required />
        <select name="priority" value={newTask.priority} onChange={handleNewTaskChange}>
            <option value="Low">Low</option>
            <option value="Normal">Normal</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
        </select>
        <select name="status" value={newTask.status} onChange={handleNewTaskChange}>
             <option value="Pending">Pending</option>
             <option value="In Progress">In Progress</option>
             <option value="Completed">Completed</option>
        </select>
        <button type="submit">Add Task</button>
    </form>
</div>

                {/* Task List */}
                <div className="task-list-container">
                    <h2>Your Tasks</h2>
                    <ul className="task-list">
                        {tasks.map(task => (
                            <li key={task.task_id} className={`task-item priority-${task.priority.toLowerCase()}`}>
                                {editingTaskId === task.task_id ? (
                                    // --- EDIT FORM ---
                                    <form onSubmit={handleUpdateSubmit} className="edit-task-form">
                                        <input type="text" name="description" value={editFormData.description} onChange={handleEditFormChange} required />
                                        <input type="date" name="deadline" value={editFormData.deadline} onChange={handleEditFormChange} required/>
                                        <select name="priority" value={editFormData.priority} onChange={handleEditFormChange}>
                                            <option value="Low">Low</option>
                                            <option value="Normal">Normal</option>
                                            <option value="High">High</option>
                                            <option value="Urgent">Urgent</option>
                                        </select>
                                        <select name="status" value={editFormData.status} onChange={handleEditFormChange}>
                                            <option value="Pending">Pending</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                        <div className="task-actions">
                                            <button type="submit" className="btn-save">Save</button>
                                            <button type="button" onClick={handleCancelClick} className="btn-cancel">Cancel</button>
                                        </div>
                                    </form>
                                ) : (
                                    // --- TASK DISPLAY ---
                                    <>
                                        <h3>{task.description}</h3>
                                        <p>Status: {task.status}</p>
                                        <p>Priority: {task.priority}</p>
                                        <p>Deadline: {new Date(task.deadline).toLocaleDateString()}</p>
                                        <div className="task-actions">
                                            <button onClick={() => handleEditClick(task)} className="btn-edit">Edit</button>
                                            <button onClick={() => handleDelete(task.task_id)} className="btn-delete">Delete</button>
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;