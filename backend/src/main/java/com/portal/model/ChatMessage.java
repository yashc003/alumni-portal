package com.portal.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/*
 * ============================================================
 * 💬 ChatMessage.java — A Single Message
 * ============================================================
 * Represents one message sent by a user in a specific channel.
 * 
 * Notice the @ManyToOne annotations! This tells Spring Data
 * that many messages can belong to ONE channel, and many
 * messages can be sent by ONE user.
 * ============================================================
 */

@Data
@Entity
@Table(name = "chat_messages")
public class ChatMessage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Which channel was this message posted in?
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "channel_id", nullable = false)
    private Channel channel;

    // Who sent this message?
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User sender;

    // The actual text of the message
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}
