import React from 'react';
import { X, Mail, Briefcase, GraduationCap, Link as LinkIcon, Info, MessageSquare } from 'lucide-react';
import { Button } from '../ui/Button';

export function UserProfileModal({ isOpen, onClose, user, onMessage }) {
    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white border border-gray-200 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up my-8">
                {/* Header Banner */}
                <div className="h-24 bg-gradient-to-r from-primary-100 to-indigo-100 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm text-gray-600 hover:text-gray-900 transition-colors p-1.5 rounded-full shadow-sm hover:bg-white"
                    >
                        <X size={18} />
                    </button>
                    <div className="absolute -bottom-10 left-6">
                        <div className="w-20 h-20 rounded-xl bg-primary-600 flex items-center justify-center text-3xl font-bold text-white shadow-md border-4 border-white overflow-hidden">
                            {user.profileImage ? (
                                <img src={user.profileImage} alt={user.fullName} className="w-full h-full object-cover" />
                            ) : (
                                user.fullName?.charAt(0).toUpperCase()
                            )}
                        </div>
                    </div>
                    {/* Role Badge */}
                    <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm text-[10px] font-bold text-gray-700 px-2 py-1 rounded shadow-sm uppercase tracking-wider">
                        {user.role?.replace('ROLE_', '') || 'User'}
                    </div>
                </div>

                {/* Body */}
                <div className="pt-14 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{user.fullName}</h3>
                    
                    <div className="space-y-4 mt-6">
                        {user.company && (
                            <div className="flex items-start">
                                <Briefcase size={16} className="mr-3 text-gray-400 mt-0.5" />
                                <div>
                                    <div className="text-xs text-gray-500 font-medium mb-0.5">Company / Role</div>
                                    <div className="text-sm font-medium text-gray-900">{user.company}</div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-start">
                            <GraduationCap size={16} className="mr-3 text-gray-400 mt-0.5" />
                            <div>
                                <div className="text-xs text-gray-500 font-medium mb-0.5">Batch</div>
                                <div className="text-sm font-medium text-gray-900">
                                    {user.batchNumber ? `Batch ${user.batchNumber}` : 'Not specified'}
                                </div>
                            </div>
                        </div>

                        {user.email && (
                            <div className="flex items-start">
                                <Mail size={16} className="mr-3 text-gray-400 mt-0.5" />
                                <div>
                                    <div className="text-xs text-gray-500 font-medium mb-0.5">Email</div>
                                    <a href={`mailto:${user.email}`} className="text-sm font-medium text-primary-600 hover:underline">{user.email}</a>
                                </div>
                            </div>
                        )}

                        {user.linkedinUrl && (
                            <div className="flex items-start">
                                <LinkIcon size={16} className="mr-3 text-gray-400 mt-0.5" />
                                <div>
                                    <div className="text-xs text-gray-500 font-medium mb-0.5">LinkedIn</div>
                                    <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary-600 hover:underline truncate block max-w-[250px]">
                                        {user.linkedinUrl}
                                    </a>
                                </div>
                            </div>
                        )}

                        {user.bio && (
                            <div className="flex items-start pt-2 border-t border-gray-100">
                                <Info size={16} className="mr-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <div className="text-xs text-gray-500 font-medium mb-1">About</div>
                                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{user.bio}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <Button 
                        onClick={() => {
                            onClose();
                            onMessage(user.id);
                        }}
                        className="w-full flex items-center justify-center"
                    >
                        <MessageSquare size={16} className="mr-2" />
                        Message {user.fullName.split(' ')[0]}
                    </Button>
                </div>
            </div>
        </div>
    );
}
