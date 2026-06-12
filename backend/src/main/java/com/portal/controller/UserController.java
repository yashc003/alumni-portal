package com.portal.controller;

import com.portal.dto.ProfileUpdateRequest;
import com.portal.model.User;
import com.portal.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

/*
 * ============================================================
 * 👤 UserController.java — User Profile Management
 * ============================================================
 * Handles fetching and updating the logged-in user's profile.
 * ============================================================
 */

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Get current user's profile
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        // Never return password hashes to the frontend
        user.setPasswordHash(null);
        return ResponseEntity.ok(user);
    }

    // Update current user's profile
    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@RequestBody ProfileUpdateRequest request, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
        }
        
        user.setCompany(request.getCompany());
        user.setLinkedinUrl(request.getLinkedinUrl());

        userRepository.save(user);

        return ResponseEntity.ok("Profile updated successfully");
    }
}
