import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { X, User as UserIcon, Mail, Briefcase, GraduationCap, Link as LinkIcon, Info, Image as ImageIcon } from 'lucide-react';

/*
 * ============================================================
 * 👤 EditProfileModal.jsx
 * ============================================================
 */

export function EditProfileModal({ isOpen, onClose }) {
    const { user, updateUser } = useAuth();

    const [formData, setFormData] = useState({
        fullName: '',
        company: '',
        linkedinUrl: '',
        profileImage: '',
        bio: ''
    });

    // Read-only data
    const [userData, setUserData] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFetching(true);
            setError('');
            setSuccess(false);

            api.get('/api/users/me')
                .then(res => {
                    setUserData(res.data);
                    setFormData({
                        fullName: res.data.fullName || '',
                        company: res.data.company || '',
                        linkedinUrl: res.data.linkedinUrl || '',
                        profileImage: res.data.profileImage || '',
                        bio: res.data.bio || ''
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB
                setError('File size must be less than 2MB');
                e.target.value = ''; // clear input
                setSelectedFile(null);
            } else {
                setError('');
                setSelectedFile(file);
                // Create a temporary local preview URL
                setFormData(prev => ({ ...prev, profileImage: URL.createObjectURL(file) }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.put('/api/users/me', formData);

            let updatedImageUrl = formData.profileImage;

            // If file selected, upload it
            if (selectedFile) {
                const fileData = new FormData();
                fileData.append('file', selectedFile);

                const uploadRes = await api.post('/api/users/me/avatar', fileData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                updatedImageUrl = uploadRes.data.profileImage;
            }

            updateUser({
                fullName: formData.fullName,
                profileImage: updatedImageUrl
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white border border-gray-200 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up my-8">

                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-900">Your Profile</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-md hover:bg-gray-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    {fetching ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                            {/* Left Column: Read-Only Info & Avatar */}
                            <div className="md:col-span-1 space-y-6">
                                <div className="text-center">
                                    <div className="w-24 h-24 mx-auto rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-3xl shadow-sm border border-primary-200 overflow-hidden">
                                        {formData.profileImage ? (
                                            <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            userData?.fullName?.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <h3 className="mt-3 font-bold text-gray-900">{userData?.fullName}</h3>
                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${userData?.role === 'ROLE_ADMIN' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                            userData?.role === 'ROLE_ALUMNI' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                'bg-blue-50 text-blue-700 border-blue-200'
                                        }`}>
                                        {userData?.role?.replace('ROLE_', '')}
                                    </span>
                                </div>

                                <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <div>
                                        <div className="text-xs text-gray-500 font-medium flex items-center mb-1">
                                            <Mail size={12} className="mr-1" /> Email Address
                                        </div>
                                        <div className="text-sm font-medium text-gray-900 truncate" title={userData?.email}>{userData?.email}</div>
                                    </div>

                                    <div>
                                        <div className="text-xs text-gray-500 font-medium flex items-center mb-1">
                                            <GraduationCap size={12} className="mr-1" /> Batch Number
                                        </div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {userData?.batchNumber || 'Not specified'}
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-0.5">Batch number cannot be changed.</p>
                                    </div>

                                    <div>
                                        <div className="text-xs text-gray-500 font-medium flex items-center mb-1">
                                            <Info size={12} className="mr-1" /> Account Status
                                        </div>
                                        <div className="text-sm font-medium text-gray-900">{userData?.accountStatus}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Editable Form */}
                            <div className="md:col-span-2">
                                <form onSubmit={handleSubmit} className="space-y-4">

                                    {error && (
                                        <div className="p-3 rounded bg-red-50 border border-red-200 text-red-600 text-sm">
                                            {error}
                                        </div>
                                    )}

                                    {success && (
                                        <div className="p-3 rounded bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm">
                                            Profile updated successfully!
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                            <UserIcon size={14} className="mr-1.5 text-gray-400" /> Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors shadow-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                            <ImageIcon size={14} className="mr-1.5 text-gray-400" /> Profile Picture
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors shadow-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Max size: 2MB. Only images allowed.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                            <Briefcase size={14} className="mr-1.5 text-gray-400" /> Current Company
                                        </label>
                                        <input
                                            type="text"
                                            name="company"
                                            value={formData.company}
                                            onChange={handleChange}
                                            placeholder="e.g. Google, Student"
                                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors shadow-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                            <LinkIcon size={14} className="mr-1.5 text-gray-400" /> LinkedIn URL
                                        </label>
                                        <input
                                            type="url"
                                            name="linkedinUrl"
                                            value={formData.linkedinUrl}
                                            onChange={handleChange}
                                            placeholder="https://linkedin.com/in/..."
                                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors shadow-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                            <Info size={14} className="mr-1.5 text-gray-400" /> Bio
                                        </label>
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            rows="3"
                                            placeholder="Tell us a little about yourself..."
                                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors shadow-sm resize-none custom-scrollbar"
                                        ></textarea>
                                    </div>

                                    <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
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
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
