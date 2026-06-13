package com.portal.repository;

import com.portal.model.Channel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChannelRepository extends JpaRepository<Channel, Long> {
    Optional<Channel> findByName(String name);
    Optional<Channel> findByTargetBatchNumber(Integer targetBatchNumber);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM Channel c WHERE c.isDirectMessage = true AND ((c.user1.id = :userId1 AND c.user2.id = :userId2) OR (c.user1.id = :userId2 AND c.user2.id = :userId1))")
    Optional<Channel> findDirectMessageChannel(Long userId1, Long userId2);
}
