package com.github.sleepystack.vaulta.dto;

import com.github.sleepystack.vaulta.entity.enumeration.AccountType;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class AccountResponseDTO {
    private String accountNumber;
    private AccountType accountType;
    private BigDecimal balance;
    private String username;
}
