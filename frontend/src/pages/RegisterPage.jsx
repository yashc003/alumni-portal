import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

/*
 * ============================================================
 * 📝 RegisterPage.jsx — Apply for an Account
 * ============================================================
 * This page captures all the fields required by our backend's
 * RegisterRequest DTO. 
 * 
 * Notice how some fields (like 'company') only show up if the
 * user selects the "ROLE_ALUMNI" role. This is called "conditional rendering."
 * ============================================================
 */

export function RegisterPage() {
    // We store all form fields in one big state object to keep it organized
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'ROLE_STUDENT', // Default to student
        batchNumber: 1,
        company: '',
        linkedinUrl: ''
    });

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { register } = useAuth();
    const navigate = useNavigate();

    // Helper function to update just one field in the formData object
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // We pass the entire formData object to our register function
            await register(formData);
            
            // Registration successful! But remember, they are PENDING.
            // We send them to the pending page to explain they must wait.
            navigate('/pending');
        } catch (err) {
            // Display backend validation errors (e.g., "Email already registered")
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const isAlumni = formData.role === 'ROLE_ALUMNI';

    return (
        <div className="min-h-screen flex bg-dark-bg text-slate-200">
            {/* Left side - Registration Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 overflow-y-auto">
                <div className="w-full max-w-md my-auto">
                    <div className="mb-10">
                        <Link to="/login" className="text-primary-400 hover:text-primary-300 text-sm font-medium mb-6 inline-block transition-colors">
                            ← Back to login
                        </Link>
                        <h2 className="text-3xl font-bold text-white mb-2">Join the Network</h2>
                        <p className="text-slate-400">Apply for an account. An admin will review your request.</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        
                        {/* Role Selection (Radio Buttons) */}
                        <div className="flex gap-4 p-1 bg-dark-surface rounded-lg mb-6 border border-dark-border">
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, role: 'ROLE_STUDENT'})}
                                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${!isAlumni ? 'bg-primary-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
                            >
                                Student
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, role: 'ROLE_ALUMNI'})}
                                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${isAlumni ? 'bg-primary-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
                            >
                                Alumni
                            </button>
                        </div>

                        {/* Basic Info */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                required
                                value={formData.fullName}
                                onChange={handleChange}
                                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                            <input
                                type="password"
                                name="password"
                                required
                                minLength="6"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Batch Number</label>
                            <select
                                name="batchNumber"
                                value={formData.batchNumber}
                                onChange={handleChange}
                                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors custom-scrollbar"
                            >
                                {Array.from({ length: 100 }, (_, i) => i + 1).map(num => (
                                    <option key={num} value={num}>Batch {num}</option>
                                ))}
                            </select>
                        </div>

                        {/* CONDITIONAL RENDERING: Only show these if role == ROLE_ALUMNI */}
                        {isAlumni && (
                            <div className="space-y-4 p-4 border border-primary-500/30 bg-primary-500/5 rounded-lg">
                                <h3 className="text-sm font-semibold text-primary-400 uppercase tracking-wider">Alumni Details</h3>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Current Company</label>
                                    <input
                                        type="text"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleChange}
                                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">LinkedIn Profile</label>
                                    <input
                                        type="url"
                                        name="linkedinUrl"
                                        value={formData.linkedinUrl}
                                        onChange={handleChange}
                                        placeholder="https://linkedin.com/in/..."
                                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                                    />
                                </div>
                            </div>
                        )}

                        <Button 
                            type="submit" 
                            className="w-full mt-4"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Submitting Application...' : 'Apply for Account'}
                        </Button>
                    </form>
                </div>
            </div>

            {/* Right side - Decorative Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-dark-surface border-l border-dark-border relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tl from-primary-900/40 to-transparent"></div>
                <div className="relative z-10 p-12 max-w-lg text-center">
                    <div className="grid grid-cols-2 gap-6 mb-12">
                        <div className="bg-dark-bg p-6 rounded-2xl border border-dark-border shadow-lg transform rotate-[-3deg]">
                            <div className="text-primary-400 text-3xl mb-3">🤝</div>
                            <h3 className="text-white font-semibold mb-1">Network</h3>
                            <p className="text-slate-400 text-sm">Connect with alumni worldwide</p>
                        </div>
                        <div className="bg-dark-bg p-6 rounded-2xl border border-dark-border shadow-lg transform rotate-[3deg] translate-y-4">
                            <div className="text-primary-400 text-3xl mb-3">💼</div>
                            <h3 className="text-white font-semibold mb-1">Careers</h3>
                            <p className="text-slate-400 text-sm">Find mentorship and jobs</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
