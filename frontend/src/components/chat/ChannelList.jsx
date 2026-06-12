import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { EditProfileModal } from '../profile/EditProfileModal';

export function ChannelList({ activeChannelId, onChannelSelect, activeTab, onTabSelect }) {
    const [channels, setChannels] = useState([]);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const { logout, user } = useAuth();

    useEffect(() => {
        // We use our custom 'api' instance so the JWT token is sent automatically
        api.get('/api/channels')
            .then(res => {
                setChannels(res.data);
                // Auto-select the first channel if none is currently selected
                if (res.data.length > 0 && !activeChannelId) {
                    onChannelSelect(res.data[0].id);
                }
            })
            .catch(err => console.error("Error fetching channels:", err));
    }, [activeChannelId, onChannelSelect]);

    return (
        <div className="w-64 bg-dark-card flex flex-col h-full border-r border-gray-800">
            {/* Header */}
            <div className="p-4 border-b border-gray-800 shadow-sm z-10">
                <h2 className="text-xl font-bold text-primary-500">Alumni Portal</h2>
                <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                    {user?.role === 'ROLE_ADMIN' ? 'Admin Dashboard' : user?.role === 'ROLE_ALUMNI' ? 'Alumni Dashboard' : 'Student Dashboard'}
                </span>
                
                {user?.role === 'ROLE_ADMIN' && (
                    <div className="mt-3">
                        <Link to="/admin" className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded transition-colors inline-block border border-gray-700">
                            🛡️ Back to Admin Panel
                        </Link>
                    </div>
                )}
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                {/* Networking Navigation */}
                <div className="p-3 pb-0 space-y-1">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                        Networking
                    </h3>
                    <button
                        onClick={() => onTabSelect('directory')}
                        className={`w-full text-left px-3 py-2 rounded-md transition-all duration-200 flex items-center group ${
                            activeTab === 'directory' 
                                ? 'bg-primary-500/20 text-primary-400 font-medium' 
                                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                        }`}
                    >
                        <span className="text-xl mr-2 opacity-80">🌐</span>
                        <span>Alumni Directory</span>
                    </button>
                    <button
                        onClick={() => onTabSelect('jobs')}
                        className={`w-full text-left px-3 py-2 rounded-md transition-all duration-200 flex items-center group ${
                            activeTab === 'jobs' 
                                ? 'bg-primary-500/20 text-primary-400 font-medium' 
                                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                        }`}
                    >
                        <span className="text-xl mr-2 opacity-80">💼</span>
                        <span>Job Board</span>
                    </button>
                </div>

                {/* Channels List */}
                <div className="p-3 space-y-1 mt-2 border-t border-gray-800/50 pt-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                        Text Channels
                    </h3>
                    {channels.map(channel => (
                        <button
                            key={channel.id}
                            onClick={() => onChannelSelect(channel.id)}
                            className={`w-full text-left px-3 py-2 rounded-md transition-all duration-200 flex items-center group ${
                                activeChannelId === channel.id && activeTab === 'chat'
                                    ? 'bg-primary-500/20 text-primary-400 font-medium' 
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                            }`}
                        >
                            <span className={`text-xl mr-2 ${activeChannelId === channel.id && activeTab === 'chat' ? 'text-primary-500' : 'text-gray-600 group-hover:text-gray-400'}`}>#</span>
                            <span className="truncate">{channel.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* User Profile / Logout Area (Fixed to bottom) */}
            <div className="p-4 bg-gray-900 border-t border-gray-800 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <button 
                    onClick={() => setIsProfileModalOpen(true)}
                    className="flex items-center space-x-3 overflow-hidden text-left hover:bg-gray-800 p-1.5 -ml-1.5 rounded-lg transition-colors flex-1"
                    title="Edit Profile"
                >
                    <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold flex-shrink-0 text-white shadow-md">
                        {user?.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate flex flex-col">
                        <span className="text-sm font-semibold text-gray-200 truncate">{user?.fullName}</span>
                        <span className="text-xs text-primary-400 truncate hover:underline">Edit Profile</span>
                    </div>
                </button>
                <button 
                    onClick={logout}
                    className="ml-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 p-2 rounded-md transition-colors"
                    title="Log Out"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </button>
            </div>
            
            <EditProfileModal 
                isOpen={isProfileModalOpen} 
                onClose={() => setIsProfileModalOpen(false)} 
            />
        </div>
    );
}
