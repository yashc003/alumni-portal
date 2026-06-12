import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

/*
 * ============================================================
 * 🧠 AuthContext.jsx — The Memory Bank
 * ============================================================
 * React components normally only share data with their direct children.
 * But authentication data (is the user logged in? what's their role?)
 * needs to be accessed by ALMOST EVERY component (navbar, pages, etc.).
 *
 * Context acts like a global "memory bank" that any component can tap into.
 * ============================================================
 */

// 1. Create the Context
export const AuthContext = createContext();

// 2. Custom Hook to easily use the context
export function useAuth() {
    return useContext(AuthContext);
}

// 3. The Provider Component
export function AuthProvider({ children }) {
    // State to hold the user's data and login status
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    // loading is true while we check if they were already logged in
    const [loading, setLoading] = useState(true);

    /*
     * 🔄 useEffect — Runs ONCE when the app starts
     * We check localStorage to see if they logged in previously.
     * If yes, we restore their session.
     */
    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
            setIsAuthenticated(true);
        }
        setLoading(false); // Done checking
    }, []);

    /*
     * 🔑 LOGIN FUNCTION
     * Calls our Spring Boot backend. If successful, saves the token and user data.
     */
    const login = async (email, password) => {
        // Axios automatically throws an error if the status is 4xx or 5xx
        const response = await api.post('/api/auth/login', { email, password });
        
        // Remember our backend returns AuthResponse DTO!
        const { token, fullName, role } = response.data;
        
        // Save to browser storage (survives page refreshes)
        localStorage.setItem('token', token);
        
        const userData = { email, fullName, role };
        localStorage.setItem('user', JSON.stringify(userData));

        // Update React state
        setUser(userData);
        setIsAuthenticated(true);
        
        return userData;
    };

    /*
     * 📝 REGISTER FUNCTION
     * Passes the form data to the backend. Does NOT log the user in
     * (they have to wait for admin approval).
     */
    const register = async (formData) => {
        const response = await api.post('/api/auth/register', formData);
        return response.data.message; // "Registration successful! Please wait..."
    };

    /*
     * 🚪 LOGOUT FUNCTION
     * Wipes everything from localStorage and resets React state.
     */
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
    };

    /*
     * 🔄 UPDATE USER
     * Updates the React state and localStorage when the user edits their profile.
     */
    const updateUser = (newUserData) => {
        const updatedUser = { ...user, ...newUserData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    // The data we want to make available to the rest of the app
    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {/* Don't render the rest of the app until we finish checking localStorage */}
            {!loading && children}
        </AuthContext.Provider>
    );
}
