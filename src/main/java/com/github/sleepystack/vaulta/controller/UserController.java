package com.github.sleepystack.vaulta.controller;

import com.github.sleepystack.vaulta.dto.ChangePasswordDTO;
import com.github.sleepystack.vaulta.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PatchMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @RequestBody ChangePasswordDTO request, // Use @RequestBody here!
            Authentication authentication) {

        userService.changePassword(
                authentication.getName(),
                request.oldPassword(),
                request.newPassword()
        );

        return ResponseEntity.ok("Password updated successfully.");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id){
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
