import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { IoMdSend } from 'react-icons/io';
import { CgClose } from 'react-icons/cg';

const ChatModal = ({ isOpen, onClose, onTaskAdded }) => {
    const [messages, setMessages] = useState([{ from: 'ai', text: 'Hello! How can I help you manage your tasks today?' }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { from: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await api.post('/tasks/chat', { message: input });
            const aiMessage = { from: 'ai', text: res.data.reply };
            setMessages(prev => [...prev, aiMessage]);

            if (res.data.newTask) {
                onTaskAdded(res.data.newTask);
            }
        } catch (error) {
            const errorMessage = { from: 'ai', text: 'Sorry, I encountered an error. Please try again.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const modalStyle = {
        position: 'fixed', bottom: '100px', right: '30px', width: '370px', height: '500px',
        backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
        display: 'flex', flexDirection: 'column', zIndex: 1000,
    };
    const headerStyle = { padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
    const messagesContainerStyle = { flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' };
    const formStyle = { display: 'flex', padding: '15px', borderTop: '1px solid #eee' };
    const inputStyle = { flex: 1, border: '1px solid #ccc', borderRadius: '20px', padding: '10px 15px', marginRight: '10px' };

    return (
        <div style={modalStyle}>
            <div style={headerStyle}>
                <h3 style={{ margin: 0 }}>Task Assistant</h3>
                <CgClose onClick={onClose} style={{ cursor: 'pointer', fontSize: '20px' }} />
            </div>
            <div style={messagesContainerStyle}>
                {messages.map((msg, index) => (
                    <div key={index} style={{
                        alignSelf: msg.from === 'user' ? 'flex-end' : 'flex-start',
                        backgroundColor: msg.from === 'user' ? '#007bff' : '#f1f1f1',
                        color: msg.from === 'user' ? 'white' : 'black',
                        padding: '10px 15px', borderRadius: '20px', maxWidth: '80%', whiteSpace: 'pre-wrap'
                    }}>{msg.text}</div>
                ))}
                {isLoading && <div style={{ alignSelf: 'flex-start' }}>...</div>}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} style={formStyle}>
                <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask me to add a task..." style={inputStyle} />
                <button type="submit" style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#007bff' }}><IoMdSend /></button>
            </form>
        </div>
    );
};

export default ChatModal;