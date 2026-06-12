import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

/*
 * ============================================================
 * 👤 EditProfileModal.jsx
 * ============================================================
 * A pop-up modal allowing users to edit their profile details.
 * It fetches the latest data on load and updates the global
 * AuthContext on save.
 * ============================================================
 */

export function EditProfileModal({ isOpen, onClose }) {
    const { user, updateUser } = useAuth();
    
    const [formData, setFormData] = useState({
        fullName: '',
        company: '',
        linkedinUrl: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Fetch full profile when modal opens
    useEffect(() => {
        if (isOpen) {
            setFetching(true);
            setError('');
            setSuccess(false);
            
            api.get('/api/users/me')
                .then(res => {
                    setFormData({
                        fullName: res.data.fullName || '',
                        company: res.data.company || '',
                        linkedinUrl: res.data.linkedinUrl || ''
                    });
                    setFetching(false);
                })
                .catch(err => {
                    console.error("Failed to fetch profile", err);
                    setError("Failed to load profile data.");
                    setFetching(false);
                });
        }
    }, [isOpen]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            await api.put('/api/users/me', formData);
            
            // Update global context so the navbar/sidebar reflects the new name
            updateUser({
                fullName: formData.fullName
            });
            
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1500);
            
        } catch (err) {
            setError(err.response?.data?.error || "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-dark-card border border-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
                
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-800 bg-gray-900/50">
                    <h2 className="text-lg font-bold text-white">Edit Profile</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-white transition-colors p-1 rounded-md hover:bg-gray-800"
                    >
                        ✕
                    </button>
                </div>
                
                {/* Body */}
                <div className="p-6">
                    {fetching ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            
                            {error && (
                                <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                    {error}
                                </div>
                            )}
                            
                            {success && (
                                <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                                    Profile updated successfully!
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-dark-bg border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Current Company</label>
                                <input
                                    type="text"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    placeholder="e.g. Google, Student"
                                    className="w-full bg-dark-bg border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">LinkedIn URL</label>
                                <input
                                    type="url"
                                    name="linkedinUrl"
                                    value={formData.linkedinUrl}
                                    onChange={handleChange}
                                    placeholder="https://linkedin.com/in/..."
                                    className="w-full bg-dark-bg border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                                />
                            </div>

                            <div className="pt-4 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <Button 
                                    type="submit"
                                    disabled={loading || success}
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
