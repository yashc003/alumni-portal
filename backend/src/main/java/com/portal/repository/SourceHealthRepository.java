package com.portal.repository;

import com.portal.model.SourceHealth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SourceHealthRepository extends JpaRepository<SourceHealth, Long> {
    Optional<SourceHealth> findBySourceName(String sourceName);
}
