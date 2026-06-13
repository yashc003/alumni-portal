package com.portal.controller;

import com.portal.dto.UserProfileDTO;
import com.portal.model.AccountStatus;
import com.portal.model.Role;
import com.portal.model.User;
import com.portal.repository.UserRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

/*
 * ============================================================
 * 🌐 DirectoryController.java
 * ============================================================
 * Handles fetching users for the Alumni Directory.
 * It maps full User entities to UserProfileDTO to ensure
 * passwords and sensitive data are stripped out.
 * ============================================================
 */

@RestController
@RequestMapping("/api/directory")
public class DirectoryController {

    private final UserRepository userRepository;

    public DirectoryController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Get all approved users
    @GetMapping("/users")
    public List<UserProfileDTO> getNetworkDirectory() {
        List<User> users = userRepository.findByAccountStatus(AccountStatus.APPROVED);
        
        return users.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    private UserProfileDTO mapToDTO(User user) {
        UserProfileDTO dto = new UserProfileDTO();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setBatchNumber(user.getBatchNumber());
        dto.setCompany(user.getCompany());
        dto.setLinkedinUrl(user.getLinkedinUrl());
        dto.setProfileImage(user.getProfileImage());
        return dto;
    }
}
