package com.portal.dto;

import java.time.LocalDateTime;

public class UserResponse {

    private Long id;
    private String fullName;
    private String email;
    private String role;
    private String accountStatus;
    private Integer batchNumber;
    private String company;
    private String linkedinUrl;
    private String profileImage;
    private LocalDateTime createdAt;

    public UserResponse(Long id, String fullName, String email, String role, String accountStatus,
                        Integer batchNumber, String company, String linkedinUrl, String profileImage, LocalDateTime createdAt) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.accountStatus = accountStatus;
        this.batchNumber = batchNumber;
        this.company = company;
        this.linkedinUrl = linkedinUrl;
        this.profileImage = profileImage;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String getAccountStatus() { return accountStatus; }
    public Integer getBatchNumber() { return batchNumber; }
    public String getCompany() { return company; }
    public String getLinkedinUrl() { return linkedinUrl; }
    public String getProfileImage() { return profileImage; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
