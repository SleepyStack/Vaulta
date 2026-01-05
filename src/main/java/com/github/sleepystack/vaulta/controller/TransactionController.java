package com.github.sleepystack.vaulta.controller;

import com.github.sleepystack.vaulta.dto.TransactionDTO;
import com.github.sleepystack.vaulta.dto.TransactionResponseDTO;
import com.github.sleepystack.vaulta.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/deposit")
    public ResponseEntity<String> deposit(@Valid @RequestBody TransactionDTO t) {
        transactionService.deposit(t.accountNumber(), t.amount());
        return ResponseEntity.ok("Deposit of " + t.amount() + " successful.");
    }

    @PostMapping("/withdraw")
    public ResponseEntity<String> withdraw(@Valid @RequestBody TransactionDTO t, Authentication authentication) {
        transactionService.withdraw(t.accountNumber(), t.amount(), authentication.getName());
        return ResponseEntity.ok("Withdrawal of " + t.amount() + " successful.");
    }

    @PostMapping("/transfer")
    public ResponseEntity<String> transfer(@Valid @RequestBody TransactionDTO t, Authentication authentication) {
        transactionService.transfer(
                t.accountNumber(),
                t.targetAccountNumber(),
                t.amount(),
                authentication.getName()
        );
        return ResponseEntity.ok("Successfully transferred " + t.amount() + " to " + t.targetAccountNumber());
    }

    @GetMapping("/{accountNumber}/history")
    public ResponseEntity<List<TransactionResponseDTO>> getTransactionHistory(
            @PathVariable String accountNumber,
            Authentication authentication
    ) {
        String currentUserEmail = authentication.getName();
        List<TransactionResponseDTO> history = transactionService.getHistory(accountNumber, currentUserEmail);
        return ResponseEntity.ok(history);
    }
}
