package com.portal.dto;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String fullName;
    private String company;
    private String linkedinUrl;
    private String profileImage;
    private String bio;
}
