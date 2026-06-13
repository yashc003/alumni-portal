package com.portal.controller;

import com.portal.model.Channel;
import com.portal.model.ChatMessage;
import com.portal.model.User;
import com.portal.repository.ChannelRepository;
import com.portal.repository.ChatMessageRepository;
import com.portal.repository.UserRepository;
import org.springframework.lang.NonNull;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

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
        User user = userRepository.findByEmail(principal.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
            
        // 🛠️ AUTO-CREATE BATCH CHANNEL IF IT DOESN'T EXIST
        if (user.getBatchNumber() != null) {
            boolean batchChannelExists = channelRepository.findByTargetBatchNumber(user.getBatchNumber()).isPresent();
            if (!batchChannelExists) {
                Channel newBatchChannel = new Channel();
                newBatchChannel.setName("batch-" + user.getBatchNumber());
                newBatchChannel.setDescription("Exclusive chat room for Batch " + user.getBatchNumber() + " students and alumni.");
                newBatchChannel.setTargetBatchNumber(user.getBatchNumber());
                channelRepository.save(newBatchChannel);
            }
        }
        
        List<Channel> allChannels = channelRepository.findAll();
        
        if (user.getRole() == com.portal.model.Role.ROLE_ADMIN) {
            return allChannels;
        }
        
        return allChannels.stream()
            .filter(ch -> {
                // If it's a DM, user must be participant
                if (Boolean.TRUE.equals(ch.getIsDirectMessage())) {
                    return (ch.getUser1() != null && ch.getUser1().getId().equals(user.getId())) ||
                           (ch.getUser2() != null && ch.getUser2().getId().equals(user.getId()));
                }
                
                // If it's a batch channel, user must match batch
                if (ch.getTargetBatchNumber() != null) {
                    return ch.getTargetBatchNumber().equals(user.getBatchNumber());
                }
                
                // Otherwise it's public (like #general)
                return true;
            })
            .toList();
    }
    
    // Create or get a Direct Message channel
    @PostMapping("/api/channels/dm/{targetUserId}")
    public Channel getOrCreateDirectMessage(@PathVariable Long targetUserId, Principal principal) {
        User me = userRepository.findByEmail(principal.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
            
        User target = userRepository.findById(targetUserId)
            .orElseThrow(() -> new RuntimeException("Target user not found"));
            
        if (me.getId().equals(target.getId())) {
            throw new RuntimeException("Cannot DM yourself");
        }
        
        // Check if DM channel already exists
        return channelRepository.findDirectMessageChannel(me.getId(), target.getId())
            .orElseGet(() -> {
                // Create a new DM channel
                Channel dmChannel = new Channel();
                dmChannel.setName("dm_" + UUID.randomUUID().toString().substring(0, 8)); // Unique internal name
                dmChannel.setIsDirectMessage(true);
                dmChannel.setUser1(me);
                dmChannel.setUser2(target);
                return channelRepository.save(dmChannel);
            });
    }

    // Load the chat history when a user clicks on a channel
    @GetMapping("/api/channels/{channelId}/messages")
    public List<ChatMessage> getChatHistory(@PathVariable Long channelId, Principal principal) {
        Channel channel = channelRepository.findById(channelId)
            .orElseThrow(() -> new RuntimeException("Channel not found"));
            
        User user = userRepository.findByEmail(principal.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
            
        // SECURITY CHECK: Authorization for viewing messages
        if (Boolean.TRUE.equals(channel.getIsDirectMessage())) {
            boolean isParticipant = (channel.getUser1() != null && channel.getUser1().getId().equals(user.getId())) ||
                                    (channel.getUser2() != null && channel.getUser2().getId().equals(user.getId()));
            if (!isParticipant) {
                throw new RuntimeException("Not authorized to view messages in this DM channel!");
            }
        } else if (channel.getTargetBatchNumber() != null) {
            if (user.getRole() != com.portal.model.Role.ROLE_ADMIN &&
                !channel.getTargetBatchNumber().equals(user.getBatchNumber())) {
                throw new RuntimeException("Not authorized to view messages in this batch channel!");
            }
        }
        
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
    public void sendMessage(@DestinationVariable @NonNull Long channelId, 
                            @Payload Map<String, String> payload, 
                            Principal principal) {
        
        // 1. Find the channel and the user who sent the message
        Channel channel = channelRepository.findById(channelId)
            .orElseThrow(() -> new RuntimeException("Channel not found"));
            
        User sender = userRepository.findByEmail(principal.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));

        // 1.5 SECURITY CHECK: Authorization for sending messages
        if (Boolean.TRUE.equals(channel.getIsDirectMessage())) {
            boolean isParticipant = (channel.getUser1() != null && channel.getUser1().getId().equals(sender.getId())) ||
                                    (channel.getUser2() != null && channel.getUser2().getId().equals(sender.getId()));
            if (!isParticipant) {
                throw new RuntimeException("Not authorized to send messages to this DM channel!");
            }
        } else if (channel.getTargetBatchNumber() != null) {
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
