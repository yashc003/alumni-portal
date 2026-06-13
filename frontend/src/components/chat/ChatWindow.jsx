import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../hooks/useChat';
import { MessageSquare, Send } from 'lucide-react';

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

    // Helper to format date for the divider
    const formatDateDivider = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        }
    };

    // Helper to check if two dates are on the same day
    const isSameDay = (date1, date2) => {
        return new Date(date1).toDateString() === new Date(date2).toDateString();
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
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-white">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mb-4"></div>
                <p>Connecting to chat...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-white">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                        <MessageSquare size={48} className="text-gray-300 mb-4" />
                        <p>No messages yet. Be the first to say hello!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        // Check if this message is on a new day compared to the previous one
                        const isNewDay = index === 0 || !isSameDay(messages[index - 1].timestamp, msg.timestamp);
                        
                        // Check if the previous message was from the same user to group them
                        // Break the group if it's a new day, even if it's the same user
                        const isSameUserAsPrevious = !isNewDay && index > 0 && messages[index - 1].sender.fullName === msg.sender.fullName;
                        
                        return (
                            <React.Fragment key={msg.id}>
                                {isNewDay && (
                                    <div className="flex items-center justify-center my-6">
                                        <div className="flex-grow border-t border-gray-200"></div>
                                        <span className="flex-shrink-0 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            {formatDateDivider(msg.timestamp)}
                                        </span>
                                        <div className="flex-grow border-t border-gray-200"></div>
                                    </div>
                                )}
                                <div className={`flex ${isSameUserAsPrevious ? 'mt-1' : 'mt-6'}`}>
                                    {/* Avatar */}
                                    {!isSameUserAsPrevious ? (
                                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 text-primary-700 font-bold mr-3 shadow-sm border border-primary-200 overflow-hidden">
                                            {msg.sender.profileImage ? (
                                                <img src={msg.sender.profileImage} alt={msg.sender.fullName} className="w-full h-full object-cover" />
                                            ) : (
                                                msg.sender.fullName.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-10 mr-3 flex-shrink-0"></div> // Placeholder for alignment
                                    )}
                                    
                                    {/* Message Content */}
                                    <div>
                                        {!isSameUserAsPrevious && (
                                            <div className="flex items-baseline space-x-2 mb-1">
                                                <span className="font-semibold text-gray-900">{msg.sender.fullName}</span>
                                                <span className="text-xs text-gray-500">{formatTime(msg.timestamp)}</span>
                                            </div>
                                        )}
                                        <div className="text-gray-800 leading-relaxed bg-gray-50 border border-gray-100 p-2.5 rounded-lg rounded-tl-none inline-block shadow-sm break-words max-w-[calc(100vw-120px)] sm:max-w-2xl">
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    })
                )}
                {/* Invisible div to scroll to */}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200">
                <form onSubmit={handleSend} className="flex space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 bg-gray-50 text-gray-900 rounded-lg px-4 py-3 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 border border-gray-300 transition-all shadow-sm"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || !isConnected}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center"
                    >
                        {isConnected ? (
                            <>
                                <Send size={18} className="mr-2" /> Send
                            </>
                        ) : 'Connecting...'}
                    </button>
                </form>
            </div>
        </div>
    );
}
