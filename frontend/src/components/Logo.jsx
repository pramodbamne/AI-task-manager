// src/components/Logo.jsx
import React from 'react';

const Logo = () => {
    const logoStyle = {
        position: 'fixed',
        left: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        backgroundColor: '#f0f0f0',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        textAlign: 'center'
    };
    return (
        <div style={logoStyle}>
            <span role="img" aria-label="logo" style={{ fontSize: '48px' }}>✅</span>
            <h2 style={{ margin: '10px 0 0', color: '#333' }}>TODO App</h2>
        </div>
    );
};

export default Logo;