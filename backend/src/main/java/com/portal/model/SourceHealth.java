package com.portal.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "source_health")
@Data
public class SourceHealth {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "source_name", unique = true, nullable = false)
    private String sourceName; // e.g. "Greenhouse", "Lever", "LinkedIn"

    @Column(nullable = false)
    private String status = "UNKNOWN"; // "HEALTHY", "FAILING", "UNKNOWN"

    @Column(name = "last_run")
    private LocalDateTime lastRun;

    @Column(name = "last_success")
    private LocalDateTime lastSuccess;

    @Column(name = "failure_count")
    private Integer failureCount = 0;

    @Column(name = "jobs_fetched")
    private Integer jobsFetched = 0;

    @Column(name = "jobs_rejected")
    private Integer jobsRejected = 0;

    @Column(name = "jobs_deduplicated")
    private Integer jobsDeduplicated = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
