package com.portal.config;

import com.portal.security.JwtTokenProvider;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import java.util.List;

import org.springframework.lang.NonNull;

/*
 * ============================================================
 * 🛡️ WebSocketAuthInterceptor.java
 * ============================================================
 * Our REST APIs are protected by JwtAuthenticationFilter, but
 * WebSockets bypass standard HTTP filters!
 * 
 * We use this interceptor to inspect the STOMP "CONNECT" message
 * and verify the JWT token before allowing the user to join the chat.
 * ============================================================
 */

@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtTokenProvider tokenProvider;
    private final UserDetailsService userDetailsService;

    // @Lazy prevents circular dependency issues during Spring Boot startup
    public WebSocketAuthInterceptor(JwtTokenProvider tokenProvider, @Lazy UserDetailsService userDetailsService) {
        this.tokenProvider = tokenProvider;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        // We only authenticate when the user FIRST tries to connect
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            
            // Extract the Authorization header from the STOMP message
            List<String> authorization = accessor.getNativeHeader("Authorization");
            
            if (authorization != null && !authorization.isEmpty()) {
                String authHeader = authorization.get(0);
                
                if (authHeader.startsWith("Bearer ")) {
                    String token = authHeader.substring(7);
                    
                    if (tokenProvider.validateToken(token)) {
                        // Token is valid! Load the user details
                        String email = tokenProvider.getUsernameFromToken(token);
                        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                        
                        // Create the authentication token and attach it to the WebSocket session
                        UsernamePasswordAuthenticationToken authentication = 
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                        
                        accessor.setUser(authentication);
                    }
                }
            }
        }
        
        // Return the message to continue processing
        return message;
    }
}
