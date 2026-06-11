package com.portal.dto;

/*
 * ============================================================
 * 📝 RegisterRequest.java — Registration Form Data
 * ============================================================
 * A DTO (Data Transfer Object) is a simple class that carries data
 * between the frontend and backend. It does NOT have any logic —
 * it's just a container for fields.
 *
 * WHY NOT USE THE User ENTITY DIRECTLY?
 * Three important reasons:
 *
 * 1. SECURITY: The User entity has fields like "id", "passwordHash",
 *    "accountStatus", "createdAt" — we DON'T want the frontend to
 *    send or see these! A DTO only exposes what's needed.
 *
 * 2. VALIDATION: We can put different validation rules on DTOs than on entities.
 *    For example, RegisterRequest has a "password" field (plain text),
 *    but User has "passwordHash" (encrypted). They're different!
 *
 * 3. DECOUPLING: If we change the database schema (User entity), we don't
 *    have to change the API contract (DTOs). The frontend doesn't break.
 *
 * WHAT THE FRONTEND SENDS (JSON):
 * {
 *   "fullName": "John Doe",
 *   "email": "john@email.com",
 *   "password": "MyPass@123",
 *   "role": "ROLE_STUDENT",
 *   "batchYear": 2024,
 *   "department": "Computer Science",
 *   "company": null,           ← Only for alumni
 *   "linkedinUrl": null        ← Only for alumni
 * }
 *
 * Spring Boot AUTOMATICALLY converts this JSON into a RegisterRequest
 * object! This is called "deserialization" and is done by the Jackson library
 * (included with spring-boot-starter-web).
 * ============================================================
 */

import jakarta.validation.constraints.*;

public class RegisterRequest {

    /*
     * VALIDATION ANNOTATIONS
     * These are checked AUTOMATICALLY when Spring receives the request.
     * If any validation fails, Spring returns a 400 Bad Request error
     * with a message explaining what went wrong.
     *
     * You don't need to write any if-else checks yourself!
     */

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be at least 6 characters")
    private String password;  // Plain text! We hash it in the service layer before saving.

    @NotNull(message = "Role is required")
    private String role;  // "ROLE_STUDENT" or "ROLE_ALUMNI" — we parse this to the Role enum

    private Integer batchYear;      // Optional

    private String department;      // Optional

    private String company;         // Only required for alumni

    private String linkedinUrl;     // Only for alumni

    // --- Getters and Setters ---
    // (Spring needs these to read/write the fields when converting JSON ↔ Java)

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Integer getBatchYear() { return batchYear; }
    public void setBatchYear(Integer batchYear) { this.batchYear = batchYear; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }
}
