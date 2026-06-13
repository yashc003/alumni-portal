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
    private LocalDateTime createdAt;

    public UserResponse(Long id, String fullName, String email, String role, String accountStatus,
                        Integer batchNumber, String company, String linkedinUrl, LocalDateTime createdAt) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.accountStatus = accountStatus;
        this.batchNumber = batchNumber;
        this.company = company;
        this.linkedinUrl = linkedinUrl;
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
    public LocalDateTime getCreatedAt() { return createdAt; }
}
