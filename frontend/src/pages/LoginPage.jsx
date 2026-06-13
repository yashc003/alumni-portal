import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { GraduationCap } from 'lucide-react';

/*
 * ============================================================
 * 🚪 LoginPage.jsx — Welcome Back
 * ============================================================
 * This page captures the user's email and password, calls the login
 * function from our AuthContext, and handles any errors.
 * 
 * We use a split-panel design for a premium feel.
 * ============================================================
 */

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const user = await login(email, password);
            if (user.role === 'ROLE_ADMIN') {
                navigate('/admin');
            } else {
                navigate('/'); 
            }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
                const backendError = err.response.data.error;
                if (backendError.includes('not approved')) {
                    navigate('/pending');
                } else {
                    setError(backendError);
                }
            } else {
                setError('Failed to connect to the server. Is the backend running?');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50 text-gray-900">
            {/* Left side - Decorative Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-white border-r border-gray-200 relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent"></div>
                <div className="relative z-10 p-12 max-w-lg text-center">
                    <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm border border-primary-100">
                        <GraduationCap size={40} strokeWidth={1.5} />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                        Welcome back to your<br />Alumni Network
                    </h1>
                    <p className="text-gray-500 text-lg">
                        Connect with peers, explore opportunities, and stay updated with your university community.
                    </p>
                </div>
            </div>

            {/* Right side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
                <div className="w-full max-w-md bg-white lg:bg-transparent p-8 lg:p-0 rounded-2xl shadow-sm border border-gray-200 lg:shadow-none lg:border-none">
                    <div className="text-center lg:text-left mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
                        <p className="text-gray-500">Please enter your details to continue.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm"
                                placeholder="john@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm"
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

                    <p className="text-center text-gray-500 mt-8">
                        Don't have an account yet?{' '}
                        <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
                            Apply here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
