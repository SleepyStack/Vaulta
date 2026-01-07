package com.github.sleepystack.vaulta.controller;

import com.github.sleepystack.vaulta.dto.AuthRequestDTO;
import com.github.sleepystack.vaulta.dto.AuthResponseDTO;
import com.github.sleepystack.vaulta.dto.UserRegistrationDTO;
import com.github.sleepystack.vaulta.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody UserRegistrationDTO request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> authenticate(@Valid @RequestBody AuthRequestDTO r) {
        return ResponseEntity.ok(authService.authenticate(r));
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(Authentication authentication) {
       return authService.logout(authentication.getName());
    }
}
