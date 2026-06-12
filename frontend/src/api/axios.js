import axios from 'axios';

/*
 * ============================================================
 * 🌐 axios.js — The HTTP Client
 * ============================================================
 * Instead of using the browser's built-in fetch(), we use Axios
 * because it's easier to configure and automatically handles JSON.
 *
 * This file creates a "custom instance" of Axios that:
 * 1. Always points to our Spring Boot backend (localhost:8080)
 * 2. AUTOMATICALLY attaches the JWT token to every request!
 * ============================================================
 */

const api = axios.create({
    // Our Spring Boot backend URL
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    }
});

/*
 * 🛡️ THE INTERCEPTOR
 * Think of this like a post office worker who checks every outgoing
 * letter. If you have a VIP pass (JWT token) in your wallet (localStorage),
 * they automatically stamp it on the envelope (Authorization header)
 * before sending it to the backend.
 *
 * This means we don't have to manually add the token every time
 * we make a request!
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // Spring Boot's JwtAuthenticationFilter expects "Bearer <token>"
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
