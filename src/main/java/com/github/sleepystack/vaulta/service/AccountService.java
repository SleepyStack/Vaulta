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
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    @Transactional
    public AccountResponseDTO openAccount(AccountRequestDTO request) {
        log.info("Attempting to open a {} account for User ID: {}", request.accountType(), request.userId());

        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> {
                    log.error("Account creation failed: User ID {} not found", request.userId());
                    return new UserNotFoundException("User Not Found");
                });

        String newAccountNumber = "888" + String.format("%07d", ThreadLocalRandom.current().nextInt(10000000));

        while (accountRepository.findByAccountNumber(newAccountNumber).isPresent()) {
            newAccountNumber = "888" + String.format("%07d", ThreadLocalRandom.current().nextInt(10000000));
        }

        Account account = new Account();
        account.setAccountNumber(newAccountNumber);
        account.setAccountType(request.accountType());
        account.setBalance(request.initialDeposit() != null ? request.initialDeposit() : BigDecimal.ZERO);
        account.setUser(user);
        account.setStatus(Status.ACTIVE);

        user.addAccount(account);

        accountRepository.save(account);
        log.info("Successfully created account {} for user {}", newAccountNumber, user.getUsername());

        return new AccountResponseDTO(
                account.getAccountNumber(),
                account.getAccountType(),
                account.getBalance(),
                user.getUsername()
        );
    }

    @Transactional
    public void closeAccount(String accountNumber) {
        log.info("Attempting to close account by account number : {}", accountNumber);
        Account acc = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account Not Found"));
        if(acc.getBalance().compareTo(BigDecimal.ZERO) != 0) {
            log.info("Account failed to close : Non-Zero balance");
            throw new BusinessLogicException("Balance Must Be Zero Before Closing of Account");
        }
        acc.setStatus(Status.CLOSED);
        accountRepository.delete(acc);
        log.info("Successfully closed account by account number : {}", accountNumber);
    }
}
