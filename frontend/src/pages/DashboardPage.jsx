import React, { useState } from 'react';
import { ChannelList } from '../components/chat/ChannelList';
import { ChatWindow } from '../components/chat/ChatWindow';
import { DirectoryPage } from './DirectoryPage';
import { JobBoardPage } from './JobBoardPage';

/*
 * ============================================================
 * 📱 DashboardPage.jsx — The Main Layout
 * ============================================================
 * This page brings the ChannelList (Sidebar) and ChatWindow
 * together into a Discord-style layout.
 * ============================================================
 */

export function DashboardPage() {
    // We lift the state up to the parent so the Sidebar can tell
    // the ChatWindow which channel to display!
    const [activeChannelId, setActiveChannelId] = useState(null);
    const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'directory', 'jobs'

    return (
        <div className="flex h-screen bg-dark-bg text-white overflow-hidden font-sans">
            {/* Sidebar Component */}
            <ChannelList 
                activeChannelId={activeChannelId} 
                onChannelSelect={(id) => {
                    setActiveChannelId(id);
                    setActiveTab('chat');
                }}
                activeTab={activeTab}
                onTabSelect={setActiveTab}
            />
            
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col bg-dark-surface relative shadow-[-4px_0_15px_rgba(0,0,0,0.3)] z-0">
                {activeTab === 'directory' ? (
                    <DirectoryPage />
                ) : activeTab === 'jobs' ? (
                    <JobBoardPage />
                ) : activeChannelId ? (
                    <ChatWindow channelId={activeChannelId} />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-dark-surface">
                        <div className="text-6xl mb-4">👋</div>
                        <h2 className="text-2xl font-bold text-gray-300 mb-2">Welcome to the Alumni Portal</h2>
                        <p>Select a channel or feature from the sidebar to get started!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
