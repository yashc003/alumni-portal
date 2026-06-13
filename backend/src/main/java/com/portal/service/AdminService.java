package com.portal.service;

/*
 * ============================================================
 * 👑 AdminService.java — Admin Business Logic
 * ============================================================
 * This service handles the Class Coordinator's operations:
 *   1. Get all pending users (for the approval queue)
 *   2. Update a user's status (approve or reject)
 *
 * PATTERN RECAP — Layered Architecture:
 *   AdminController (HTTP layer) → AdminService (business logic) → UserRepository (database)
 *
 * The Controller NEVER talks to the Repository directly.
 * All logic goes through the Service. This keeps things organized.
 * ============================================================
 */

import com.portal.dto.PendingUserResponse;
import com.portal.model.AccountStatus;
import com.portal.model.User;
import com.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.UUID;
import com.portal.dto.UserResponse;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    /*
     * 📋 GET PENDING USERS — Returns all users waiting for approval
     *
     * @return A list of PendingUserResponse DTOs
     *
     * WHAT'S HAPPENING HERE (stream + map):
     * ─────────────────────────────────────
     * Java Streams are a powerful way to process collections (lists).
     * Think of them as a conveyor belt in a factory:
     *
     *   Raw Materials                  Processing Station              Finished Product
     *   (List<User>)                   (map each User → DTO)           (List<PendingUserResponse>)
     *
     *   [User1, User2, User3]  ──→  .stream()      ← Start the conveyor belt
     *                          ──→  .map(user → ...) ← Transform each item
     *                          ──→  .collect(...)    ← Gather results into a new list
     *
     * .stream()  → Converts the List into a "stream" (a sequence of elements)
     * .map()     → Transforms each element (User → PendingUserResponse)
     * .collect() → Gathers the transformed elements back into a List
     *
     * It's equivalent to this loop (but more concise):
     *   List<PendingUserResponse> result = new ArrayList<>();
     *   for (User user : users) {
     *       result.add(convertToDto(user));
     *   }
     *   return result;
     */
    public List<PendingUserResponse> getPendingUsers() {

        // Step 1: Query the database for all users with PENDING status
        List<User> pendingUsers = userRepository.findByAccountStatus(AccountStatus.PENDING);

        // Step 2: Convert each User entity to a safe PendingUserResponse DTO
        return pendingUsers.stream()
                .map(user -> new PendingUserResponse(
                        user.getId(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getRole().name(),       // Enum → String: ROLE_STUDENT → "ROLE_STUDENT"
                        user.getBatchNumber(),
                        user.getCompany(),
                        user.getLinkedinUrl(),
                        user.getCreatedAt()
                ))
                .collect(Collectors.toList());
        /*
         * WHY CONVERT TO DTO?
         * The User entity contains passwordHash — we NEVER want to send that
         * to the frontend, even to an admin. The DTO "filters out" sensitive data.
         */
    }

    /*
     * ✅❌ UPDATE USER STATUS — Approve or reject a user
     *
     * @param userId   — The ID of the user to update (from the URL path)
     * @param status   — The new status string ("APPROVED" or "REJECTED")
     * @return A success message
     * @throws RuntimeException if user not found or invalid status
     *
     * FLOW:
     *   1. Find the user by ID → throw error if not found
     *   2. Parse the status string → throw error if invalid
     *   3. Prevent changing status of admin accounts
     *   4. Update the status and save
     */
    public String updateUserStatus(@NonNull Long userId, String status) {

        // Step 1: Find the user by ID
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        /*
         * findById() returns Optional<User> (might or might not contain a user).
         * orElseThrow() says: "If empty, throw this error."
         *
         * This is safer than:
         *   User user = userRepository.findById(userId);  // Could be NULL!
         *   user.setAccountStatus(...);  // NullPointerException if user is null!
         */

        // Step 2: Parse the status string to our AccountStatus enum
        AccountStatus newStatus;
        try {
            newStatus = AccountStatus.valueOf(status);
            // AccountStatus.valueOf("APPROVED") → AccountStatus.APPROVED ✅
            // AccountStatus.valueOf("BLAH")     → throws IllegalArgumentException ❌
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + status +
                    ". Must be APPROVED or REJECTED");
        }

        // Step 3: Don't allow changing admin account status
        if (user.getRole().name().equals("ROLE_ADMIN")) {
            throw new RuntimeException("Cannot modify admin account status");
        }

        // Step 4: Update and save
        user.setAccountStatus(newStatus);
        userRepository.save(user);
        /*
         * save() is smart — it knows this User already has an ID (it was loaded from the DB),
         * so it performs an UPDATE instead of an INSERT:
         *   UPDATE users SET account_status = 'APPROVED' WHERE id = 5
         *
         * If we had created a new User (no ID), save() would INSERT instead.
         * This dual behavior is called "upsert" (update or insert).
         */

        return "User " + user.getFullName() + " has been " + newStatus.name().toLowerCase();
        // "User John Doe has been approved"
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> new UserResponse(
                        user.getId(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getRole().name(),
                        user.getAccountStatus().name(),
                        user.getBatchNumber(),
                        user.getCompany(),
                        user.getLinkedinUrl(),
                        user.getProfileImage(),
                        user.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    public void anonymizeUser(@NonNull Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        if (user.getRole().name().equals("ROLE_ADMIN")) {
            throw new RuntimeException("Cannot delete admin account");
        }

        user.setFullName("Deleted User");
        user.setEmail("deleted_" + UUID.randomUUID() + "@deleted.com");
        user.setPasswordHash("DELETED");
        user.setAccountStatus(AccountStatus.REJECTED);
        user.setCompany(null);
        user.setLinkedinUrl(null);
        user.setBio(null);
        user.setProfileImage(null);

        userRepository.save(user);
    }
}
