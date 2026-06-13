package com.portal.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class JobPostDTO {
    private Long id;
    private String title;
    private String company;
    private String location;
    private String description;
    private String applyLink;
    private String source;
    private String externalSourceUrl;
    private String postedByFullName;
    private LocalDateTime createdAt;

    // Job Aggregation Engine Fields
    private Integer relevanceScore;
    private Boolean isReferralAvailable;
    private Integer minExperience;
    private Integer maxExperience;
    private String matchedSkills;
    private String missingSkills;
}