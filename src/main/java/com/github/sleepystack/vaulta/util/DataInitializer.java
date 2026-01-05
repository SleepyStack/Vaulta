package com.github.sleepystack.vaulta.util;

import com.github.sleepystack.vaulta.entity.User;
import com.github.sleepystack.vaulta.entity.enumeration.Role;
import com.github.sleepystack.vaulta.entity.enumeration.Status;
import com.github.sleepystack.vaulta.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail("admin@vaulta.com").isEmpty()) {
            User admin = new User();
            admin.setUsername("SuperAdmin");
            admin.setEmail("admin@vaulta.com");
            admin.setPassword(passwordEncoder.encode("Admin123!"));
            admin.setRole(Role.ADMIN);
            admin.setStatus(Status.ACTIVE);

            userRepository.save(admin);
            System.out.println("✅ Super Admin created: admin@vaulta.com / Admin123!");
        }
    }
}