package com.github.sleepystack.vaulta.service;

import com.github.sleepystack.vaulta.dto.AccountRequestDTO;
import com.github.sleepystack.vaulta.dto.AccountResponseDTO;
import com.github.sleepystack.vaulta.entity.Account;
import com.github.sleepystack.vaulta.entity.User;
import com.github.sleepystack.vaulta.entity.enumeration.Status;
import com.github.sleepystack.vaulta.exception.AccountNotFoundException;
import com.github.sleepystack.vaulta.exception.BusinessLogicException;
import com.github.sleepystack.vaulta.exception.UserNotFoundException;
import com.github.sleepystack.vaulta.repository.AccountRepository;
import com.github.sleepystack.vaulta.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    @Transactional
    public AccountResponseDTO openAccount(AccountRequestDTO request, String currentUserEmail) {
        log.info("Opening {} account for user: {}", request.accountType(), currentUserEmail);

        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new UserNotFoundException("Authenticated user not found"));
        user.ensureCanPerformActions();
        boolean alreadyHasType = user.getAccounts().stream()
                .anyMatch(a -> a.getAccountType().equals(request.accountType()));

        if (alreadyHasType) {
            throw new BusinessLogicException("User already has a " + request.accountType() + " account");
        }

        String newAccountNumber = generateUniqueAccountNumber();

        Account account = new Account();
        account.setAccountNumber(newAccountNumber);
        account.setAccountType(request.accountType());
        account.setBalance(request.initialDeposit() != null ? request.initialDeposit() : BigDecimal.ZERO);
        account.setUser(user);
        account.setStatus(Status.ACTIVE);

        user.addAccount(account);
        accountRepository.save(account);

        log.info("Account {} created for {}", newAccountNumber, user.getUsername());

        return new AccountResponseDTO(
                account.getAccountNumber(),
                account.getAccountType(),
                account.getBalance(),
                user.getUsername()
        );
    }

    private String generateUniqueAccountNumber() {
        String number;
        do {
            number = "888" + String.format("%07d", ThreadLocalRandom.current().nextInt(10000000));
        } while (accountRepository.findByAccountNumber(number).isPresent());
        return number;
    }

    @Transactional(readOnly = true)
    public List<AccountResponseDTO> getMyAccounts(String email) {
        log.info("Fetching all accounts for user: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        user.ensureCanPerformActions();
        return user.getAccounts().stream()
                .map(acc -> new AccountResponseDTO(
                        acc.getAccountNumber(),
                        acc.getAccountType(),
                        acc.getBalance(),
                        user.getUsername()
                )).toList();
    }

    @Transactional(readOnly = true)
    public AccountResponseDTO getAccountDetails(String accountNumber, String email) {
        log.info("Fetching details for account: {}", accountNumber);
        Account acc = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account not found"));

        if (!acc.getUser().getEmail().equals(email)) {
            throw new BusinessLogicException("Access denied: You do not own this account");
        }

        return new AccountResponseDTO(
                acc.getAccountNumber(),
                acc.getAccountType(),
                acc.getBalance(),
                acc.getUser().getUsername()
        );
    }

    @Transactional
    public void closeAccount(String accountNumber, String currentUserEmail) {
        Account acc = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account Not Found"));

        if (!acc.getUser().getEmail().equals(currentUserEmail)) {
            throw new BusinessLogicException("Access denied: You do not own this account");
        }

        if(acc.getBalance().compareTo(BigDecimal.ZERO) != 0) {
            throw new BusinessLogicException("Balance must be zero before closing");
        }

        acc.setStatus(Status.CLOSED);
        accountRepository.delete(acc);
        log.info("Account {} closed by {}", accountNumber, currentUserEmail);
    }

    @Transactional(readOnly = true)
    public List<AccountResponseDTO> getAccountsByUserEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        user.ensureCanPerformActions();
        return user.getAccounts().stream()
                .map(acc -> new AccountResponseDTO(
                        acc.getAccountNumber(),
                        acc.getAccountType(),
                        acc.getBalance(),
                        user.getUsername()
                )).toList();
    }
}
