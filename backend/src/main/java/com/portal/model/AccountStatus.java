package com.portal.model;

/*
 * ============================================================
 * 🚦 AccountStatus.java — Account Approval Status Enum
 * ============================================================
 * Every new user starts as PENDING. Only an Admin can change
 * their status to APPROVED (can log in) or REJECTED (blocked).
 *
 * This is the "gatekeeping" mechanism:
 *
 *   User registers → status = PENDING → can't log in
 *                          ↓
 *   Admin clicks "Approve" → status = APPROVED → can log in! ✅
 *                     or
 *   Admin clicks "Reject"  → status = REJECTED → permanently blocked ❌
 *
 * In the login flow (AuthService), we CHECK this status:
 *   if (user.getAccountStatus() != AccountStatus.APPROVED) {
 *       throw new Exception("Account not approved yet!");
 *   }
 * ============================================================
 */
public enum AccountStatus {

    PENDING,    // Just registered, waiting for admin approval
    APPROVED,   // Admin approved — user can log in and use the portal
    REJECTED    // Admin rejected — user is blocked from logging in
}
