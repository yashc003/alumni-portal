import { useState, useEffect, useCallback } from 'react';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';
import api from '../api/axios';

/*
 * ============================================================
 * 🔌 useChat.js — The WebSocket Hook
 * ============================================================
 * This custom hook handles all the complicated WebSocket logic
 * so our UI components can stay clean.
 * ============================================================
 */

export function useChat(channelId) {
    const [messages, setMessages] = useState([]);
    const [stompClient, setStompClient] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    // 1. Fetch History AND Connect WebSocket when channel changes
    useEffect(() => {
        if (!channelId) return;

        // Reset state
        setMessages([]);
        setIsConnected(false);

        // Fetch History
        api.get(`/api/channels/${channelId}/messages`)
            .then(res => setMessages(res.data))
            .catch(err => console.error("Error fetching messages:", err));

        // Connect WebSocket
        const token = localStorage.getItem('token');
        
        // SockJS creates a WebSocket connection with HTTP fallbacks
        const socket = new SockJS('http://localhost:8080/ws');
        const client = Stomp.over(socket);

        // Turn off debug logging so it doesn't clutter the console
        client.debug = () => {};

        let isActive = true; // Track if the component is still mounted

        client.connect(
            { Authorization: `Bearer ${token}` }, // Send token in CONNECT frame
            () => {
                // If the component unmounted while we were connecting, drop it immediately!
                if (!isActive) {
                    client.disconnect();
                    return;
                }

                setIsConnected(true);
                // Subscribe to the channel topic
                client.subscribe(`/topic/channel/${channelId}`, (msg) => {
                    const newMsg = JSON.parse(msg.body);
                    setMessages(prev => {
                        // Prevent duplicate messages in the UI
                        if (prev.some(m => m.id === newMsg.id)) return prev;
                        return [...prev, newMsg];
                    });
                });
            },
            (error) => {
                if (!isActive) return;
                console.error("STOMP connection error:", error);
                setIsConnected(false);
            }
        );

        setStompClient(client);

        // Cleanup on unmount or channel change
        return () => {
            isActive = false; // Mark as unmounted
            if (client && client.connected) {
                client.disconnect();
            }
        };
    }, [channelId]);

    // 2. Send Message Function
    const sendMessage = useCallback((content) => {
        if (stompClient && isConnected && content.trim()) {
            stompClient.send(
                `/app/chat/${channelId}/sendMessage`,
                {},
                JSON.stringify({ content })
            );
        }
    }, [stompClient, isConnected, channelId]);

    return { messages, isConnected, sendMessage };
}
