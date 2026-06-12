package com.portal.dto;

/*
 * ============================================================
 * ✅❌ UserStatusUpdateRequest.java — Approve or Reject
 * ============================================================
 * When the admin clicks "Approve" or "Reject", the frontend sends:
 * {
 *   "status": "APPROVED"    ← or "REJECTED"
 * }
 *
 * This tiny DTO carries just that one piece of data.
 * We validate that it's not blank — the admin MUST specify a status.
 * ============================================================
 */

import jakarta.validation.constraints.NotBlank;

public class UserStatusUpdateRequest {

    @NotBlank(message = "Status is required (APPROVED or REJECTED)")
    private String status;  // "APPROVED" or "REJECTED" — parsed to AccountStatus enum in the service

    // --- Getter and Setter ---

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
