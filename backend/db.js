// backend/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    uri: process.env.DATABASE_URL, // PlanetScale provides this URL
    ssl: {
        // PlanetScale requires a secure connection
        rejectUnauthorized: true,
    }
});

module.exports = pool;