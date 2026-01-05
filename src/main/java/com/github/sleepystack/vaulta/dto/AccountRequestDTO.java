package com.github.sleepystack.vaulta.dto;

import com.github.sleepystack.vaulta.entity.enumeration.AccountType;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record AccountRequestDTO(
        @NotNull(message = "Account type is required")
        AccountType accountType,

        BigDecimal initialDeposit
) {}