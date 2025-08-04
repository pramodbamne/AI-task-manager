// frontend/src/pages/ResetPasswordPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Logo from '../components/Logo';

const ResetPasswordPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        otp: '',
        newPassword: '',
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/reset-password', formData);
            alert('Password has been reset successfully! Please log in with your new password.');
            navigate('/login');
        } catch (error) {
            console.error('Reset password error', error);
            alert(error.response?.data || 'Failed to reset password. Please check your OTP and try again.');
        }
    };

    return (
        <div className="auth-container">
            <Logo />
            <div className="auth-form">
                <h2>Reset Password</h2>
                <form onSubmit={handleSubmit}>
                    <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                    <input type="text" name="otp" placeholder="OTP from email" value={formData.otp} onChange={handleChange} required />
                    <input type="password" name="newPassword" placeholder="New Password" value={formData.newPassword} onChange={handleChange} required />
                    <button type="submit">Reset Password</button>
                </form>
                 <p>Remembered it? <Link to="/login">Login</Link></p>
            </div>
        </div>
    );
};

export default ResetPasswordPage;