package com.portal.repository;

import com.portal.model.SystemNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<SystemNotification, Long> {
    List<SystemNotification> findByIsReadFalseOrderByCreatedAtDesc();
}
