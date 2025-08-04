import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import api from './services/api';
import './index.css';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await api.get('/auth/me');
                setIsAuthenticated(true);
            } catch (error) {
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const setAuth = (value) => {
        setIsAuthenticated(value);
    };

    if (loading) {
        return <div>Loading application...</div>;
    }

    return (
        <Router>
            <Routes>
                <Route path="/login" element={!isAuthenticated ? <LoginPage setAuth={setAuth} /> : <Navigate to="/dashboard" />} />
                <Route path="/register" element={!isAuthenticated ? <RegisterPage setAuth={setAuth} /> : <Navigate to="/dashboard" />} />
                <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPasswordPage /> : <Navigate to="/dashboard" />} />
                <Route path="/reset-password" element={!isAuthenticated ? <ResetPasswordPage /> : <Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={isAuthenticated ? <DashboardPage setAuth={setAuth} /> : <Navigate to="/login" />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
};export default App;
