package com.portal.model;

/*
 * ============================================================
 * 👤 User.java — The User Entity (JPA)
 * ============================================================
 * This is the MOST IMPORTANT class in Phase 1. It represents
 * the "users" table in our PostgreSQL database.
 *
 * WHAT IS AN ENTITY?
 * An entity is a Java class that JPA (Hibernate) maps to a database table.
 * Each FIELD in this class becomes a COLUMN in the table.
 * Each INSTANCE (object) of this class represents a ROW in the table.
 *
 *   Java Class Field          →    Database Column
 *   ─────────────────              ───────────────
 *   private String fullName   →    full_name VARCHAR(100)
 *   private String email      →    email VARCHAR(150)
 *   private Role role         →    role VARCHAR(20)
 *
 * NAMING CONVENTION:
 * Java uses camelCase (fullName), but databases use snake_case (full_name).
 * Hibernate automatically converts between them! This is called the
 * "Spring Physical Naming Strategy". So:
 *   fullName    → full_name
 *   batchYear   → batch_year
 *   linkedinUrl → linkedin_url
 *
 * WHAT ABOUT GETTERS & SETTERS?
 * In Java, fields are usually "private" (hidden from outside the class).
 * To read or modify them, we use "getter" and "setter" methods:
 *   - getFullName()         → reads the fullName field
 *   - setFullName("John")   → writes to the fullName field
 * This is called "Encapsulation" — a core Java principle.
 * It seems tedious, but it lets us add validation or logic later
 * without changing the classes that USE this class.
 * ============================================================
 */

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

/*
 * @Entity — Tells JPA: "This class represents a database table."
 *           Without this, Hibernate would completely ignore this class.
 *
 * @Table(name = "users") — Specifies the actual table name in PostgreSQL.
 *           If we omit this, Hibernate would name the table "user",
 *           but "user" is a RESERVED WORD in PostgreSQL (it refers to
 *           the current database user), so we explicitly use "users".
 */
@Entity
@Table(name = "users")
public class User {

    /*
     * @Id — Marks this field as the PRIMARY KEY of the table.
     *       Every database table needs a primary key — a unique identifier
     *       for each row. Think of it like a student roll number.
     *
     * @GeneratedValue(strategy = GenerationType.IDENTITY)
     *       Tells the database to AUTO-INCREMENT this value.
     *       The first user gets id=1, second gets id=2, etc.
     *       We never set this manually — PostgreSQL handles it.
     *       IDENTITY strategy uses PostgreSQL's BIGSERIAL type.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * @NotBlank — Validation: this field cannot be null, empty, or just whitespace.
     *             If someone tries to register with fullName = "" or "   ",
     *             Spring will reject the request BEFORE it reaches our code.
     *
     * @Size(max = 100) — Validation: maximum 100 characters.
     *
     * @Column(nullable = false, length = 100)
     *        Database-level constraint: the column cannot be NULL,
     *        and VARCHAR length is capped at 100.
     *        This is a SECOND line of defense (in case validation is bypassed).
     */
    @NotBlank(message = "Full name is required")
    @Size(max = 100, message = "Full name must be under 100 characters")
    @Column(nullable = false, length = 100)
    private String fullName;

    /*
     * @Email — Validates that the string looks like a valid email address.
     *          "john@email.com" ✅   |   "not-an-email" ❌
     *
     * @Column(nullable = false, unique = true, length = 150)
     *        unique = true → No two users can have the same email.
     *        If you try to register with an existing email, PostgreSQL
     *        will throw a unique constraint violation error.
     */
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    /*
     * The BCrypt-hashed password. We NEVER store plain-text passwords!
     * 
     * When a user registers with password "MyPass123":
     *   1. Spring Security hashes it → "$2a$10$EqKcp1WFKqG..."
     *   2. We store the HASH, not the original password
     *   3. When they log in, we hash the input again and COMPARE hashes
     *
     * Even if a hacker steals the database, they can't reverse the hash
     * to get the original passwords. BCrypt is intentionally SLOW to compute,
     * making brute-force attacks impractical.
     */
    @NotBlank(message = "Password is required")
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    /*
     * @Enumerated(EnumType.STRING)
     *     This is CRITICAL. Without it, Hibernate would store enums as
     *     integers (0, 1, 2) instead of readable text ("ROLE_STUDENT").
     *
     *     EnumType.ORDINAL (default): ROLE_STUDENT=0, ROLE_ALUMNI=1, ROLE_ADMIN=2
     *       → DANGEROUS! If you reorder the enum values, all database data breaks!
     *
     *     EnumType.STRING (what we use): Stores "ROLE_STUDENT", "ROLE_ALUMNI", etc.
     *       → SAFE! Reordering enum values doesn't affect existing data.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_status", nullable = false, length = 20)
    private AccountStatus accountStatus;

    /*
     * Fields common to both Students and Alumni.
     * These are NULLABLE (no @NotBlank) — they're optional during registration
     * and can be filled in later on the profile page.
     */
    @Column(name = "batch_year")
    private Integer batchYear;

