package com.github.sleepystack.vaulta.dto;

import com.github.sleepystack.vaulta.entity.enumeration.AccountType;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record AccountRequestDTO(
        @NotNull(message = "User ID is required")
        Long userId,

        @NotNull(message = "Account type is required") // Changed to @NotNull for Enums
        AccountType accountType,

        BigDecimal initialDeposit
) {}