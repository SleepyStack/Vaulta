package com.github.sleepystack.vaulta.service;

import com.github.sleepystack.vaulta.entity.Account;
import com.github.sleepystack.vaulta.entity.Transaction;
import com.github.sleepystack.vaulta.exception.InsufficientFundsException;
import com.github.sleepystack.vaulta.repository.AccountRepository;
import com.github.sleepystack.vaulta.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private TransactionService transactionService;

    private Account sourceAccount;
    private Account targetAccount;

    @BeforeEach
    void setUp() {
        sourceAccount = new Account();
        sourceAccount.setAccountNumber("ACC123");
        sourceAccount.setBalance(new BigDecimal("500.00"));

        targetAccount = new Account();
        targetAccount.setAccountNumber("ACC456");
        targetAccount.setBalance(new BigDecimal("100.00"));
    }

    @Test
    void transfer_ShouldSucceed_WhenFundsAreAvailable() {
        BigDecimal amount = new BigDecimal("200.00");
        when(accountRepository.findByAccountNumber("ACC123")).thenReturn(Optional.of(sourceAccount));
        when(accountRepository.findByAccountNumber("ACC456")).thenReturn(Optional.of(targetAccount));

        transactionService.transfer("ACC123", "ACC456", amount);

        assertEquals(new BigDecimal("300.00"), sourceAccount.getBalance()); // 500 - 200
        assertEquals(new BigDecimal("300.00"), targetAccount.getBalance()); // 100 + 200

        verify(transactionRepository, times(3)).save(any(Transaction.class));
    }

    @Test
    void transfer_ShouldThrowException_WhenFundsAreInsufficient() {
        BigDecimal amount = new BigDecimal("1000.00"); // More than the 500 balance
        when(accountRepository.findByAccountNumber("ACC123")).thenReturn(Optional.of(sourceAccount));

        assertThrows(InsufficientFundsException.class,
                () -> transactionService.transfer("ACC123", "ACC456", amount));

        assertEquals(new BigDecimal("500.00"), sourceAccount.getBalance());
        verify(transactionRepository, never()).save(any());
    }

    @Test
    void transfer_ShouldSucceed_AndRecordAuditTrail() {
        BigDecimal amount = new BigDecimal("100.00");
        when(accountRepository.findByAccountNumber("ACC123")).thenReturn(Optional.of(sourceAccount));
        when(accountRepository.findByAccountNumber("ACC456")).thenReturn(Optional.of(targetAccount));

        transactionService.transfer("ACC123", "ACC456", amount);

        assertEquals(new BigDecimal("400.00"), sourceAccount.getBalance()); // 500 - 100
        assertEquals(new BigDecimal("200.00"), targetAccount.getBalance()); // 100 + 100

        verify(transactionRepository, times(3)).save(any(Transaction.class));
    }

    @Test
    void withdraw_ShouldThrow_WhenBalanceIsTooLow() {
        BigDecimal bigAmount = new BigDecimal("1000.00");
        when(accountRepository.findByAccountNumber("ACC123")).thenReturn(Optional.of(sourceAccount));

        assertThrows(InsufficientFundsException.class, () -> {
            transactionService.withdraw("ACC123", bigAmount);
        });

        assertEquals(new BigDecimal("500.00"), sourceAccount.getBalance());
        verify(transactionRepository, never()).save(any());
    }
}
