package com.portal.service;

/*
 * ============================================================
 * 🧠 AuthService.java — The Authentication Brain
 * ============================================================
 * This service contains the BUSINESS LOGIC for registration and login.
 * It sits between the Controller (HTTP layer) and the Repository (database layer).
 *
 * WHY A SEPARATE SERVICE?
 * - The Controller should ONLY handle HTTP concerns (request/response).
 * - Business logic (hashing passwords, checking duplicates, generating tokens)
 *   belongs in the Service.
 * - This separation makes the code testable — you can test the service
 *   WITHOUT starting a web server!
 *
 * TWO MAIN OPERATIONS:
 *
 * 1. REGISTER:
 *    Frontend sends: { fullName, email, password, role, ... }
 *    We do: Validate → Hash password → Save with status=PENDING → Return success
 *
 * 2. LOGIN:
 *    Frontend sends: { email, password }
 *    We do: Authenticate → Check status=APPROVED → Generate JWT → Return token
 * ============================================================
 */

import com.portal.dto.AuthResponse;
import com.portal.dto.LoginRequest;
import com.portal.dto.RegisterRequest;
import com.portal.model.Role;
import com.portal.model.User;
import com.portal.repository.UserRepository;
import com.portal.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    /*
     * All these dependencies are INJECTED by Spring (Dependency Injection).
     * We don't create them ourselves — Spring hands them to us.
     *
     * Think of it like ordering food at a restaurant:
     * "I need the UserRepository, PasswordEncoder, AuthenticationManager, and JwtTokenProvider."
     * Spring says: "Here you go!" and gives us fully-configured instances.
     */

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    // This is the BCryptPasswordEncoder bean we defined in SecurityConfig

    @Autowired
    private AuthenticationManager authenticationManager;
    // This is the AuthenticationManager bean we defined in SecurityConfig

    @Autowired
    private JwtTokenProvider tokenProvider;

    /*
     * 📝 REGISTER — Create a new user account
     *
     * @param request — The registration form data (fullName, email, password, role, ...)
     * @return A success message string
     * @throws RuntimeException if the email is already taken
     *
     * FLOW:
     *   1. Check if email already exists → throw error if yes
     *   2. Parse the role string → convert to Role enum
     *   3. Hash the password → NEVER store plain text!
     *   4. Create a User object → set all fields
     *   5. Save to database → status is automatically PENDING
     *   6. Return success message → user must wait for admin approval
     */
    public String register(RegisterRequest request) {

        // Step 1: Check for duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered: " + request.getEmail());
            /*
             * In production, we'd create a custom exception class (like EmailAlreadyExistsException)
             * and handle it with @ControllerAdvice. For now, RuntimeException is fine for learning.
             */
        }

        // Step 2: Parse the role from the request string
        Role role;
        try {
            role = Role.valueOf(request.getRole());
            // Role.valueOf("ROLE_STUDENT") → Role.ROLE_STUDENT
            // Role.valueOf("INVALID")      → throws IllegalArgumentException
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role: " + request.getRole() +
                    ". Must be ROLE_STUDENT or ROLE_ALUMNI");
        }

        // Prevent someone from registering as ADMIN through the API!
        if (role == Role.ROLE_ADMIN) {
            throw new RuntimeException("Cannot register as admin");
        }

        // Step 3: Hash the password
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        /*
         * What just happened:
         *   Input:  "MyPass@123"
         *   Output: "$2a$10$K7JxG9v..." (a 60-character BCrypt hash)
         *
         * This is ONE-WAY — you cannot reverse the hash to get "MyPass@123" back.
         * Even WE (the developers) can never see users' actual passwords.
         */

        // Step 4: Create the User entity
        User user = new User(request.getFullName(), request.getEmail(), hashedPassword, role);
        // Remember: the constructor sets accountStatus = PENDING automatically!

        // Set optional fields
        user.setBatchNumber(request.getBatchNumber());
        user.setCompany(request.getCompany());
        user.setLinkedinUrl(request.getLinkedinUrl());

        // Step 5: Save to database
        userRepository.save(user);
        /*
         * Behind the scenes, Hibernate generates and executes:
         *   INSERT INTO users (full_name, email, password_hash, role, account_status, ...)
         *   VALUES ('John Doe', 'john@email.com', '$2a$10$K7JxG9v...', 'ROLE_STUDENT', 'PENDING', ...)
         */

        // Step 6: Return success message (no token — they can't log in yet!)
        return "Registration successful! Please wait for admin approval.";
    }

    /*
     * 🔑 LOGIN — Authenticate and return a JWT token
     *
     * @param request — The login form data (email, password)
     * @return AuthResponse containing the JWT token and user info
     * @throws RuntimeException if credentials are wrong or account is not approved
     *
     * FLOW:
     *   1. Tell Spring Security to authenticate the credentials
     *   2. Spring Security internally calls CustomUserDetailsService.loadUserByUsername()
     *   3. Spring Security compares the provided password with the stored BCrypt hash
     *   4. If the account is disabled (not APPROVED), it throws DisabledException
     *   5. If everything is valid, generate a JWT token
     *   6. Look up the user's full details and build the response
     */
    public AuthResponse login(LoginRequest request) {

        try {
            // Step 1: Authenticate — this is where the magic happens!
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
            /*
             * What authenticationManager.authenticate() does internally:
             *
             * 1. Calls CustomUserDetailsService.loadUserByUsername(email)
             *    → Fetches the user from the database
             *    → Checks if account is enabled (status == APPROVED)
             *
             * 2. Uses BCryptPasswordEncoder to compare:
             *    → passwordEncoder.matches("MyPass@123", "$2a$10$K7JxG9v...")
             *    → Returns true if the plain password matches the hash
             *
             * 3. If BOTH checks pass → returns an Authentication object
             *    If credentials wrong → throws BadCredentialsException
             *    If account disabled → throws DisabledException
             */

            // Step 2: Generate JWT token
            String token = tokenProvider.generateToken(authentication);

            // Step 3: Get user details to include in the response
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Step 4: Build and return the response
            return new AuthResponse(
                    token,
                    user.getFullName(),
                    user.getEmail(),
                    user.getRole().name(),  // Convert enum to string: ROLE_STUDENT → "ROLE_STUDENT"
                    user.getProfileImage()
            );

        } catch (DisabledException ex) {
            /*
             * DisabledException is thrown when the user exists and password is correct,
             * BUT the account is not enabled (accountStatus != APPROVED).
             *
             * Remember in CustomUserDetailsService, we set:
             *   enabled = (user.getAccountStatus() == AccountStatus.APPROVED)
             *
             * So a PENDING or REJECTED user triggers this exception.
             */
            throw new RuntimeException("Account is not approved yet. Please wait for admin verification.");

        } catch (Exception ex) {
            throw new RuntimeException("Invalid email or password");
        }
    }
}
