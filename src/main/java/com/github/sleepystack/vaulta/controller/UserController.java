package com.github.sleepystack.vaulta.controller;

import com.github.sleepystack.vaulta.dto.ChangePasswordDTO;
import com.github.sleepystack.vaulta.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @Valid @RequestBody ChangePasswordDTO request,
            Authentication authentication) {
        String email = authentication.getName();
        userService.changePassword(
                email,
                request.currentPassword(),
                request.newPassword(),
                request.confirmPassword()
        );
        return ResponseEntity.ok("Password changed successfully");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id){
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
