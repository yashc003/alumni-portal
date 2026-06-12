import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PendingApprovalPage } from './pages/PendingApprovalPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';

/*
 * ============================================================
 * ⚛️ App.jsx — The Router
 * ============================================================
 * This is where we tell React which page to show based on the URL.
 * - /login    → Shows LoginPage
 * - /register → Shows RegisterPage
 * - /admin    → Shows AdminPage
 * ============================================================
 */

// 🛡️ A helper component to protect routes that require login
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    // Show a simple loading state while checking localStorage
    return <div className="min-h-screen flex items-center justify-center bg-dark-bg text-white">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    // If they aren't logged in, kick them back to the login page!
    return <Navigate to="/login" />;
  }
  
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* 🟢 Public Routes (Anyone can visit these) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/pending" element={<PendingApprovalPage />} />
      
      {/* 🔴 Protected Routes (Must be logged in) */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      
      {/* 👑 Admin Route */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    /* 
     * We wrap everything in AuthProvider so ALL pages can access
     * the login state.
     * 
     * We wrap it in BrowserRouter to enable URL navigation.
     */
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
