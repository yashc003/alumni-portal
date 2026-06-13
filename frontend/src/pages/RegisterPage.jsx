import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Users, Briefcase } from 'lucide-react';

/*
 * ============================================================
 * 📝 RegisterPage.jsx — Apply for an Account
 * ============================================================
 */

export function RegisterPage() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'ROLE_STUDENT',
        batchNumber: 1,
        company: '',
        linkedinUrl: ''
    });

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { register } = useAuth();
    const navigate = useNavigate();

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
            await register(formData);
            navigate('/pending');
        } catch (err) {
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
        <div className="min-h-screen flex bg-gray-50 text-gray-900">
            {/* Left side - Registration Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 overflow-y-auto">
                <div className="w-full max-w-md my-auto bg-white lg:bg-transparent p-8 lg:p-0 rounded-2xl shadow-sm border border-gray-200 lg:shadow-none lg:border-none">
                    <div className="mb-10">
                        <Link to="/login" className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-6 inline-block transition-colors">
                            ← Back to login
                        </Link>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Join the Network</h2>
                        <p className="text-gray-500">Apply for an account. An admin will review your request.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        
                        {/* Role Selection */}
                        <div className="flex gap-4 p-1 bg-gray-100 rounded-lg mb-6 border border-gray-200">
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, role: 'ROLE_STUDENT'})}
                                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${!isAlumni ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                            >
                                Student
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, role: 'ROLE_ALUMNI'})}
                                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${isAlumni ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                            >
                                Alumni
                            </button>
                        </div>

                        {/* Basic Info */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                required
                                value={formData.fullName}
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors shadow-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors shadow-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                name="password"
                                required
                                minLength="6"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors shadow-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                            <select
                                name="batchNumber"
                                value={formData.batchNumber}
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors shadow-sm"
                            >
                                {Array.from({ length: 100 }, (_, i) => i + 1).map(num => (
                                    <option key={num} value={num}>Batch {num}</option>
                                ))}
                            </select>
                        </div>

                        {/* CONDITIONAL RENDERING: Only show these if role == ROLE_ALUMNI */}
                        {isAlumni && (
                            <div className="space-y-4 p-4 border border-primary-200 bg-primary-50 rounded-lg">
                                <h3 className="text-sm font-semibold text-primary-700 uppercase tracking-wider">Alumni Details</h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Company</label>
                                    <input
                                        type="text"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleChange}
                                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile</label>
                                    <input
                                        type="url"
                                        name="linkedinUrl"
                                        value={formData.linkedinUrl}
                                        onChange={handleChange}
                                        placeholder="https://linkedin.com/in/..."
                                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors shadow-sm"
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
            <div className="hidden lg:flex lg:w-1/2 bg-white border-l border-gray-200 relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tl from-primary-50/50 to-transparent"></div>
                <div className="relative z-10 p-12 max-w-lg text-center">
                    <div className="grid grid-cols-2 gap-6 mb-12">
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm transform rotate-[-3deg] flex flex-col items-center">
                            <div className="text-primary-600 mb-3 bg-primary-50 p-3 rounded-full">
                                <Users size={28} />
                            </div>
                            <h3 className="text-gray-900 font-semibold mb-1">Network</h3>
                            <p className="text-gray-500 text-sm">Connect with alumni worldwide</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm transform rotate-[3deg] translate-y-4 flex flex-col items-center">
                            <div className="text-primary-600 mb-3 bg-primary-50 p-3 rounded-full">
                                <Briefcase size={28} />
                            </div>
                            <h3 className="text-gray-900 font-semibold mb-1">Careers</h3>
                            <p className="text-gray-500 text-sm">Find mentorship and jobs</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
