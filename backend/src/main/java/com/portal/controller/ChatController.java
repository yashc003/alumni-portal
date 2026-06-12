package com.portal.controller;

import com.portal.model.Channel;
import com.portal.model.ChatMessage;
import com.portal.model.User;
import com.portal.repository.ChannelRepository;
import com.portal.repository.ChatMessageRepository;
import com.portal.repository.UserRepository;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.Map;

/*
 * ============================================================
 * 💬 ChatController.java — Handling Chat Data
 * ============================================================
 * This controller handles both standard REST API calls (to fetch history)
 * AND WebSocket messages (real-time chat).
 * ============================================================
 */

@RestController
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository messageRepository;
    private final ChannelRepository channelRepository;
    private final UserRepository userRepository;

    public ChatController(SimpMessagingTemplate messagingTemplate, 
                          ChatMessageRepository messageRepository, 
                          ChannelRepository channelRepository,
                          UserRepository userRepository) {
        this.messagingTemplate = messagingTemplate;
        this.messageRepository = messageRepository;
        this.channelRepository = channelRepository;
        this.userRepository = userRepository;
    }

    // --------------------------------------------------------
    // 🌐 STANDARD REST APIs
    // --------------------------------------------------------
    
    // Get the list of all available channels (e.g., #general)
    @GetMapping("/api/channels")
    public List<Channel> getAllChannels(Principal principal) {
        // Return all channels (batch channels and jobs are deprecated)
        return channelRepository.findAll();
    }

    // Load the chat history when a user clicks on a channel
    @GetMapping("/api/channels/{channelId}/messages")
    public List<ChatMessage> getChatHistory(@PathVariable Long channelId) {
        return messageRepository.findByChannelIdOrderByTimestampAsc(channelId);
    }


    // --------------------------------------------------------
    // 🔌 WEBSOCKET ENDPOINT (@MessageMapping)
    // --------------------------------------------------------
    
    /*
     * React sends real-time messages to: /app/chat/{channelId}/sendMessage
     * 
     * @Payload extracts the JSON body of the message.
     * Principal contains the currently logged-in user's details (from our JWT interceptor!).
     */
    @MessageMapping("/chat/{channelId}/sendMessage")
    public void sendMessage(@DestinationVariable Long channelId, 
                            @Payload Map<String, String> payload, 
                            Principal principal) {
        
        // 1. Find the channel and the user who sent the message
        Channel channel = channelRepository.findById(channelId)
            .orElseThrow(() -> new RuntimeException("Channel not found"));
            
        User sender = userRepository.findByEmail(principal.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));

        // 1.5 SECURITY CHECK: Does this user belong to this batch channel?
        if (channel.getTargetBatchNumber() != null) {
            if (sender.getRole() != com.portal.model.Role.ROLE_ADMIN &&
                !channel.getTargetBatchNumber().equals(sender.getBatchNumber())) {
                throw new RuntimeException("Not authorized to send messages to this batch channel!");
            }
        }

        // 2. Create the message and save it to the database so it persists
        ChatMessage message = new ChatMessage();
        message.setContent(payload.get("content"));
        message.setChannel(channel);
        message.setSender(sender);
        
        ChatMessage savedMessage = messageRepository.save(message);

        // 3. THE MAGIC: Broadcast the saved message to everyone!
        // Anyone whose React app is subscribed to /topic/channel/{channelId}
        // will receive this message instantly.
        messagingTemplate.convertAndSend("/topic/channel/" + channelId, savedMessage);
    }
}
