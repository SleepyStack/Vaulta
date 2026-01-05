package com.github.sleepystack.vaulta.service;

import com.github.sleepystack.vaulta.dto.AccountResponseDTO;
import com.github.sleepystack.vaulta.dto.TransactionResponseDTO;
import com.github.sleepystack.vaulta.dto.UserResponseAdminDTO;
import com.github.sleepystack.vaulta.entity.Account;
import com.github.sleepystack.vaulta.entity.User;
import com.github.sleepystack.vaulta.entity.enumeration.Role;
import com.github.sleepystack.vaulta.entity.enumeration.Status;
import com.github.sleepystack.vaulta.exception.AccountNotFoundException;
import com.github.sleepystack.vaulta.exception.UserNotFoundException;
import com.github.sleepystack.vaulta.repository.AccountRepository;
import com.github.sleepystack.vaulta.repository.TransactionRepository;
import com.github.sleepystack.vaulta.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class AdminService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final PasswordEncoder passwordEncoder;

    // --- USER ACTIONS ---

    public List<UserResponseAdminDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> new UserResponseAdminDTO(
                        user.getId(),
                        user.getUsername(),
                        user.getEmail(),
                        user.getStatus(),
                        user.getRole()
                )).toList();
    }

    public void updateUserStatus(Long userId, Status newStatus) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        log.info("ADMIN: Updating status of user {} to {}", user.getUsername(), newStatus);
        user.setStatus(newStatus);
        userRepository.save(user);
    }

    // --- ACCOUNT ACTIONS ---

    public List<AccountResponseDTO> getAllAccounts() {
        return accountRepository.findAll().stream()
                .map(acc -> new AccountResponseDTO(
                        acc.getAccountNumber(),
                        acc.getAccountType(),
                        acc.getBalance(),
                        acc.getUser().getUsername()
                )).toList();
    }

    public void updateAccountStatus(String accountNumber, Status newStatus) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account not found"));
        log.info("ADMIN: Updating status of account {} to {}", accountNumber, newStatus);
        account.setStatus(newStatus);
        accountRepository.save(account);
    }

    // --- GLOBAL AUDIT ---

    public List<TransactionResponseDTO> getAllTransactions() {
        return transactionRepository.findAll().stream()
                .map(t -> new TransactionResponseDTO(
                        t.getType().name(),
                        t.getAmount(),
                        t.getFromAccountNumber(),
                        t.getToAccountNumber(),
                        t.getTimestamp()
                )).toList();
    }

    public void promoteToAdmin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        log.info("ADMIN ACTION: Promoting user {} to ADMIN role", user.getUsername());
        user.setRole(Role.ADMIN);
        userRepository.save(user);
    }

    public void resetUserPassword(Long userId, String newRawPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        log.info("ADMIN ACTION: Force resetting password for user: {}", user.getUsername());

        user.setPassword(passwordEncoder.encode(newRawPassword));
        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.save(user);
    }
}