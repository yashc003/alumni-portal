import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

/*
 * ============================================================
 * 🚪 LoginPage.jsx — Welcome Back
 * ============================================================
 * This page captures the user's email and password, calls the login
 * function from our AuthContext, and handles any errors (like wrong
 * password or "account pending" 403 errors).
 * 
 * We use a split-panel design for a premium feel.
 * ============================================================
 */

export function LoginPage() {
    // React State variables to hold the form inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Hooks from React Router and our custom AuthContext
    const { login } = useAuth();
    const navigate = useNavigate();

    // 🚀 Handles the form submission
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevents the browser from reloading the page
        setError('');
        setIsLoading(true);

        try {
            // Call the login function we wrote in AuthContext
            const user = await login(email, password);
            
            // Redirect based on role
            if (user.role === 'ROLE_ADMIN') {
                navigate('/admin');
            } else {
                // For now we redirect to a placeholder dashboard
                navigate('/'); 
            }
        } catch (err) {
            // Axios stores the backend's JSON response inside err.response.data
            if (err.response && err.response.data && err.response.data.error) {
                const backendError = err.response.data.error;
                
                // If it's the 403 Forbidden "not approved" error, redirect them
                if (backendError.includes('not approved')) {
                    navigate('/pending');
                } else {
                    setError(backendError); // Show "Invalid email or password"
                }
            } else {
                setError('Failed to connect to the server. Is the backend running?');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-dark-bg text-slate-200">
            {/* Left side - Decorative Panel (Hidden on small screens) */}
            <div className="hidden lg:flex lg:w-1/2 bg-dark-surface border-r border-dark-border relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 to-transparent"></div>
                <div className="relative z-10 p-12 max-w-lg text-center">
                    <div className="w-20 h-20 bg-primary-500/20 text-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-8 text-4xl shadow-xl shadow-primary-500/10">
                        🎓
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
                        Welcome back to your<br />Alumni Network
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Connect with peers, get code help, and stay updated with your university community.
                    </p>
                </div>
            </div>

            {/* Right side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
                <div className="w-full max-w-md">
                    <div className="text-center lg:text-left mb-10">
                        <h2 className="text-3xl font-bold text-white mb-2">Sign In</h2>
                        <p className="text-slate-400">Please enter your details to continue.</p>
                    </div>

                    {/* Error Message Display */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                                placeholder="john@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                                placeholder="••••••••"
                            />
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full mt-8"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>

                    <p className="text-center text-slate-400 mt-8">
                        Don't have an account yet?{' '}
                        <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                            Apply here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
