package com.portal.repository;

import com.portal.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    // Spring Data JPA magic! Just by naming the method correctly,
    // it writes the SQL query for us:
    // SELECT * FROM chat_messages WHERE channel_id = ? ORDER BY timestamp ASC
    List<ChatMessage> findByChannelIdOrderByTimestampAsc(Long channelId);
}
