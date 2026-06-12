package com.portal.dto;

import com.portal.model.Role;
import lombok.Data;

@Data
public class UserProfileDTO {
    private Long id;
    private String fullName;
    private String email;
    private Role role;
    private Integer batchNumber;
    private String company;
    private String linkedinUrl;
}
