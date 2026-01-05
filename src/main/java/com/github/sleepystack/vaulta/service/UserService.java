package com.github.sleepystack.vaulta.service;

import com.github.sleepystack.vaulta.dto.UserRegistrationDTO;
import com.github.sleepystack.vaulta.dto.UserResponseDTO;
import com.github.sleepystack.vaulta.entity.Account;
import com.github.sleepystack.vaulta.entity.User;
import com.github.sleepystack.vaulta.entity.enumeration.Role;
import com.github.sleepystack.vaulta.entity.enumeration.Status;
import com.github.sleepystack.vaulta.exception.BusinessLogicException;
import com.github.sleepystack.vaulta.exception.ExistingCredentialsException;
import com.github.sleepystack.vaulta.exception.UserNotFoundException;
import com.github.sleepystack.vaulta.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final AccountService accountService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User registerUser(UserRegistrationDTO user) { // Return the Entity
        log.info("Registering new user with username: {}", user.username());
        if(userRepository.findByUsername(user.username()).isPresent()){
            throw new ExistingCredentialsException("Username already exists");
        }
        if(userRepository.findByEmail(user.email()).isPresent()){
            throw new ExistingCredentialsException("Email already exists");
        }
        User u = new User();
        u.setUsername(user.username());
        u.setEmail(user.email());
        u.setPassword(passwordEncoder.encode(user.password()));
        u.setStatus(Status.ACTIVE);
        u.setRole(Role.USER);

        return userRepository.save(u);
    }

    public void changePassword(String email, String oldPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BusinessLogicException("Incorrect current password.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userId));

        BigDecimal totalBalance = user.getAccounts().stream()
                .map(Account::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalBalance.compareTo(BigDecimal.ZERO) != 0) {
            throw new BusinessLogicException("Cannot delete user with non-zero balance: " + totalBalance);
        }

        user.getAccounts().forEach(account ->
                accountService.closeAccount(account.getAccountNumber(), user.getEmail())
        );

        user.setStatus(Status.CLOSED);
        userRepository.delete(user);

        log.info("User {} and all accounts successfully closed via AccountService.", userId);
    }
}
