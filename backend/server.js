// backend/server.js
const express = require('express');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

const pool = require('./db');
const redisClient = require('./config/redisConnection');

// --- 1. IMPORT connect-redis AT THE TOP ---
const RedisStore = require("connect-redis").default;

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? 'https://your-frontend-url.onrender.com' // Replace with your frontend URL
        : 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());

// --- 2. UPDATE THE SESSION CONFIGURATION ---
app.use(session({
    store: new RedisStore({ client: redisClient }), // Use the imported RedisStore
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

app.get('/healthz', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        await redisClient.ping();
        res.status(200).send('OK');
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(503).send('Service Unavailable');
    }
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));