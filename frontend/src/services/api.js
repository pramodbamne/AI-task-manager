// frontend/src/services/api.js
import axios from 'axios';

const api = axios.create({
    // This now correctly points to your local backend
    baseURL: 'http://localhost:5000/api',
    withCredentials: true
});

export default api;