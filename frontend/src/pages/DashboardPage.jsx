import React, { useState } from 'react';
import { ChannelList } from '../components/chat/ChannelList';
import { ChatWindow } from '../components/chat/ChatWindow';
import { DirectoryPage } from './DirectoryPage';
import { JobBoardPage } from './JobBoardPage';
import { Hand } from 'lucide-react';

/*
 * ============================================================
 * 📱 DashboardPage.jsx — The Main Layout
 * ============================================================
 */

export function DashboardPage() {
    const [activeChannelId, setActiveChannelId] = useState(null);
    const [activeTab, setActiveTab] = useState('chat');

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden font-sans">
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
            <div className="flex-1 flex flex-col bg-white relative shadow-[-4px_0_15px_rgba(0,0,0,0.03)] z-0">
                {activeTab === 'directory' ? (
                    <DirectoryPage onInitiateDM={(channelId) => {
                        setActiveChannelId(channelId);
                        setActiveTab('chat');
                    }} />
                ) : activeTab === 'jobs' ? (
                    <JobBoardPage />
                ) : activeChannelId ? (
                    <ChatWindow 
                        channelId={activeChannelId} 
                        onInitiateDM={(channelId) => {
                            setActiveChannelId(channelId);
                            setActiveTab('chat');
                        }}
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-white">
                        <div className="text-primary-500 mb-4 bg-primary-50 p-4 rounded-full">
                            <Hand size={48} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to the Alumni Portal</h2>
                        <p>Select a channel or feature from the sidebar to get started!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
