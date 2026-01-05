package com.github.sleepystack.vaulta.dto;

public record TransactionResponseDTO(
        String type,
        java.math.BigDecimal amount,
        String fromAccount,
        String toAccount,
        java.time.LocalDateTime timestamp
) {}
