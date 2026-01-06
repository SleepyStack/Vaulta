package com.github.sleepystack.vaulta.service;

import com.github.sleepystack.vaulta.dto.AuthRequestDTO;
import com.github.sleepystack.vaulta.dto.AuthResponseDTO;
import com.github.sleepystack.vaulta.dto.UserRegistrationDTO;
import com.github.sleepystack.vaulta.entity.SecureUser;
import com.github.sleepystack.vaulta.entity.User;
import com.github.sleepystack.vaulta.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserService userService;

    public AuthResponseDTO register(UserRegistrationDTO request) {
        User user = userService.registerUser(request);
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("v", user.getTokenVersion());
        var jwtToken = jwtService.generateToken(extraClaims, new SecureUser(user));

        return new AuthResponseDTO(jwtToken,user.getUsername(),user.getEmail(),user.getRole().name());
    }

    public AuthResponseDTO authenticate(AuthRequestDTO request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        var user = userRepository.findByEmail(request.email())
                .orElseThrow();
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("v", user.getTokenVersion());
        String token = jwtService.generateToken(extraClaims, new SecureUser(user));

        return new AuthResponseDTO(token,user.getUsername(),user.getEmail(),user.getRole().name());
    }
}