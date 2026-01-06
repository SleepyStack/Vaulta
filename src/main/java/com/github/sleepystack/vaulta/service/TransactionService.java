package com.github.sleepystack.vaulta.service;

import com.github.sleepystack.vaulta.dto.TransactionResponseDTO;
import com.github.sleepystack.vaulta.entity.Account;
import com.github.sleepystack.vaulta.entity.Transaction;
import com.github.sleepystack.vaulta.entity.enumeration.TransactionType;
import com.github.sleepystack.vaulta.exception.AccountNotFoundException;
import com.github.sleepystack.vaulta.exception.BusinessLogicException;
import com.github.sleepystack.vaulta.exception.InsufficientFundsException;
import com.github.sleepystack.vaulta.repository.AccountRepository;
import com.github.sleepystack.vaulta.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    @Transactional
    public void deposit(String accountNumber, BigDecimal amount) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account not found"));
        account.ensureActive();
        account.setBalance(account.getBalance().add(amount));
        log.info("Deposit: {} into account {}", amount, accountNumber);

        saveTransaction(TransactionType.DEPOSIT, null, accountNumber, amount);
    }

    @Transactional
    public void withdraw(String accountNumber, BigDecimal amount, String currentUserEmail) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account not found"));
        account.ensureActive();
        if (!account.getUser().getEmail().equals(currentUserEmail)) {
            throw new BusinessLogicException("Unauthorized: You do not own this account");
        }

        if (account.getBalance().compareTo(amount) < 0) {
            throw new InsufficientFundsException("Insufficient funds");
        }

        account.setBalance(account.getBalance().subtract(amount));
        log.info("Withdrawal: {} from account {}", amount, accountNumber);

        saveTransaction(TransactionType.WITHDRAWAL, accountNumber, null, amount);
    }

    @Transactional
    public void transfer(String fromAccountNumber, String toAccountNumber, BigDecimal amount, String currentUserEmail) {
        withdraw(fromAccountNumber, amount, currentUserEmail);

        deposit(toAccountNumber, amount);

        log.info("Transfer: {} from {} to {}", amount, fromAccountNumber, toAccountNumber);

        saveTransaction(TransactionType.TRANSFER, fromAccountNumber, toAccountNumber, amount);
    }

    private void saveTransaction(TransactionType type, String from, String to, BigDecimal amount) {
        Transaction t = Transaction.builder()
                .type(type)
                .fromAccountNumber(from)
                .toAccountNumber(to)
                .amount(amount)
                .timestamp(java.time.LocalDateTime.now()) // Ensure timestamp is set
                .build();
        transactionRepository.save(t);
    }

    @Transactional(readOnly = true)
    public List<TransactionResponseDTO> getHistory(String accountNumber, String email) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account not found"));

        if (!account.getUser().getEmail().equals(email)) {
            throw new BusinessLogicException("Access denied");
        }

        return transactionRepository.findAll().stream()
                .filter(t -> accountNumber.equals(t.getFromAccountNumber())
                        || accountNumber.equals(t.getToAccountNumber()))
                .sorted((t1, t2) -> t2.getTimestamp().compareTo(t1.getTimestamp()))
                .map(t -> new TransactionResponseDTO(
                        t.getType().name(),
                        t.getAmount(),
                        t.getFromAccountNumber() != null ? t.getFromAccountNumber() : "DEPOSIT",
                        t.getToAccountNumber() != null ? t.getToAccountNumber() : "WITHDRAWAL",
                        t.getTimestamp()
                ))
                .toList();
    }
}
