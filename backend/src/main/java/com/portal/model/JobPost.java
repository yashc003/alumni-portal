package com.portal.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "job_posts")
@Data
public class JobPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String company;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "apply_link")
    private String applyLink;

    @Column
    private String source = "Alumni"; // e.g., Alumni, Greenhouse, Lever, LinkedIn

    @Column(name = "external_source_url")
    private String externalSourceUrl; // Link to the original posting

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "posted_by", nullable = true)
    private User postedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // --- Job Aggregation Engine Fields ---

    @Column(name = "relevance_score")
    private Integer relevanceScore = 0;

    @Column(name = "job_hash", length = 64)
    private String jobHash;

    @Column(name = "is_referral_available")
    private Boolean isReferralAvailable = false;

    @Column(name = "min_experience")
    private Integer minExperience;

    @Column(name = "max_experience")
    private Integer maxExperience;

    @Column(name = "matched_skills", columnDefinition = "TEXT")
    private String matchedSkills;

    @Column(name = "missing_skills", columnDefinition = "TEXT")
    private String missingSkills;
}
