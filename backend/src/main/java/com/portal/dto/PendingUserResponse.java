package com.portal.dto;

/*
 * ============================================================
 * 📋 PendingUserResponse.java — Admin View of a Pending User
 * ============================================================
 * When the admin opens the pending users queue, they see a table
 * with each user's info. This DTO defines WHAT the admin sees.
 *
 * WHY NOT RETURN THE USER ENTITY DIRECTLY?
 * Because User contains sensitive data we don't want to expose:
 *   - passwordHash (NEVER send this to anyone!)
 *   - internal fields like updatedAt
 *
 * This DTO acts as a "safe view" — it cherry-picks only the fields
 * the admin needs to make an approval decision.
 *
 * WHAT THE ADMIN RECEIVES (JSON):
 * {
 *   "id": 5,
 *   "fullName": "John Doe",
 *   "email": "john@email.com",
 *   "role": "ROLE_STUDENT",
 *   "batchYear": 2024,
 *   "department": "Computer Science",
 *   "company": null,
 *   "linkedinUrl": null,
 *   "createdAt": "2026-06-11T14:30:00"
 * }
 * ============================================================
 */

import java.time.LocalDateTime;

public class PendingUserResponse {

    private Long id;
    private String fullName;
    private String email;
    private String role;
    private Integer batchYear;
    private String department;
    private String company;         // Only for alumni
    private String linkedinUrl;     // Only for alumni
    private LocalDateTime createdAt; // When they registered — helps admin prioritize

    /*
     * Constructor that takes a User entity and extracts the safe fields.
     * We'll call this from AdminService like:
     *   new PendingUserResponse(user)
     *
     * NOTE: We import the User class here to convert from Entity → DTO.
     * This is a common pattern called "mapping" or "projection."
     */
    public PendingUserResponse(Long id, String fullName, String email, String role,
                                Integer batchYear, String department, String company,
                                String linkedinUrl, LocalDateTime createdAt) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.batchYear = batchYear;
        this.department = department;
        this.company = company;
        this.linkedinUrl = linkedinUrl;
        this.createdAt = createdAt;
    }

    // --- Getters (read-only — admin only VIEWS this data) ---

    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public Integer getBatchYear() { return batchYear; }
    public String getDepartment() { return department; }
    public String getCompany() { return company; }
    public String getLinkedinUrl() { return linkedinUrl; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
