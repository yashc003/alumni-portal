package com.portal.repository;

/*
 * ============================================================
 * 🗄️ UserRepository.java — Database Access Layer
 * ============================================================
 * This is a REPOSITORY — it's the bridge between our Java code
 * and the PostgreSQL database. Instead of writing SQL queries,
 * we call simple methods like findByEmail("john@email.com").
 *
 * WHAT IS AN INTERFACE?
 * An interface is like a CONTRACT or a MENU. It says:
 *   "These methods MUST exist, but I'm not implementing them myself."
 * The actual implementation (the SQL queries) is generated AUTOMATICALLY
 * by Spring Data JPA at runtime. Yes, really — no SQL needed!
 *
 * HOW DOES SPRING KNOW WHAT SQL TO GENERATE?
 * It parses the METHOD NAME! This is called "Query Derivation":
 *
 *   findByEmail(String email)
 *   ├── find     → SELECT *
 *   ├── By       → WHERE
 *   └── Email    → email = ?
 *   Result:      → SELECT * FROM users WHERE email = ?
 *
 *   findByAccountStatus(AccountStatus status)
 *   ├── find              → SELECT *
 *   ├── By                → WHERE
 *   └── AccountStatus     → account_status = ?
 *   Result:               → SELECT * FROM users WHERE account_status = ?
 *
 *   existsByEmail(String email)
 *   ├── exists   → SELECT COUNT(*) > 0
 *   ├── By       → WHERE
 *   └── Email    → email = ?
 *   Result:      → SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END FROM users WHERE email = ?
 *
 * WHAT DOES JpaRepository<User, Long> MEAN?
 *   - User → The entity type this repository manages
 *   - Long → The type of the entity's primary key (@Id field)
 *   By extending JpaRepository, we automatically get these methods FOR FREE:
 *     • save(user)         — INSERT or UPDATE
 *     • findById(id)       — SELECT by primary key
 *     • findAll()          — SELECT all rows
 *     • deleteById(id)     — DELETE by primary key
 *     • count()            — COUNT all rows
 *     • existsById(id)     — Check if a row exists
 *     ... and many more!
 *
 * @Repository — Tells Spring: "This is a data access component."
 *   Spring will create an instance of this and manage it.
 *   (Actually, Spring Data JPA auto-detects this even without the annotation,
 *    but it's good practice to include it for clarity.)
 * ============================================================
 */

import com.portal.model.AccountStatus;
import com.portal.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /*
     * Find a user by their email address.
     * Returns Optional<User> because the user might NOT exist.
     *
     * WHAT IS Optional<User>?
     * It's a "wrapper" that says: "This might contain a User, or it might be empty."
     * It forces us to handle the "not found" case:
     *
     *   Optional<User> result = userRepository.findByEmail("john@email.com");
     *   if (result.isPresent()) {
     *       User user = result.get();  // User found!
     *   } else {
     *       // User not found — handle the error
     *   }
     *
     * This prevents NullPointerException — one of the most common bugs in Java!
     *
     * Generated SQL: SELECT * FROM users WHERE email = ?
     */
    Optional<User> findByEmail(String email);

    /*
     * Check if an email already exists in the database.
     * Returns true/false — useful during registration to prevent duplicates.
     *
     * Generated SQL: SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END
     *                FROM users WHERE email = ?
     */
    boolean existsByEmail(String email);

    /*
     * Find all users with a specific account status.
     * We'll use this in the Admin Panel to show all PENDING users.
     *
     * Generated SQL: SELECT * FROM users WHERE account_status = ?
     *
     * Usage: userRepository.findByAccountStatus(AccountStatus.PENDING)
     *        → Returns a List of all users waiting for approval
     */
    List<User> findByAccountStatus(AccountStatus accountStatus);

    /*
     * Find all users by role and status (e.g. APPROVED ALUMNI).
     */
    List<User> findByRoleAndAccountStatus(com.portal.model.Role role, AccountStatus accountStatus);

    /*
     * Count users by company (case insensitive) to check for alumni referrals.
     * Ignore students and pending users.
     */
    int countByCompanyIgnoreCaseAndRoleAndAccountStatus(String company, com.portal.model.Role role, AccountStatus accountStatus);
}
