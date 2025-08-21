// backend/server.js

const express = require('express');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

const { createClient } = require('redis'); // redis v4+
const { RedisStore } = require('connect-redis'); // <-- v9 import
const pool = require('./db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Create Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});
redisClient.connect().catch(console.error);

// Trust proxy for production
app.set('trust proxy', 1);

// CORS setup
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? 'https://your-frontend-url.netlify.app'
        : 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json());

// Session middleware with RedisStore
app.use(
  session({
    store: new RedisStore({
      client: redisClient,
      prefix: 'myapp:',
    }),
    secret: process.env.SESSION_SECRET || 'supersecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    },
  })
);

// Health check
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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
