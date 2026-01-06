package com.github.sleepystack.vaulta.controller;

import com.github.sleepystack.vaulta.dto.AccountResponseDTO;
import com.github.sleepystack.vaulta.dto.AdminForcePassResetDTO;
import com.github.sleepystack.vaulta.dto.AdminStatsResponse;
import com.github.sleepystack.vaulta.dto.TransactionResponseDTO;
import com.github.sleepystack.vaulta.dto.UserManagementDTO;
import com.github.sleepystack.vaulta.entity.enumeration.Status;
import com.github.sleepystack.vaulta.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getSystemStats() {
        return ResponseEntity.ok(adminService.getSystemStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserManagementDTO>> getAllUsersForManagement() {
        return ResponseEntity.ok(adminService.getAllUsersForManagement());
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<String> toggleUserStatus(@PathVariable Long id) {
        String message = adminService.toggleUserStatus(id);
        return ResponseEntity.ok(message);
    }

    @PatchMapping("/users/{userId}/status-update")
    public ResponseEntity<String> updateUserStatus(
            @PathVariable Long userId,
            @RequestParam Status newStatus) {
        adminService.updateUserStatus(userId, newStatus);
        return ResponseEntity.ok("User status updated to " + newStatus);
    }

    @GetMapping("/accounts")
    public ResponseEntity<List<AccountResponseDTO>> getAllAccounts() {
        return ResponseEntity.ok(adminService.getAllAccounts());
    }

    @PatchMapping("/accounts/{accountNumber}/status")
    public ResponseEntity<String> updateAccountStatus(
            @PathVariable String accountNumber,
            @RequestParam Status newStatus) {
        adminService.updateAccountStatus(accountNumber, newStatus);
        return ResponseEntity.ok("Account " + accountNumber + " status updated to " + newStatus);
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<TransactionResponseDTO>> getGlobalTransactionHistory() {
        return ResponseEntity.ok(adminService.getAllTransactions());
    }

    @PostMapping("/users/{userId}/promote")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> promoteUser(@PathVariable Long userId) {
        adminService.promoteToAdmin(userId);
        return ResponseEntity.ok("User promoted to ADMIN successfully.");
    }

    @PostMapping("/users/{userId}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> resetPassword(
            @PathVariable Long userId,
            @RequestBody AdminForcePassResetDTO request) {

        adminService.resetUserPassword(userId, request.tempPassword());
        return ResponseEntity.ok("Password reset successfully.");
    }
}