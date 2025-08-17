import React from 'react';
import { BsStars } from 'react-icons/bs';

const ChatbotIcon = ({ onClick }) => {
    const iconStyle = {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        backgroundColor: '#007bff',
        color: 'white',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        fontSize: '28px',
        zIndex: 1000,
    };
    return (
        <div style={iconStyle} onClick={onClick}>
            <BsStars />
        </div>
    );
};

export default ChatbotIcon;