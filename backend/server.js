// backend/server.js
const express = require('express');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();
const RedisStore = require("connect-redis").default; // Correct import

const pool = require('./db');
const redisClient = require('./config/redisConnection');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// IMPORTANT: Set trust proxy for Render/production environment
app.set('trust proxy', 1);

app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? 'https://your-frontend-url.netlify.app' // Replace with your frontend URL
        : 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());

// Initialize store.
let redisStore = new RedisStore({
  client: redisClient,
  prefix: "myapp:",
})

// Initialize session storage.
app.use(
  session({
    store: redisStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax',
    },
  })
)

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