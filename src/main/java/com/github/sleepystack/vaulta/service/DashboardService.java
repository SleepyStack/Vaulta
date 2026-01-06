package com.github.sleepystack.vaulta.service;

import com.github.sleepystack.vaulta.dto.DashboardSummaryDTO;
import com.github.sleepystack.vaulta.dto.TransactionDTO;
import com.github.sleepystack.vaulta.entity.Account;
import com.github.sleepystack.vaulta.entity.User;
import com.github.sleepystack.vaulta.exception.UserNotFoundException;
import com.github.sleepystack.vaulta.repository.TransactionRepository;
import com.github.sleepystack.vaulta.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    public DashboardSummaryDTO getDashboardSummary(String email) {
        log.info("Fetching dashboard summary for user: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        user.ensureCanPerformActions();

        // Calculate total balance across all accounts
        BigDecimal totalBalance = user.getAccounts().stream()
                .map(Account::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Get primary account (first CHECKING account, or first account if no CHECKING)
        String primaryAccountNumber = user.getAccounts().stream()
                .filter(acc -> acc.getAccountType().name().equals("CHECKING"))
                .findFirst()
                .or(() -> user.getAccounts().stream().findFirst())
                .map(Account::getAccountNumber)
                .orElse(null);

        // Get recent transactions (last 5 from all accounts)
        List<String> accountNumbers = user.getAccounts().stream()
                .map(Account::getAccountNumber)
                .toList();

        List<TransactionDTO> recentTransactions = transactionRepository.findAll().stream()
                .filter(t -> accountNumbers.contains(t.getFromAccountNumber())
                        || accountNumbers.contains(t.getToAccountNumber()))
                .sorted((t1, t2) -> t2.getTimestamp().compareTo(t1.getTimestamp()))
                .limit(5)
                .map(t -> new TransactionDTO(
                        t.getFromAccountNumber() != null ? t.getFromAccountNumber() : t.getToAccountNumber(),
                        t.getToAccountNumber(),
                        t.getAmount()
                ))
                .collect(Collectors.toList());

        return new DashboardSummaryDTO(
                totalBalance,
                primaryAccountNumber,
                recentTransactions,
                user.getStatus().name()
        );
    }
}