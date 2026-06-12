package com.portal.controller;

/*
 * ============================================================
 * 👑 AdminController.java — Admin Panel API Endpoints
 * ============================================================
 * This controller handles the Class Coordinator's operations.
 * ALL endpoints here are protected — only ROLE_ADMIN can access them.
 *
 * HOW IS THIS PROTECTED?
 * Remember in SecurityConfig.java we wrote:
 *   .requestMatchers("/api/admin/**").hasRole("ADMIN")
 *
 * So if a ROLE_STUDENT tries to access GET /api/admin/users/pending,
 * Spring Security automatically returns 403 Forbidden — our code
 * doesn't even run! The security filter blocks it first.
 *
 * NEW ANNOTATIONS IN THIS FILE:
 *
 * @GetMapping — Handles HTTP GET requests (for fetching data)
 *   POST = "Create something new" (register, send message)
 *   GET  = "Give me some data" (view pending users, view profile)
 *   PUT  = "Update something" (approve user, edit profile)
 *
 * @PathVariable — Extracts a value from the URL path
 *   URL:    PUT /api/admin/users/5/status
 *                                 ↑
 *   Code:   @PathVariable Long id → id = 5
 * ============================================================
 */

import com.portal.dto.PendingUserResponse;
import com.portal.dto.UserStatusUpdateRequest;
import com.portal.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    /*
     * 📋 GET /api/admin/users/pending — List all pending registrations
     *
     * The admin opens the admin panel → frontend calls this endpoint
     * → returns a JSON array of pending users.
     *
     * RESPONSE (200 OK):
     * [
     *   { "id": 5, "fullName": "John Doe", "email": "john@...", "role": "ROLE_STUDENT", ... },
     *   { "id": 7, "fullName": "Jane Smith", "email": "jane@...", "role": "ROLE_ALUMNI", ... }
     * ]
     *
     * If no pending users exist, returns an empty array: []
     */
    @GetMapping("/users/pending")
    public ResponseEntity<List<PendingUserResponse>> getPendingUsers() {
        /*
         * Notice the return type: ResponseEntity<List<PendingUserResponse>>
         *
         * ResponseEntity<T> wraps the response with HTTP metadata.
         * List<PendingUserResponse> is the actual data type.
         *
         * Spring/Jackson automatically converts List<PendingUserResponse>
         * into a JSON array. Each PendingUserResponse becomes a JSON object.
         *
         * Java generics (the <...> syntax):
         *   List<String>              → A list that contains only Strings
         *   List<PendingUserResponse> → A list that contains only PendingUserResponse objects
         *   This provides type safety — you can't accidentally put a User in a List<String>.
         */
        List<PendingUserResponse> pendingUsers = adminService.getPendingUsers();
        return ResponseEntity.ok(pendingUsers);
    }

    /*
     * ✅❌ PUT /api/admin/users/{id}/status — Approve or reject a user
     *
     * @PathVariable Long id — Extracted from the URL
     *   Example: PUT /api/admin/users/5/status → id = 5
     *
     * @RequestBody → The JSON body: { "status": "APPROVED" }
     *
     * URL PATTERN EXPLAINED:
     *   /api/admin/users/{id}/status
     *                    ↑
     *   {id} is a PLACEHOLDER. Spring replaces it with the actual value
     *   from the URL and passes it to the method parameter marked @PathVariable.
     *
     * SUCCESS (200 OK):
     * { "message": "User John Doe has been approved" }
     *
     * FAILURE (400 BAD REQUEST):
     * { "error": "User not found with ID: 99" }
     */
    @PutMapping("/users/{id}/status")
    public ResponseEntity<?> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UserStatusUpdateRequest request) {
        try {
            String message = adminService.updateUserStatus(id, request.getStatus());
            return ResponseEntity.ok(Map.of("message", message));

        } catch (RuntimeException ex) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", ex.getMessage()));
        }
    }
}
