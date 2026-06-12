package com.portal.dto;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String fullName;
    private String company;
    private String linkedinUrl;
}
