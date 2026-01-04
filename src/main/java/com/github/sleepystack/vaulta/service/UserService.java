package com.github.sleepystack.vaulta.service;

import com.github.sleepystack.vaulta.dto.UserRegistrationDTO;
import com.github.sleepystack.vaulta.dto.UserResponseDTO;
import com.github.sleepystack.vaulta.entity.Account;
import com.github.sleepystack.vaulta.entity.User;
import com.github.sleepystack.vaulta.entity.enumeration.Status;
import com.github.sleepystack.vaulta.exception.BusinessLogicException;
import com.github.sleepystack.vaulta.exception.ExistingCredentialsException;
import com.github.sleepystack.vaulta.exception.UserNotFoundException;
import com.github.sleepystack.vaulta.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final AccountService accountService;

    @Transactional
    public UserResponseDTO registerUser(UserRegistrationDTO user){
        log.info("Registering new user with username: {}", user.getUsername());
        if(userRepository.findByUsername(user.getUsername()).isPresent()){
            log.warn("Registration failed: Username {} already exists", user.getUsername());
            throw new ExistingCredentialsException("Invalid registration details. Please try again or recover your account.");

        }
        if(userRepository.findByEmail(user.getEmail()).isPresent()){
            log.warn("Registration failed: Email {} already exists", user.getEmail());
            throw new ExistingCredentialsException("Invalid registration details. Please try again or recover your account.");
        }

        User u = new User();
        u.setUsername(user.getUsername());
        u.setEmail(user.getEmail());
        u.setPassword(user.getPassword()); /** hash this **/
        u.setStatus(Status.ACTIVE);
        User rgUser = userRepository.save(u);
        log.info("User registered successfully with details: ID: {}, Username: {}, Email : {}", rgUser.getId(), rgUser.getUsername(), rgUser.getEmail());
        return new UserResponseDTO(rgUser.getId(), rgUser.getUsername(), rgUser.getEmail());
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
                accountService.closeAccount(account.getAccountNumber())
        );

        user.setStatus(Status.CLOSED);
        userRepository.delete(user);

        log.info("User {} and all accounts successfully closed via AccountService.", userId);
    }
}
