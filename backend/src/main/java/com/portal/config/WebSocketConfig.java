package com.portal.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.lang.NonNull;

/*
 * ============================================================
 * 🔌 WebSocketConfig.java — The Real-Time Engine
 * ============================================================
 * This configures our STOMP (Simple Text Oriented Messaging Protocol) broker.
 * Think of it as a post office that instantly routes messages
 * between users without them having to refresh the page.
 * ============================================================
 */

@Configuration
@EnableWebSocketMessageBroker // Turns on WebSocket support
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketAuthInterceptor authInterceptor;

    public WebSocketConfig(WebSocketAuthInterceptor authInterceptor) {
        this.authInterceptor = authInterceptor;
    }

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry config) {
        // Broadcasts messages to any client subscribed to endpoints starting with "/topic"
        // (e.g., "/topic/channel/1" for channel 1's chatroom)
        config.enableSimpleBroker("/topic");
        
        // Routes messages sent FROM clients starting with "/app" to our @MessageMapping controllers
        // (e.g., client sends to "/app/chat", it goes to ChatController)
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        // The URL the React frontend uses to establish the initial connection
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // Allows React to connect across ports
                .withSockJS(); // Fallback for browsers that don't fully support WebSockets
    }

    @Override
    public void configureClientInboundChannel(@NonNull ChannelRegistration registration) {
        // Add our security interceptor to verify JWT tokens
        registration.interceptors(authInterceptor);
    }
}
