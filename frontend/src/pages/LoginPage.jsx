// frontend/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Logo from '../components/Logo';

const LoginPage = ({ setAuth }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/login', formData);
            setAuth(true);
            navigate('/dashboard');
        } catch (error) {
            alert('Login failed! Please check your credentials.');
            console.error(error);
        }
    };

    return (
        <div className="auth-container">
            <Logo />
            <div className="auth-form">
                <h2>Login</h2>
                <form onSubmit={handleSubmit}>
                    <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                    <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                    <button type="submit">Login</button>
                </form>
                <p>
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
                {/* FIX: Ensures the Forgot Password link is present */}
                <p>
                    <Link to="/forgot-password">Forgot Password?</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;