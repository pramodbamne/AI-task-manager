// frontend/src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NODE_ENV === 'production'
        ? 'https://your-backend-name.onrender.com' // We will replace this later
        : 'http://localhost:5000',
    withCredentials: true
});

export default api;