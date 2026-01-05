package com.github.sleepystack.vaulta.service;

import com.github.sleepystack.vaulta.entity.Account;
import com.github.sleepystack.vaulta.entity.Transaction;
import com.github.sleepystack.vaulta.entity.enumeration.TransactionType;
import com.github.sleepystack.vaulta.exception.AccountNotFoundException;
import com.github.sleepystack.vaulta.exception.InsufficientFundsException;
import com.github.sleepystack.vaulta.repository.AccountRepository;
import com.github.sleepystack.vaulta.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

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

        account.setBalance(account.getBalance().add(amount));
        log.info("Account deposit: {}, {}", account.getAccountNumber(), amount);
        saveTransaction(TransactionType.DEPOSIT, null, accountNumber, amount);
    }

    @Transactional
    public void withdraw(String accountNumber, BigDecimal amount) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account not found"));

        if (account.getBalance().compareTo(amount) < 0) {
            throw new InsufficientFundsException("Insufficient funds for withdrawal");
        }

        account.setBalance(account.getBalance().subtract(amount));
        log.info("Account withdrawal: {}, {}", account.getAccountNumber(), amount);
        saveTransaction(TransactionType.WITHDRAWAL, accountNumber, null, amount);
    }

    @Transactional
    public void transfer(String fromAccount, String toAccount, BigDecimal amount) {
        withdraw(fromAccount, amount);
        deposit(toAccount, amount);
        log.info("Transfer from: {}, to: {}, amount : {}", fromAccount, toAccount, amount);
        saveTransaction(TransactionType.TRANSFER, fromAccount, toAccount, amount);
    }

    private void saveTransaction(TransactionType type, String from, String to, BigDecimal amount) {
        Transaction t = Transaction.builder()
                .type(type)
                .fromAccountNumber(from)
                .toAccountNumber(to)
                .amount(amount)
                .build();
        transactionRepository.save(t);
    }
}
