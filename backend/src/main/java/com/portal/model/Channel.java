package com.portal.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/*
 * ============================================================
 * 📺 Channel.java — A Chat Room
 * ============================================================
 * Represents a single chat channel (e.g., #general, #jobs).
 * ============================================================
 */

@Data
@Entity
@Table(name = "channels")
public class Channel {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The name of the channel (e.g., "general", "announcements")
    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    @Column(name = "target_batch_number")
    private Integer targetBatchNumber;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // This method automatically sets the time before saving to the DB
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
