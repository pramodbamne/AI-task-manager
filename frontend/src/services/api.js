// src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Your backend URL
    withCredentials: true // Important for sending cookies
});

export default api;