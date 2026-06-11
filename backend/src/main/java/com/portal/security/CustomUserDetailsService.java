package com.portal.security;

/*
 * ============================================================
 * 🔍 CustomUserDetailsService.java — The Identity Verifier
 * ============================================================
 * Spring Security has its OWN concept of a "user" — it doesn't know
 * about our User.java entity. So we need this bridge class to TRANSLATE
 * between our User and Spring Security's UserDetails.
 *
 * HOW IT WORKS:
 * 1. Someone tries to log in with email "john@email.com"
 * 2. Spring Security calls: loadUserByUsername("john@email.com")
 * 3. We look up the user in our database using UserRepository
 * 4. We convert our User object into Spring Security's UserDetails format
 * 5. Spring Security then compares the provided password with the stored hash
 *
 * WHAT IS UserDetails?
 * It's Spring Security's interface for representing a user. It includes:
 *   - username (in our case, email)
 *   - password (the hashed password)
 *   - authorities (roles/permissions like ROLE_ADMIN)
 *   - isEnabled (is the account active?)
 *   - isAccountNonLocked, isCredentialsNonExpired, etc.
 *
 * WHAT IS A SERVICE?
 * In Spring, a @Service class contains BUSINESS LOGIC — the actual
 * "thinking" of your application. It sits between the Controller
 * (which handles HTTP requests) and the Repository (which talks to the DB):
 *
 *   Controller → "Someone wants to log in"
 *   Service    → "Let me verify their identity and check their status"
 *   Repository → "Here's the user data from the database"
 * ============================================================
 */

import com.portal.model.AccountStatus;
import com.portal.model.User;
import com.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    /*
     * @Autowired — This is DEPENDENCY INJECTION in action!
     *
     * Instead of creating the repository ourselves:
     *   UserRepository repo = new UserRepository();  // ❌ We DON'T do this
     *
     * We let Spring CREATE it and HAND it to us:
     *   @Autowired
     *   private UserRepository userRepository;  // ✅ Spring provides this automatically
     *
     * WHY?
     * - Spring manages the lifecycle (creates it once, reuses it everywhere)
     * - Makes testing easier (we can swap in a mock/fake repository)
     * - Loose coupling: this class doesn't need to know HOW the repository is created
     *
     * ANALOGY: Instead of building your own oven, the restaurant (Spring)
     * installs one for you and you just use it.
     */
    @Autowired
    private UserRepository userRepository;

    /*
     * 🔍 loadUserByUsername — Spring Security calls this during authentication
     *
     * Despite the name "username", we're using EMAIL as the unique identifier.
     * Spring Security is flexible — "username" is just whatever unique field
     * you use to identify users.
     *
     * @param email — The email the user typed in the login form
     * @return UserDetails — Spring Security's representation of the user
     * @throws UsernameNotFoundException — If no user with that email exists
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        // Step 1: Look up the user in the database by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found with email: " + email
                ));
        /*
         * .orElseThrow() — Remember Optional<User> from the repository?
         * This says: "If the user exists, give me the User. If not, throw this error."
         * It's a cleaner way of writing:
         *   if (result.isEmpty()) { throw new Exception(...); }
         *   User user = result.get();
         */

        // Step 2: Check if the account is approved
        // We use the "enabled" flag to represent account approval status.
        // If enabled = false, Spring Security will reject the login attempt.
        boolean isApproved = user.getAccountStatus() == AccountStatus.APPROVED;

        /*
         * Step 3: Convert our User to Spring Security's UserDetails
         *
         * Spring Security provides a built-in User builder (different from OUR User class!).
         * The full class name is: org.springframework.security.core.userdetails.User
         *
         * Parameters:
         *   - username:    The email (used as the identifier)
         *   - password:    The BCrypt hash (Spring Security will compare it with the login input)
         *   - enabled:     Is the account active? (false = login rejected with DisabledException)
         *   - accountNonExpired:     We set true (we don't use account expiration)
         *   - credentialsNonExpired: We set true (we don't expire passwords)
         *   - accountNonLocked:      We set true (we don't lock accounts)
         *   - authorities: The user's roles/permissions
         *
         * SimpleGrantedAuthority("ROLE_STUDENT") → Grants the ROLE_STUDENT permission
         * Collections.singletonList() → Creates a list with exactly one item
         */
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                isApproved,                          // enabled (only APPROVED users can log in)
                true,                                // accountNonExpired
                true,                                // credentialsNonExpired
                true,                                // accountNonLocked
                Collections.singletonList(
                        new SimpleGrantedAuthority(user.getRole().name())
                        // .name() converts the enum to a string: ROLE_ADMIN → "ROLE_ADMIN"
                )
        );
    }
}
