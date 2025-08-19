// backend/server.js
const express = require('express');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

// Require your database and redis clients
const pool = require('./db');
const redisClient = require('./config/redisConnection');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new (require('connect-redis').default)({ client: redisClient }), // connect-redis store
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

// --- NEW HEALTH CHECK ENDPOINT ---
app.get('/healthz', async (req, res) => {
    try {
        // Check database connection
        await pool.query('SELECT 1');
        // Check Redis connection
        await redisClient.ping();
        
        res.status(200).send('OK');
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(503).send('Service Unavailable');
    }
});
// --- END OF NEW HEALTH CHECK ENDPOINT ---

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));