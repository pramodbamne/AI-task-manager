const bcrypt = require('bcryptjs');
const pool = require('../db');
const redisClient = require('../config/redisConnection'); // Using the new filename
const { sendPasswordResetEmail } = require('../services/emailService');

exports.register = async (req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO users (email, password) VALUES (?, ?)',
            [email, hashedPassword]
        );
        const [rows] = await pool.query('SELECT id, email FROM users WHERE id = ?', [result.insertId]);
        req.session.user = rows[0];
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error during registration.');
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(400).send('Invalid credentials.');
        }
        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Invalid credentials.');
        }
        req.session.user = { id: user.id, email: user.email };
        res.json(req.session.user);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error during login.');
    }
};

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Could not log out.');
        }
        res.clearCookie('connect.sid');
        res.status(200).send('Logged out successfully.');
    });
};

exports.getMe = (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Not authenticated');
    }
    res.json(req.session.user);
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(200).send('If an account with that email exists, an OTP has been sent.');
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        await redisClient.set(email, otp, { EX: 600 }); // Expires in 10 minutes

        await sendPasswordResetEmail(email, otp);

        res.status(200).send('If an account with that email exists, an OTP has been sent.');

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error.');
    }
};

exports.resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const storedOtp = await redisClient.get(email);

        if (!storedOtp) {
            return res.status(400).send('OTP has expired or is invalid. Please try again.');
        }

        if (storedOtp !== otp) {
            return res.status(400).send('Invalid OTP.');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);

        await redisClient.del(email);

        res.status(200).send('Password has been reset successfully.');

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error.');
    }
};