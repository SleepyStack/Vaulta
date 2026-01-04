package com.github.sleepystack.vaulta.dto;

import com.github.sleepystack.vaulta.entity.enumeration.AccountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AccountRequestDTO {
    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Account type is required")
    @Pattern(regexp = "SAVINGS|CHECKING", message = "Type must be SAVINGS or CHECKING")
    private AccountType accountType;

    private BigDecimal initialDeposit;
}
