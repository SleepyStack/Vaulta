package com.github.sleepystack.vaulta.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransactionResponseDTO(
        Long id,
        String type,
        BigDecimal amount,
        String fromAccountNumber,
        String toAccountNumber,
        LocalDateTime timestamp
) {}