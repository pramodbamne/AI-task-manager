// frontend/src/pages/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Logo from '../components/Logo';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/forgot-password', { email });
            alert('If an account with that email exists, a password reset OTP has been sent.');
            navigate('/reset-password');
        } catch (error) {
            console.error('Forgot password error', error);
            alert(error.response?.data || 'An error occurred. Please try again.');
        }
    };

    return (
        <div className="auth-container">
            <Logo />
            <div className="auth-form">
                <h2>Forgot Password</h2>
                <p>Enter your email to receive a reset code.</p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        name="email"
                        placeholder="Your Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <button type="submit">Send OTP</button>
                </form>
                <p>Remember your password? <Link to="/login">Login</Link></p>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;