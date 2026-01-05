package com.github.sleepystack.vaulta.service;

import com.github.sleepystack.vaulta.dto.AuthRequestDTO;
import com.github.sleepystack.vaulta.dto.AuthResponseDTO;
import com.github.sleepystack.vaulta.dto.UserRegistrationDTO;
import com.github.sleepystack.vaulta.entity.SecureUser;
import com.github.sleepystack.vaulta.entity.User;
import com.github.sleepystack.vaulta.entity.enumeration.Role;
import com.github.sleepystack.vaulta.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserService userService;

    public AuthResponseDTO register(UserRegistrationDTO request) {
        User user = userService.registerUser(request);

        var jwtToken = jwtService.generateToken(new SecureUser(user));

        return new AuthResponseDTO(jwtToken);
    }

    public AuthResponseDTO authenticate(AuthRequestDTO request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        var user = userRepository.findByEmail(request.email())
                .orElseThrow();
        String token = jwtService.generateToken(new SecureUser(user));
        return new AuthResponseDTO(token);
    }
}
