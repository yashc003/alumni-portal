package com.portal.dto;

/*
 * ============================================================
 * 📤 AuthResponse.java — What We Send Back After Login
 * ============================================================
 * After a successful login, we send this data back to the frontend.
 * The frontend stores the token and uses the other fields to display
 * the user's name, role badge, etc.
 *
 * WHAT THE BACKEND RETURNS (JSON):
 * {
 *   "token": "eyJhbGciOiJIUzI1NiJ9...",
 *   "tokenType": "Bearer",
 *   "fullName": "John Doe",
 *   "email": "john@email.com",
 *   "role": "ROLE_STUDENT"
 * }
 *
 * The frontend will then send the token back in every request:
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
 * ============================================================
 */

public class AuthResponse {

    private String token;
    private String tokenType = "Bearer";  // Always "Bearer" — it's the standard
    private String fullName;
    private String email;
    private String role;
    private String profileImage;

    /*
     * Constructor — we use this to create the response object in one line:
     *   new AuthResponse(token, fullName, email, role)
     * instead of calling 4 separate setter methods.
     */
    public AuthResponse(String token, String fullName, String email, String role, String profileImage) {
        this.token = token;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.profileImage = profileImage;
    }

    // --- Getters ---
    // We only need GETTERS here (no setters) because the backend CREATES this object
    // and the frontend only READS it. Jackson (the JSON library) uses getters to
    // convert this Java object into JSON.

    public String getToken() { return token; }
    public String getTokenType() { return tokenType; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String getProfileImage() { return profileImage; }
}