    @Size(max = 100)
    @Column(length = 100)
    private String department;

    /*
     * Alumni-specific fields.
     * These are only filled when role = ROLE_ALUMNI.
     * For students, these will be NULL in the database.
     */
    @Size(max = 150)
    @Column(length = 150)
    private String company;

    @Size(max = 255)
    @Column(name = "linkedin_url", length = 255)
    private String linkedinUrl;

    /* Optional profile fields for Phase 2. */
    @Column(columnDefinition = "TEXT")
    private String bio;

    @Size(max = 500)
    @Column(name = "profile_image", length = 500)
    private String profileImage;

    /*
     * @CreationTimestamp — Hibernate automatically sets this to the current
     *                      date/time when the entity is FIRST saved (INSERT).
     *                      You never set this manually.
     *
     * @UpdateTimestamp — Hibernate automatically updates this to the current
     *                    date/time whenever the entity is MODIFIED (UPDATE).
     *
     * LocalDateTime — Java's modern date-time class (replaces the old java.util.Date).
     *                 Stores both date and time: "2026-06-11T14:30:00"
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;


    // ============================================================
    // 🏗️ CONSTRUCTORS
    // ============================================================
    /*
     * Every JPA entity MUST have a no-argument constructor.
     * Hibernate uses it internally to create User objects when
     * reading data from the database. It's like Hibernate saying:
     * "Let me create an empty User, then I'll fill in the fields."
     *
     * "protected" means only Hibernate (and subclasses) can use it,
     * not our own code — we'll use the parameterized constructor below.
     */
    protected User() {
        // Required by JPA — do not delete!
    }

    /*
     * This constructor is for US to use when creating new users
     * (e.g., during registration). We pass in the essential fields.
     */
    public User(String fullName, String email, String passwordHash, Role role) {
        this.fullName = fullName;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.accountStatus = AccountStatus.PENDING; // New users always start as PENDING
    }


    // ============================================================
    // 📖 GETTERS AND SETTERS
    // ============================================================
    /*
     * WHY DO WE NEED THESE?
     * In Java, making fields "private" hides them from the outside world.
     * Getters (read) and setters (write) are the controlled doors to access them.
     *
     * This pattern is called "Encapsulation" — one of the 4 pillars of
     * Object-Oriented Programming (OOP). It lets us:
     * - Add validation logic (e.g., setEmail could check format)
     * - Change internal implementation without breaking other classes
     * - Control read-only vs read-write access
     *
     * NAMING CONVENTION:
     * - Getter: get + FieldName → getFullName()
     * - Setter: set + FieldName → setFullName(String fullName)
     * - Boolean getter: is + FieldName → isActive() (not used here)
     *
     * In real-world projects, a library called "Lombok" can auto-generate
     * all these getters/setters with a single @Data annotation. But for
     * learning, it's valuable to write them manually to understand the pattern.
     */

    public Long getId() {
        return id;
    }

    // No setId() — the database generates the ID, we should never change it manually.

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public AccountStatus getAccountStatus() {
        return accountStatus;
    }

    public void setAccountStatus(AccountStatus accountStatus) {
        this.accountStatus = accountStatus;
    }

    public Integer getBatchYear() {
        return batchYear;
    }

    public void setBatchYear(Integer batchYear) {
        this.batchYear = batchYear;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getLinkedinUrl() {
        return linkedinUrl;
    }

    public void setLinkedinUrl(String linkedinUrl) {
        this.linkedinUrl = linkedinUrl;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    // No setCreatedAt() or setUpdatedAt() — Hibernate manages these automatically.
}
