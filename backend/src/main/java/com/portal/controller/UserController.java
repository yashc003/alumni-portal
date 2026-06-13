package com.portal.controller;

import com.portal.dto.ProfileUpdateRequest;
import com.portal.model.User;
import com.portal.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.Principal;
import java.util.UUID;
import java.util.Map;

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
        user.setProfileImage(request.getProfileImage());
        user.setBio(request.getBio());

        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }

    // Upload avatar
    @PostMapping("/me/avatar")
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") MultipartFile file, Principal principal) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Please select a file to upload."));
        }

        try {
            // Validate file type (basic check)
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Only image files are allowed."));
            }

            // Create uploads directory if it doesn't exist
            Path uploadDir = Paths.get("uploads/avatars");
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            // Generate unique filename
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            String fileExtension = "";
            int dotIndex = originalFilename.lastIndexOf('.');
            if (dotIndex >= 0) {
                fileExtension = originalFilename.substring(dotIndex);
            }
            String newFilename = UUID.randomUUID().toString() + fileExtension;

            // Save the file
            Path filePath = uploadDir.resolve(newFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Generate URL and update user
            String fileUrl = "/uploads/avatars/" + newFilename;
            
            User user = userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
                    
            user.setProfileImage(fileUrl);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                "message", "Avatar uploaded successfully",
                "profileImage", fileUrl
            ));
            
        } catch (IOException ex) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to upload image."));
        }
    }
}
