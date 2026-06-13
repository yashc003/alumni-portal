import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { EditProfileModal } from '../profile/EditProfileModal';
import { Shield, Globe, Briefcase, Hash, LogOut, MessageSquare } from 'lucide-react';

export function ChannelList({ activeChannelId, onChannelSelect, activeTab, onTabSelect }) {
    const [channels, setChannels] = useState([]);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const { logout, user } = useAuth();

    useEffect(() => {
        api.get('/api/channels')
            .then(res => {
                setChannels(res.data);
                if (res.data.length > 0 && !activeChannelId) {
                    onChannelSelect(res.data[0].id);
                }
            })
            .catch(err => console.error("Error fetching channels:", err));
    }, [activeChannelId, onChannelSelect]);

    return (
        <div className="w-64 bg-gray-50 flex flex-col h-full border-r border-gray-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 shadow-sm z-10 bg-white">
                <h2 className="text-xl font-bold text-primary-600">Alumni Portal</h2>
                <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                    {user?.role === 'ROLE_ADMIN' ? 'Admin Dashboard' : user?.role === 'ROLE_ALUMNI' ? 'Alumni Dashboard' : 'Student Dashboard'}
                </span>
                
                {user?.role === 'ROLE_ADMIN' && (
                    <div className="mt-3">
                        <Link to="/admin" className="text-xs flex items-center justify-center bg-white hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded transition-colors border border-gray-300 shadow-sm">
                            <Shield size={14} className="mr-1.5 text-primary-600" /> Back to Admin Panel
                        </Link>
                    </div>
                )}
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col bg-gray-50">
                {/* Networking Navigation */}
                <div className="p-3 pb-0 space-y-1">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                        Networking
                    </h3>
                    <button
                        onClick={() => onTabSelect('directory')}
                        className={`w-full text-left px-3 py-2 rounded-md transition-all duration-200 flex items-center group ${
                            activeTab === 'directory' 
                                ? 'bg-primary-100 text-primary-700 font-medium' 
                                : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                        }`}
                    >
                        <Globe size={18} className="mr-2 opacity-80" />
                        <span>Network Directory</span>
                    </button>
                    <button
                        onClick={() => onTabSelect('jobs')}
                        className={`w-full text-left px-3 py-2 rounded-md transition-all duration-200 flex items-center group ${
                            activeTab === 'jobs' 
                                ? 'bg-primary-100 text-primary-700 font-medium' 
                                : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                        }`}
                    >
                        <Briefcase size={18} className="mr-2 opacity-80" />
                        <span>Job Board</span>
                    </button>
                </div>

                {/* Public Channels List */}
                <div className="p-3 space-y-1 mt-2 border-t border-gray-200 pt-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                        Text Channels
                    </h3>
                    {channels.filter(c => !c.isDirectMessage).map(channel => (
                        <button
                            key={channel.id}
                            onClick={() => onChannelSelect(channel.id)}
                            className={`w-full text-left px-3 py-2 rounded-md transition-all duration-200 flex items-center group ${
                                activeChannelId === channel.id && activeTab === 'chat'
                                    ? 'bg-primary-100 text-primary-700 font-medium' 
                                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                            }`}
                        >
                            <Hash size={18} className={`mr-2 flex-shrink-0 ${activeChannelId === channel.id && activeTab === 'chat' ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                            <span className="truncate">{channel.name}</span>
                        </button>
                    ))}
                </div>

                {/* Direct Messages List */}
                <div className="p-3 space-y-1 border-t border-gray-200 pt-4 pb-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                        Direct Messages
                    </h3>
                    {channels.filter(c => c.isDirectMessage).length === 0 ? (
                        <div className="px-3 text-xs text-gray-400 italic">No direct messages yet</div>
                    ) : (
                        channels.filter(c => c.isDirectMessage).map(channel => {
                            // Find the other user
                            const otherUser = channel.user1?.email === user?.email ? channel.user2 : channel.user1;
                            if (!otherUser) return null;

                            return (
                                <button
                                    key={channel.id}
                                    onClick={() => onChannelSelect(channel.id)}
                                    className={`w-full text-left px-3 py-2 rounded-md transition-all duration-200 flex items-center group ${
                                        activeChannelId === channel.id && activeTab === 'chat'
                                            ? 'bg-primary-100 text-primary-700 font-medium' 
                                            : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                                    }`}
                                >
                                    <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 text-primary-700 text-[10px] font-bold mr-2.5 overflow-hidden">
                                        {otherUser.profileImage ? (
                                            <img src={otherUser.profileImage} alt={otherUser.fullName} className="w-full h-full object-cover" />
                                        ) : (
                                            otherUser.fullName.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <span className="truncate">{otherUser.fullName}</span>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* User Profile / Logout Area (Fixed to bottom) */}
            <div className="p-4 bg-white border-t border-gray-200 flex items-center justify-between shadow-sm z-10">
                <button 
                    onClick={() => setIsProfileModalOpen(true)}
                    className="flex items-center space-x-3 overflow-hidden text-left hover:bg-gray-50 p-1.5 -ml-1.5 rounded-lg transition-colors flex-1 border border-transparent hover:border-gray-200"
                    title="Edit Profile"
                >
                    <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold flex-shrink-0 text-white shadow-sm overflow-hidden">
                        {user?.profileImage ? (
                            <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            user?.fullName?.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div className="truncate flex flex-col">
                        <span className="text-sm font-semibold text-gray-900 truncate">{user?.fullName}</span>
                        <span className="text-xs text-primary-600 truncate hover:underline">Edit Profile</span>
                    </div>
                </button>
                <button 
                    onClick={logout}
                    className="ml-2 text-gray-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-md transition-colors border border-transparent hover:border-red-100"
                    title="Log Out"
                >
                    <LogOut size={20} />
                </button>
            </div>
            
            <EditProfileModal 
                isOpen={isProfileModalOpen} 
                onClose={() => setIsProfileModalOpen(false)} 
            />
        </div>
    );
}
