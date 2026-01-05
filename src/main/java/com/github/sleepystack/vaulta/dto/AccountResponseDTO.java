package com.github.sleepystack.vaulta.dto;

import com.github.sleepystack.vaulta.entity.enumeration.AccountType;
import java.math.BigDecimal;

public record AccountResponseDTO(
        String accountNumber,
        AccountType accountType,
        BigDecimal balance,
        String username
) {}