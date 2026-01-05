package com.github.sleepystack.vaulta.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record TransactionDTO(
        @NotBlank(message = "Account number is required")
        String accountNumber,

        String targetAccountNumber,

        @NotNull(message = "Transaction amount is required")
        @Positive(message = "Amount must be greater than zero")
        BigDecimal amount
) {}