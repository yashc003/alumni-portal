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
    private String postedByFullName;
    private LocalDateTime createdAt;
}
