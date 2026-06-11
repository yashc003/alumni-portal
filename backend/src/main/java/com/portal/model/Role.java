package com.portal.model;

/*
 * ============================================================
 * 🎭 Role.java — User Role Enum
 * ============================================================
 * This enum defines the THREE types of users in our system.
 *
 * WHY AN ENUM?
 * Instead of storing roles as plain strings (which can have typos),
 * enums give us a FIXED set of valid values. If you try to use a
 * role that doesn't exist, Java catches the error at compile time.
 *
 * WHY THE "ROLE_" PREFIX?
 * Spring Security has a convention: role names MUST start with "ROLE_".
 * When you use @PreAuthorize("hasRole('ADMIN')"), Spring Security
 * internally looks for "ROLE_ADMIN". If we named it just "ADMIN",
 * the role check would fail. This is a common gotcha!
 *
 * HOW IT MAPS TO THE DATABASE:
 * Because we use @Enumerated(EnumType.STRING) on the User entity,
 * Hibernate stores the enum's NAME as a text string in PostgreSQL:
 *   ROLE_STUDENT → stored as the text "ROLE_STUDENT" in the 'role' column
 *   ROLE_ALUMNI  → stored as the text "ROLE_ALUMNI"
 *   ROLE_ADMIN   → stored as the text "ROLE_ADMIN"
 * ============================================================
 */
public enum Role {

    ROLE_STUDENT,   // Regular students (current batch)
    ROLE_ALUMNI,    // Graduated students (have company/LinkedIn fields)
    ROLE_ADMIN      // Class Coordinator — can approve/reject registrations
}
