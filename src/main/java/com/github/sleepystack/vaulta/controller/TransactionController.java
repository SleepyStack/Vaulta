package com.github.sleepystack.vaulta.controller;

import com.github.sleepystack.vaulta.dto.TransactionDTO;
import com.github.sleepystack.vaulta.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/deposit")
    public ResponseEntity<Void> deposit(@Valid @RequestBody TransactionDTO t) {
        transactionService.deposit(t.accountNumber(), t.amount());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/withdraw")
    public ResponseEntity<Void> withdraw(@Valid @RequestBody TransactionDTO t) {
        transactionService.withdraw(t.accountNumber(), t.amount());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/transfer")
    public ResponseEntity<Void> transfer(@Valid @RequestBody TransactionDTO t) {
        transactionService.transfer(
                t.accountNumber(),
                t.targetAccountNumber(),
                t.amount()
        );
        return ResponseEntity.ok().build();
    }
}
