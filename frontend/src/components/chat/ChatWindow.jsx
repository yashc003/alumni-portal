import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../hooks/useChat';

export function ChatWindow({ channelId }) {
    const { messages, isConnected, sendMessage } = useChat(channelId);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    // Auto-scroll when new messages arrive
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto-scroll to the newest message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Helper to format timestamps nicely
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Handle form submission using the WebSocket hook
    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !isConnected) return;
        
        sendMessage(newMessage);
        setNewMessage('');
    };

    if (!isConnected && messages.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mb-4"></div>
                <p>Connecting to chat...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-dark-surface">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                        <div className="text-4xl mb-4">💬</div>
                        <p>No messages yet. Be the first to say hello!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        // Check if the previous message was from the same user to group them
                        const isSameUserAsPrevious = index > 0 && messages[index - 1].sender.fullName === msg.sender.fullName;
                        
                        return (
                            <div key={msg.id} className={`flex ${isSameUserAsPrevious ? 'mt-1' : 'mt-6'}`}>
                                {/* Avatar */}
                                {!isSameUserAsPrevious ? (
                                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 text-white font-bold mr-3 shadow-sm">
                                        {msg.sender.fullName.charAt(0).toUpperCase()}
                                    </div>
                                ) : (
                                    <div className="w-10 mr-3 flex-shrink-0"></div> // Placeholder for alignment
                                )}
                                
                                {/* Message Content */}
                                <div>
                                    {!isSameUserAsPrevious && (
                                        <div className="flex items-baseline space-x-2 mb-1">
                                            <span className="font-semibold text-gray-200">{msg.sender.fullName}</span>
                                            <span className="text-xs text-gray-500">{formatTime(msg.timestamp)}</span>
                                        </div>
                                    )}
                                    <div className="text-gray-300 leading-relaxed bg-gray-800/50 p-2 rounded-lg rounded-tl-none inline-block">
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                {/* Invisible div to scroll to */}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-dark-bg/80 backdrop-blur-sm border-t border-gray-800">
                <form onSubmit={handleSend} className="flex space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 border border-gray-700 transition-shadow"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || !isConnected}
                        className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isConnected ? 'Send' : 'Connecting...'}
                    </button>
                </form>
            </div>
        </div>
    );
}
