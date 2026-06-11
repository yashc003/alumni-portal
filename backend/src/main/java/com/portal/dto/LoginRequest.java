package com.portal.dto;

/*
 * ============================================================
 * 🔑 LoginRequest.java — Login Form Data
 * ============================================================
 * This is the simplest DTO — just email and password.
 *
 * WHAT THE FRONTEND SENDS (JSON):
 * {
 *   "email": "john@email.com",
 *   "password": "MyPass@123"
 * }
 * ============================================================
 */

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    // --- Getters and Setters ---

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
